const { success, failure } = require('../libs/response-lib');

const voucherService = require('./../services/voucher.service')

module.exports.main = async (event, context, callback) => {
  const { voucherCode } = event.pathParameters
  try {
    const voucherObjUpdated = await voucherService.updateUsage(voucherCode)
    return success(voucherObjUpdated)
  } catch (err) {
    return failure({ error: err })
  }
}
