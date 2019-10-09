import { success, failure } from '../libs/response-lib'
import { getHourlyPeriod, isAvailableThisDay } from './../validations'

export async function main(event) {
  try {
    const data = JSON.parse(event.body)
    const hours = getHourlyPeriod(data.checkInHour, data.checkOutHour)
    const isAvailable = await isAvailableThisDay(
      data.listingId,
      data.date,
      data.checkInHour,
      data.checkOutHour
    )
    return success({ status: true, hours, isAvailable })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err.message })
  }
}
