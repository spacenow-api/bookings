import moment from 'moment'

import { success, failure } from '../libs/response-lib'
import { onSendEmail } from './../helpers/email.function'
import updateBookingState from './../helpers/updateBookingState'
import { BookingStates, resolveBooking } from './../validations'
import { Bookings } from './../models'

export const main = async () => {
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
