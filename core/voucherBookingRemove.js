const { success, failure } = require('../libs/response-lib');

const voucherService = require('./../services/voucher.service')

module.exports.main = async (event, context, callback) => {
  const { voucherCode, bookingId } = event.pathParameters
  try {
    const bookingObjUpdated = await voucherService.removeVoucher(
      voucherCode,
      bookingId
    )
    return success(bookingObjUpdated)
  } catch (err) {
    return failure({ error: err })
  }
}
