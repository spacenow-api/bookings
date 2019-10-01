import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'
import { Bookings } from './../models'

export async function main(event) {
  try {
    await Bookings.update(
      { bookingState: BookingStates.CANCELLED, updatedAt: Date.now() },
      { where: { bookingId: event.pathParameters.id } }
    )
    return success({ status: true })
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
