import { success, failure } from '../libs/response-lib'
import { Bookings } from './../models'
import { mapReservations } from './../validations'

export const main = async () => {
  try {
    const result = await Bookings.findAll()
    result.map(mapReservations)
    return success(result)
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
