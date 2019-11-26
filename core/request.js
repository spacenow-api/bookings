import { success, failure } from '../libs/response-lib'

import * as bookingService from './../services/booking.service'

export async function main(event) {
  try {
    const bookingId = event.pathParameters.id
    const bookingObjUpdated = await bookingService.doRequestedBooking(bookingId)
    return success({ status: true, data: bookingObjUpdated })
  } catch (err) {
    return failure({ status: false, error: err })
  }
}
