const { Op } = require('sequelize')

const { success, failure } = require('../libs/response-lib');
const { BookingStates, resolveBooking } = require('./../validations')
const { Bookings } = require('./../models')

module.exports.main = async (event, context, callback) => {
  try {
    const bookings = await Bookings.findAll({
      where: {
        guestId: event.pathParameters.id,
        bookingState: { [Op.ne]: BookingStates.TIMEOUT }
      }, raw: true
    })
    return success({ count: bookings.length, items: bookings.map(resolveBooking) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
