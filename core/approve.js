import { success, failure } from '../libs/response-lib'
import { onSendEmail } from './../helpers/email.function'
import { BookingStates, resolveBooking } from './../validations'
import { Bookings } from './../models'

export async function main(event) {
  const bookingId = event.pathParameters.id
  const bookingObj = await Bookings.findOne({ where: { bookingId }, raw: true })
  if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
    try {
      await Bookings.update(
        { bookingState: BookingStates.APPROVED, paymentState: 'completed', updatedAt: Date.now() },
        { where: { bookingId } }
      )
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantGuest`, bookingId)
      const bookingObjUpdated = await Bookings.findOne({ where: { bookingId }, raw: true })
      return success({ status: true, data: resolveBooking(bookingObjUpdated) })
    } catch (e) {
      return failure({ status: 'error', error: e })
    }
  } else {
    console.warn(`Booking ${bookingId} is not Requested.`)
    return success({ status: true, data: resolveBooking(bookingObj), blockEmails: true })
  }
}
