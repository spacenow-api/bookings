const { success, failure } = require('./../libs/response-lib')

const bookingService = require('./../services/booking.service')

module.exports.main = async (event, context, callback) => {
  const bookingId = event.pathParameters.id
  try {
    const bookingObjUpdated = await bookingService.doDeclineBooking(bookingId)
    return success({ status: true, data: bookingObjUpdated })
  } catch (err) {
    return failure({ status: false, error: err })
  }
}
