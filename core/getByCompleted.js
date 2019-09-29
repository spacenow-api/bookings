import moment from 'moment'

import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async () => {
  try {
    const nextDay = moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD')
      .toString()
    const bookings = await Bookings.findAll({
      where: {
        bookingState: BookingStates.APPROVED,
        checkOut: nextDay
      }
    })
    return success({ count: bookings.length, items: bookings.map(mapReservations) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
