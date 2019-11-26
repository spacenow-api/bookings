import { success, failure } from '../libs/response-lib'

import * as bookingService from './../services/booking.service'

export async function main(event) {
  const { bookingId, sourceId, chargeId } = JSON.parse(event.body)
  try {
    const bookingObjUpdated = await bookingService.doPaymentConfirmation(bookingId, sourceId, chargeId)
    return success({ status: true, data: bookingObjUpdated })
  } catch (err) {
    return failure({ status: 'error', error: err })
  }
}
