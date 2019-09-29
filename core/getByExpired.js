import moment from 'moment'
import { Op } from 'sequelize'

import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

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
      }
    })
    return success({ count: bookings.length, items: bookings.map(mapReservations) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
