const { success, failure } = require('../libs/response-lib');
const { resolveBooking } = require('./../validations')
const { Bookings } = require('./../models')

module.exports.main = async (event, context, callback) => {
  try {
    const result = await Bookings.findOne({
      where: { bookingId: event.pathParameters.id },
      raw: true
    })
    if (result) {
      resolveBooking(result)
      return success(result)
    } else {
      return failure({ status: false, error: 'Booking not found.' })
    }
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
