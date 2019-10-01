import { success, failure } from '../libs/response-lib'
import { Bookings } from './../models'
import { resolveBooking } from './../validations'

export const main = async () => {
  console.log('Main list function running...')
  try {
    const result = await Bookings.findAll({ raw: true })
    console.log('Bookings found: ', result)
    result.map(resolveBooking)
    return success(result)
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
