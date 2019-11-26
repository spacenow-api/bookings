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

export { doRequestedBooking }