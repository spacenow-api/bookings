import { success, failure } from '../libs/response-lib'

import * as voucherService from './../services/voucher.service'

export async function main(event) {
  const { voucherCode, bookingId } = event.pathParameters
  try {
    const bookingObjUpdated = await voucherService.insertVoucher(
      voucherCode,
      bookingId
    )
    return success(bookingObjUpdated)
  } catch (err) {
    return failure({ error: err })
  }
}
