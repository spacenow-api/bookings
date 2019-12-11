const { success, failure } = require('../libs/response-lib');

const bookingService = require('./../services/booking.service')

module.exports.main = async (event, context, callback) => {
  const { bookingId, sourceId, chargeId } = JSON.parse(event.body)
  try {
    const bookingObjUpdated = await bookingService.doPaymentConfirmation(bookingId, sourceId, chargeId)
    return success({ status: true, data: bookingObjUpdated })
  } catch (err) {
    return failure({ status: 'error', error: err })
  }
}
