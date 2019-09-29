import uuid from 'uuid'
import moment from 'moment'
import { Op } from 'sequelize'

import * as queueLib from '../libs/queue-lib'
import { success, failure } from '../libs/response-lib'
import { calcTotal, getDates, getEndDate, BookingStates, mapReservations } from '../validations'
import { Bookings } from './../models'

const QUEUE_ULR = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`

const IS_ABSORVE = 0.035
const NO_ABSORVE = 0.135

const hasBlockAvailabilities = async (listingId, reservationDates) => {
  try {
    const bookings = await Bookings.findAll({
      where: {
        listingId: listingId,
        bookingState: {
          [Op.in]: [
            BookingStates.PENDING,
            BookingStates.REQUESTED,
            BookingStates.ACCEPTED
          ]
        }
      }
    })

    bookings.map(mapReservations)
    let reservationsFromBooking = bookings.map((o) => o.reservations)
    reservationsFromBooking = [].concat.apply([], reservationsFromBooking)

    const similars = []
    reservationsFromBooking.forEach((fromBooking) => {
      reservationDates.forEach((toCreate) => {
        if (moment(fromBooking).isSame(toCreate, 'day')) {
          if (similars.indexOf(toCreate) === -1) {
            similars.push(toCreate)
          }
        }
      })
    })

    return similars.length > 0
  } catch (err) {
    console.error(err)
    return true // to block reservations if has a query error...
  }
}

export const main = async (event) => {
  const data = JSON.parse(event.body)

  const bookingId = uuid.v1()
  const confirmationCode = Math.floor((100000 + Math.random()) * 900000)
  const guestServiceFee = data.isAbsorvedFee ? IS_ABSORVE : NO_ABSORVE
  const hostServiceFee = data.isAbsorvedFee ? 0.1 : 0

  let totalPrice
  let reservationDates
  if (data.priceType === 'daily') {
    reservationDates = data.reservations
    totalPrice = calcTotal(
      data.basePrice,
      data.quantity,
      reservationDates.length,
      guestServiceFee
    )
  } else {
    const endDate = getEndDate(
      data.reservations[0],
      data.period,
      data.priceType
    )
    reservationDates = getDates(data.reservations[0], endDate)
    totalPrice = calcTotal(
      data.basePrice,
      data.quantity,
      data.period,
      guestServiceFee
    )
  }

  if (await hasBlockAvailabilities(data.listingId, reservationDates)) {
    return failure({
      status: false,
      error: 'The requested dates are not available.'
    })
  } else {
    // Defining a sorted reservation list...
    let sortedReservations = JSON.parse(JSON.stringify(reservationDates))
    sortedReservations = onSortDates(sortedReservations)

    // Defining checkIn, checkOut booking dates...
    const checkIn = moment(sortedReservations[0]).format('YYYY-MM-DD').toString()
    const checkOut = moment(sortedReservations[sortedReservations.length - 1]).format('YYYY-MM-DD').toString()

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
        period: data.period,
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
        checkIn,
        checkOut
      })
    } catch (err) {
      console.error(err)
      return failure({ status: false, error: err })
    }

    // Creating availabilities...
    try {
      await queueLib.call({
        QueueUrl: QUEUE_ULR,
        MessageBody: JSON.stringify({
          bookingId: bookingId,
          listingId: data.listingId,
          blockedDates: sortedReservations
        })
      })
    } catch (err) {
      console.error('\nProblems to register reservation on Queue:', err)
    }

    const bookingCreated = await Bookings.findOne({ where: { bookingId } })
    return success(mapReservations(bookingCreated))
  }
}

const onSortDates = (dates) => {
  return dates.sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })
}
