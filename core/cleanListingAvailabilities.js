const { Op } = require('sequelize')

const { success, failure } = require('../libs/response-lib');
const updateBookingState = require('./../helpers/updateBookingState')
const { onCleanAvailabilities } = require('./../helpers/availabilities.function')
const { BookingStates } = require('./../validations')
const { Bookings } = require('./../models')

module.exports.main = async (event, context) => { 
  if (event.pathParameters.id) {
    try {
      const bookings = await Bookings.findAll({
        where: {
          listingId: parseInt(event.pathParameters.id),
          bookingState: BookingStates.PENDING,
          createdAt: { [Op.lt]: Date.now() - 1800000 }
        }
      })
      for (const item of bookings) {
        await updateBookingState(item.bookingId, BookingStates.TIMEOUT)
        await onCleanAvailabilities(item.bookingId)
      }
      return success({ status: true, count: bookings.length })
    } catch (err) {
      console.error(err)
      return failure({
        status: false,
        error: err
      })
    }
  } else {
    return failure({
      status: false,
      error: `It's not possible check availabilities without a valid 'listingId'.`
    })
  }
}
