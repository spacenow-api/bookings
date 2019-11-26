import { onSendEmail } from './../helpers/email.function'
import { BookingStates, resolveBooking } from './../validations'
import { Bookings } from './../models'

async function doRequestedBooking(bookingId) {
  try {
    await Bookings.update(
      { bookingState: BookingStates.REQUESTED, paymentState: BookingStates.COMPLETED, updatedAt: Date.now() },
      { where: { bookingId } }
    )
    const bookingObjUpdated = await Bookings.findOne({ where: { bookingId }, raw: true })
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestGuest`, bookingId)
    return resolveBooking(bookingObjUpdated)
  } catch (err) {
    console.error(`Problems to update booking ${bookingId} to requested:`, err)
    throw err
  }
}

async function doApproveBooking(bookingId) {
  const bookingObj = await Bookings.findOne({ where: { bookingId }, raw: true })
  if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
    try {
      await Bookings.update(
        { bookingState: BookingStates.APPROVED, updatedAt: Date.now() },
        { where: { bookingId } }
      )
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantGuest`, bookingId)
      const bookingObjUpdated = await Bookings.findOne({ where: { bookingId }, raw: true })
      return resolveBooking(bookingObjUpdated)
    } catch (err) {
      console.error(`Problems to update booking ${bookingId} to Approved:`, err)
      throw err
    }
  } else {
    console.warn(`Booking ${bookingId} is not Requested.`)
    return resolveBooking(bookingObj)
  }
}

export { doRequestedBooking, doApproveBooking }