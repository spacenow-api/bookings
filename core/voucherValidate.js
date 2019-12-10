const { success, failure } = require('../libs/response-lib');

const voucherService = require('./../services/voucher.service')

module.exports.main = async (event, context, callback) => {
  const { voucherCode } = event.pathParameters
  try {
    const validation = await voucherService.validate(voucherCode)
    return success(validation)
  } catch (err) {
    return failure({ error: err })
  }
}
