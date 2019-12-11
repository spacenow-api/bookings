const { success, failure } = require('../libs/response-lib');
const { BookingStates } = require('./../validations')
const updateBookingState = require('./../helpers/updateBookingState')

module.exports.main = async (event, context, callback) => {
  try {
    await updateBookingState(event.pathParameters.id, BookingStates.EXPIRED)
    return success({ status: true })
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
