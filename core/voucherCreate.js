const { success, failure } = require('../libs/response-lib');

const voucherService = require('./../services/voucher.service')

module.exports.main = async (event, context, callback) => {
  const data = JSON.parse(event.body)
  try {
    const voucherObjCreated = await voucherService.create(data)
    return success(voucherObjCreated)
  } catch (err) {
    return failure({ error: err })
  }
}
