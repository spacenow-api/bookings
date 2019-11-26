import { onSendEmail } from './../helpers/email.function'
import { onCleanAvailabilities } from './../helpers/availabilities.function'

import { BookingStates, resolveBooking } from './../validations'

import { Bookings } from './../models'

async function doUpdateBookingState(bookingId, state) {
  try {
    await Bookings.update({ bookingState: state, updatedAt: Date.now() }, { where: { bookingId } })
    const bookingObj = await Bookings.findOne({ where: { bookingId }, raw: true })
    return bookingObj
  } catch (err) {
    throw err
  }
}

async function doRequestedBooking(bookingId) {
  try {
    const bookingObjUpdated = await doUpdateBookingState(bookingId, BookingStates.REQUESTED)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestGuest`, bookingId)
    return resolveBooking(bookingObjUpdated)
  } catch (err) {
    console.error(`Problems to update booking ${bookingId} to requested:`, err)
    throw err
  }
}

async function doApproveBooking(bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId }, raw: true })
    if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
      const bookingObjUpdated = await doUpdateBookingState(bookingId, BookingStates.APPROVED)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantGuest`, bookingId)
      return resolveBooking(bookingObjUpdated)
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
      const bookingObjUpdated = await doUpdateBookingState(bookingId, BookingStates.DECLINED)
      await onCleanAvailabilities(bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingDeclined`, bookingId)
      return resolveBooking(bookingObjUpdated)
    } else {
      console.warn(`Booking ${bookingId} is not Requested.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to decline booking ${bookingId}:`, err)
    throw err
  }
}

export { doRequestedBooking, doApproveBooking, doDeclineBooking }