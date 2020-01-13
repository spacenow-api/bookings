const AWS = require('aws-sdk')
const uuid = require('uuid')
const moment = require('moment')
const { Op } = require('sequelize')

const { log } = require('./../helpers/log.utils')

const { success, failure } = require('../libs/response-lib')
const {
  calcTotal,
  getDates,
  getEndDate,
  BookingStates,
  resolveBooking,
  getHourlyPeriod,
  hasBlockAvailabilities,
  hasBlockTime
} = require('../validations')
const { Bookings } = require('./../models')

const bookingService = require('./../services/booking.service')

const QUEUE_ULR = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`

const IS_ABSORVE = 0.035 // Guest Fee
const NO_ABSORVE = 0.135 // Host Fee

const getValidateBookings = async listingId => {
  const bookings = await Bookings.findAll({
    where: {
      listingId: listingId,
      bookingState: {
        [Op.in]: [BookingStates.PENDING, BookingStates.REQUESTED, BookingStates.ACCEPTED]
      }
    }
  })
  return bookings.map(resolveBooking)
}

module.exports.main = async (event, context, callback) => {
  const data = JSON.parse(event.body)

  const bookingId = uuid.v1()
  const confirmationCode = Math.floor((100000 + Math.random()) * 900000)
  const guestServiceFee = data.isAbsorvedFee ? IS_ABSORVE : NO_ABSORVE
  const hostServiceFee = data.isAbsorvedFee ? 0.11 : 0

  let totalPrice
  let bookingPeriod
  let reservationDates
  if (data.priceType === 'hourly') {
    bookingPeriod = getHourlyPeriod(data.checkInHour, data.checkOutHour)
    totalPrice = calcTotal(data.basePrice, data.quantity, bookingPeriod, guestServiceFee)
    reservationDates = data.reservations
  } else if (data.priceType === 'daily') {
    reservationDates = data.reservations
    bookingPeriod = reservationDates.length
    totalPrice = calcTotal(data.basePrice, data.quantity, bookingPeriod, guestServiceFee)
  } else {
    bookingPeriod = data.period
    const endDate = getEndDate(data.reservations[0], bookingPeriod, data.priceType)
    reservationDates = getDates(data.reservations[0], endDate)
    totalPrice = calcTotal(data.basePrice, data.quantity, bookingPeriod, guestServiceFee)
  }

  // Getting pending bookings...
  let isBlocked = false
  const bookings = await getValidateBookings(data.listingId)
  if (data.priceType === 'hourly') {
    isBlocked = hasBlockTime(bookings, data.checkInHour, data.checkOutHour)
  } else {
    isBlocked = hasBlockAvailabilities(bookings, reservationDates)
  }

  if (isBlocked) {
    return failure({
      status: false,
      error: 'The requested dates/time are not available.'
    })
  } else {
    // Defining a sorted reservation list...
    let sortedReservations = JSON.parse(JSON.stringify(reservationDates))
    sortedReservations = onSortDates(sortedReservations)

    // Defining checkIn, checkOut booking dates...
    const checkIn = moment(sortedReservations[0])
      .format('YYYY-MM-DD')
      .toString()
    const checkOut = moment(sortedReservations[sortedReservations.length - 1])
      .format('YYYY-MM-DD')
      .toString()

    // Creating record on 'bookings' table...
    try {
      await Bookings.create({
        listingId: data.listingId,
        bookingId: bookingId,
        hostId: data.hostId,
        guestId: data.guestId,
        reservations: sortedReservations.join(','),
        quantity: data.quantity,
        basePrice: data.basePrice,
        fees: data.fees,
        period: bookingPeriod,
        currency: data.currency,
        guestServiceFee: guestServiceFee,
        hostServiceFee: hostServiceFee,
        totalPrice: totalPrice,
        confirmationCode: confirmationCode,
        paymentState: BookingStates.PENDING,
        payoutId: data.payoutId,
        bookingState: BookingStates.PENDING,
        bookingType: data.bookingType,
        paymentMethodId: data.paymentMethodId,
        subscriptionId: data.subscriptionId,
        sourceId: data.sourceId,
        priceType: data.priceType,
        checkIn: checkIn,
        checkOut: checkOut,
        checkInHour: data.checkInHour,
        checkOutHour: data.checkOutHour,
        message: data.message,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      log(bookingId, 'Created.')
    } catch (err) {
      log(bookingId, err)
      return failure({ status: false, error: err })
    }

    // Creating availabilities...
    try {
      const sqs = new AWS.SQS();
      await sqs.sendMessage({
        QueueUrl: QUEUE_ULR,
        MessageBody: JSON.stringify({
          bookingId: bookingId,
          listingId: data.listingId,
          blockedDates: sortedReservations
        })
      }).promise()
      log(bookingId, 'Reservations sent: ' + sortedReservations)
    } catch (err) {
      log(bookingId, 'Problems to register reservation on Queue:' + err)
    }

    // Updating booking state and finishing...
    let bookingObjUpdated
    if ('request' === data.bookingType) {
      bookingObjUpdated = await bookingService.doRequestedBooking(bookingId)
    } else {
      bookingObjUpdated = await bookingService.doApproveBooking(bookingId)
    }
    return success(bookingObjUpdated)
  }
}

const onSortDates = dates => {
  return dates.sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })
}
