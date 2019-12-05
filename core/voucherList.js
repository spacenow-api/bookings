const { success, failure } = require('../libs/response-lib')

const voucherService = require('./../services/voucher.service')

module.exports.main = async (event, context, callback) => {
  try {
    const vouchers = await voucherService.list()
    return success(vouchers)
  } catch (err) {
    return failure({ error: err })
  }
}
