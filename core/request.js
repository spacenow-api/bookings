import { success, failure } from '../libs/response-lib'

import * as bookingService from './../services/booking.service'

export async function main(event) {
  const bookingId = event.pathParameters.id
  try {
    const bookingObjUpdated = await bookingService.doRequestedBooking(bookingId)
    return success({ status: true, data: bookingObjUpdated })
  } catch (err) {
    return failure({ status: false, error: err })
  }
}
