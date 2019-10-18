import { success, failure } from '../libs/response-lib'
import { onSendEmail } from './../helpers/email.function'
import { BookingStates, resolveBooking } from './../validations'
import { Bookings } from './../models'

export async function main(event) {
  try {
    const bookingId = event.pathParameters.id
    await Bookings.update(
      { bookingState: BookingStates.REQUESTED, paymentState: BookingStates.COMPLETED, updatedAt: Date.now() },
      { where: { bookingId } }
    )
    const bookingObjUpdated = await Bookings.findOne({ where: { bookingId }, raw: true })
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestGuest`, bookingId)
    return success({ status: true, data: resolveBooking(bookingObjUpdated) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
