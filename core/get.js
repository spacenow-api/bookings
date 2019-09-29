import { success, failure } from '../libs/response-lib'
import { mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async (event) => {
  try {
    const result = await Bookings.findOne({
      where: { bookingId: event.pathParameters.id }
    })
    if (result) {
      mapReservations(result)
      return success(result)
    } else {
      return failure({ status: false, error: 'Booking not found.' })
    }
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
