const { success, failure } = require('../libs/response-lib');
const updateBookingState = require('./../helpers/updateBookingState')
const { onCleanAvailabilities } = require('./../helpers/availabilities.function')
const { BookingStates } = require('./../validations')

module.exports.main = async (event, context, callback) => {
  try {
    const bookingUpdated = await updateBookingState(event.pathParameters.id, BookingStates.TIMEOUT)
    await onCleanAvailabilities(event.pathParameters.id)
    return success({ status: true, data: bookingUpdated })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
