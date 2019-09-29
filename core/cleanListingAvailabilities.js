import { Op } from 'sequelize'

import { success, failure } from '../libs/response-lib'
import updateBookingState from './../helpers/updateBookingState'
import { onCleanAvailabilities } from './../helpers/availabilities.function'
import { BookingStates } from './../validations'
import { Bookings } from './../models'

export const main = async (event, context) => {
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
