const moment = require('moment')
const { Op } = require('sequelize')

const { success, failure } = require('../libs/response-lib')
const { BookingStates, resolveBooking } = require('../validations')
const { Bookings } = require('../models')
const { onSendEmail } = require('../helpers/email.function')

const updateBookingState = require('../helpers/updateBookingState')
const { onCleanAvailabilities } = require('../helpers/availabilities.function')

module.exports.main = async (event, context, callback) => {
  try {
    const bookings = await Bookings.findAll({
      where: {
        bookingState: BookingStates.PENDING
      },
      raw: true
    })
    for (const item of bookings) {
      const plusHour =
        moment(item.createdAt)
          .add(30, 'minutes')
          .unix() * 1000
      console.log(item.createdAt, plusHour)
      if (item.createdAt > plusHour) {
        await updateBookingState(item.bookingId, BookingStates.TIMEOUT)
        await onCleanAvailabilities(item.bookingId)
        await onSendEmail(`api-emails-${process.env.environment}-sendEmailBookingTimedOutGuest`, item.id)
      }
    }
    return success({ count: bookings.length, items: bookings.map(resolveBooking) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
