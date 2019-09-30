import { success, failure } from '../libs/response-lib'
import { resolveBooking } from './../validations'
import { Bookings } from './../models'

export const main = async (event) => {
  try {
    const result = await Bookings.findOne({
      where: { bookingId: event.pathParameters.id },
      raw: true
    })
    if (result) {
      resolveBooking(result)
      return success(result)
    } else {
      return failure({ status: false, error: 'Booking not found.' })
    }
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
