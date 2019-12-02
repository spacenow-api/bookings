import { success, failure } from '../libs/response-lib'

import * as voucherService from './../services/voucher.service'

export async function main(event) {
  const { voucherCode } = event.pathParameters
  try {
    const voucherObjUpdated = await voucherService.desactive(voucherCode)
    return success(voucherObjUpdated)
  } catch (err) {
    return failure({ error: err })
  }
}
