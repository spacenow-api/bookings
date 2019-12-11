const moment = require('moment')

const { success, failure } = require('../libs/response-lib');
const { BookingStates, resolveBooking } = require('./../validations')
const { Bookings } = require('./../models')

module.exports.main = async (event, context, callback) => {
  try {
    const nextDay = moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD')
      .toString()
    const bookings = await Bookings.findAll({
      where: {
        bookingState: BookingStates.APPROVED,
        checkOut: nextDay
      }, raw: true
    })
    return success({ count: bookings.length, items: bookings.map(resolveBooking) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
