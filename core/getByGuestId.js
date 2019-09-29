import { Op } from 'sequelize'

import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async (event) => {
  try {
    const bookings = await Bookings.findAll({
      where: {
        guestId: event.pathParameters.id,
        bookingState: { [Op.ne]: BookingStates.TIMEOUT }
      }
    })
    return success({ count: bookings.length, items: bookings.map(mapReservations) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
