import { success, failure } from '../libs/response-lib'

import * as voucherService from './../services/voucher.service'

export async function main(event) {
  const { voucherCode } = event.pathParameters
  try {
    const validation = await voucherService.validateExpireTime(voucherCode)
    return success(validation)
  } catch (err) {
    return failure({ error: err })
  }
}
