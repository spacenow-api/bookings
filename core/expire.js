import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'
import updateBookingState from './../helpers/updateBookingState'

export async function main(event) {
  try {
    await updateBookingState(event.pathParameters.id, BookingStates.EXPIRED)
    return success({ status: true })
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
