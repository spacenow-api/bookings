import { success, failure } from '../libs/response-lib'
import { Bookings } from './../models'
import { resolveBooking } from './../validations'

export const main = async () => {
  try {
    const result = await Bookings.findAll({ raw: true })
    result.map(resolveBooking)
    return success(result)
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
