const { onSendEmail } = require('./../helpers/email.function')
const { onCleanAvailabilities } = require('./../helpers/availabilities.function')
const updateBookingState = require('./../helpers/updateBookingState')

const { BookingStates, resolveBooking } = require('./../validations')

const { Bookings } = require('./../models')

async function doRequestedBooking(bookingId) {
  try {
    const bookingObjUpdated = await updateBookingState(bookingId, BookingStates.REQUESTED)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestGuest`, bookingId)
    return bookingObjUpdated
  } catch (err) {
    console.error(`Problems to update booking ${bookingId} to requested:`, err)
    throw err
  }
}

async function doApproveBooking(bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId }, raw: true })
    if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
      const bookingObjUpdated = await updateBookingState(bookingId, BookingStates.APPROVED)
      if ('request' === bookingObj.bookingType) {
        // It's not necessary to send email inviting to pay if booking is instant...
        await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingReadyToPay`, bookingId)
      }
      return bookingObjUpdated
    } else {
      console.warn(`Booking ${bookingId} is not Requested.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to update booking ${bookingId} to Approved:`, err)
    throw err
  }
}

async function doDeclineBooking(bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (BookingStates.REQUESTED === bookingObj.bookingState) {
      const bookingObjUpdated = await updateBookingState(bookingId, BookingStates.DECLINED)
      await onCleanAvailabilities(bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingDeclined`, bookingId)
      return bookingObjUpdated
    } else {
      console.warn(`Booking ${bookingId} is not Requested.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to decline booking ${bookingId}:`, err)
    throw err
  }
}

async function doPaymentConfirmation(bookingId, sourceId, chargeId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (BookingStates.APPROVED === bookingObj.bookingState) {
      await Bookings.update({
        sourceId: sourceId,
        chargeId: chargeId,
        paymentState: 'completed',
        updatedAt: Date.now()
      }, { where: { bookingId } })
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantGuest`, bookingId)
      const bookingObjUpdated = await Bookings.findOne({ where: { bookingId }, raw: true })
      return resolveBooking(bookingObjUpdated)
    } else {
      console.warn(`Booking ${bookingId} is not Approved.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to decline booking ${bookingId}:`, err)
    throw err
  }
}

function getHourlyPeriod(startTime, endTime) {
  if (!startTime && !endTime) throw Error('Time not found.')
  if (!startTime || !endTime) return 0
  const startMoment = moment(startTime, 'HH:mm')
  const endMoment = moment(endTime, 'HH:mm')
  const hourDiff = endMoment.diff(startMoment, 'hours')
  const minDiff = moment.utc(endMoment.diff(startMoment)).format('mm')
  if (parseInt(hourDiff, 10) < 0) {
    throw Error('End time is bigger than Start time.')
  }
  if (parseInt(minDiff, 10) > 0) {
    throw Error(
      'It is not possible to book a space with a half or less minutes of diference.'
    )
  }
  return hourDiff
}

function getBookingPeriod(bookingObject) {
  const booking = resolveBooking(bookingObject)
  switch (booking.priceType) {
    case 'hourly':
      return getHourlyPeriod(booking.checkInHour, booking.checkOutHour)
    case 'daily':
      return booking.reservations.length
    default:
      return booking.period
  }
}

function getCalcTotalValue(bookingObject) {
  const bookingPeriod = getBookingPeriod(bookingObject)
  let total = bookingObject.basePrice * bookingPeriod
  total += total * bookingObject.guestServiceFee
  return total
}

module.exports = {
  doRequestedBooking,
  doApproveBooking,
  doDeclineBooking,
  doPaymentConfirmation,
  getBookingPeriod,
  getCalcTotalValue
}