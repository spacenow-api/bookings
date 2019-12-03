const moment = require('moment')

const { success, failure } = require('../libs/response-lib');
const { onSendEmail } = require('./../helpers/email.function')
const updateBookingState = require('./../helpers/updateBookingState')
const { BookingStates, resolveBooking } = require('./../validations')
const { Bookings } = require('./../models')

module.exports.main = async (event, context, callback) => {
  try {
    const bookings = await Bookings.findAll({
      where: { bookingState: BookingStates.APPROVED }
    })
    const bookingsCompleted = []
    const currentDate = moment(new Date(), 'YYYY-MM-DD').utcOffset('+1100')
    for (const item of bookings) {
      let checkOutDate = moment(item.checkOut, 'YYYY-MM-DD')
      checkOutDate = checkOutDate.utcOffset('+1100')
      if (currentDate.isAfter(checkOutDate)) {
        bookingsCompleted.push(resolveBooking(item))
        await updateBookingState(item.bookingId, BookingStates.COMPLETED)
        await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingCheckOut`, item.bookingId)
      }
    }
    return success({ status: true, updated: bookingsCompleted })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
