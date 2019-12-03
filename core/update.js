const { success, failure } = require('../libs/response-lib');
const { resolveBooking } = require('./../validations')
const { Bookings } = require('./../models')

module.exports.main = async (event, context, callback) => {
  try {
    const data = JSON.parse(event.body)
    await Bookings.update(
      { sourceId: data.sourceId, chargeId: data.chargeId, updatedAt: Date.now() },
      { where: { bookingId: event.pathParameters.id } }
    )
    const bookingObjUpdated = await Bookings.findOne({ where: { bookingId: event.pathParameters.id }, raw: true })
    return success({ status: 'updated', data: resolveBooking(bookingObjUpdated) })
  } catch (err) {
    console.error(err)
    return failure({ status: 'error', error: err })
  }
}
