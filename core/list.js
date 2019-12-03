const { success, failure } = require('../libs/response-lib');
const { Bookings } = require('./../models')
const { resolveBooking } = require('./../validations')

module.exports.main = async (event, context, callback) => {
  try {
    const result = await Bookings.findAll({ raw: true })
    result.map(resolveBooking)
    return success(result)
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
