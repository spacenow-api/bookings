import moment from 'moment'
import { Op } from 'sequelize'

import { success, failure } from '../libs/response-lib'
import { BookingStates, resolveBooking } from './../validations'
import { Bookings } from './../models'
import { onSendEmail } from './../helpers/email.function'

import updateBookingState from './../helpers/updateBookingState'
import { onCleanAvailabilities } from './../helpers/availabilities.function'

export const main = async () => {
  try {
    const lessHour =
      moment()
        .subtract(24, 'hours')
        .subtract(30, 'minutes')
        .unix() * 1000
    const plusHour =
      moment()
        .subtract(24, 'hours')
        .add(30, 'minutes')
        .unix() * 1000
    const bookings = await Bookings.findAll({
      where: {
        bookingState: BookingStates.REQUESTED,
        createdAt: { [Op.between]: [lessHour, plusHour] }
      },
      raw: true
    })
    for (const item of bookings) {
      await updateBookingState(item.bookingId, BookingStates.EXPIRED)
      await onCleanAvailabilities(item.bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailExpiredBooking`, item.bookingId)
    }
    console.log('bookings', bookings)
    console.log('bookings', bookings.map(resolveBooking))
    return success({ count: bookings.length, items: bookings.map(resolveBooking) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
