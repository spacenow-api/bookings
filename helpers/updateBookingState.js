import { mapReservations } from './../validations'
import { Bookings } from './../models'

export default async (bookingId, state) => {
  try {
    await Bookings.update({ bookingState: state }, { where: { bookingId } })
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    return mapReservations(bookingObj)
  } catch (err) {
    throw err
  }
}
