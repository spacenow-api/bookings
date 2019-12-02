import { success, failure } from '../libs/response-lib'

import * as voucherService from './../services/voucher.service'

export async function main(event) {
  const data = JSON.parse(event.body)
  try {
    const voucherObjCreated = await voucherService.create(data)
    return success({ voucherObjCreated })
  } catch (err) {
    return failure({ error: err })
  }
}
