import { onSendEmail } from './../helpers/email.function'
import { onCleanAvailabilities } from './../helpers/availabilities.function'
import updateBookingState from './../helpers/updateBookingState'

import { BookingStates, resolveBooking } from './../validations'

import { Bookings } from './../models'

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
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingReadyToPay`, bookingId)
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

export { doRequestedBooking, doApproveBooking, doDeclineBooking, doPaymentConfirmation }