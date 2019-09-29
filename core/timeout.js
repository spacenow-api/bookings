import { success, failure } from '../libs/response-lib'
import updateBookingState from './../helpers/updateBookingState'
import { onCleanAvailabilities } from './../helpers/availabilities.function'
import { BookingStates } from './../validations'

export async function main(event) {
  try {
    const bookingUpdated = await updateBookingState(event.pathParameters.id, BookingStates.TIMEOUT)
    await onCleanAvailabilities(event.pathParameters.id)
    return success({ status: true, data: bookingUpdated })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
