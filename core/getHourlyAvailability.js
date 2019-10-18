import moment from 'moment'

import { success, failure } from '../libs/response-lib'
import { getHourlyPeriod, isAvailableThisDay } from './../validations'
import { ListingAccessDays, ListingAccessHours } from './../models'

export async function main(event) {
  try {
    const data = JSON.parse(event.body)
    const hours = getHourlyPeriod(data.checkInHour, data.checkOutHour)

    // Getting Listing Access Hours...
    const weekDay = moment(data.date).day()
    console.log('Week Day: ', moment(data.date).toString())
    console.log('Week Day: ', moment(data.date).utcOffset('+1100').toString())
    const accessDay = await ListingAccessDays.findOne({
      where: { listingId: data.listingId }
    })
    const accessHours = await ListingAccessHours.findOne({
      where: {
        listingAccessDaysId: accessDay.id,
        weekday: `${weekDay}`
      }
    })
    const isAvailable = await isAvailableThisDay(
      data.checkInHour,
      data.checkOutHour,
      accessHours
    )

    return success({ status: true, hours, isAvailable })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err.message })
  }
}
