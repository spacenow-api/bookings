const moment = require('moment')

const { success, failure } = require('../libs/response-lib');
const { getHourlyPeriod, isAvailableThisDay } = require('./../validations')
const { ListingAccessDays, ListingAccessHours } = require('./../models')

module.exports.main = async (event, context, callback) => {
  try {
    const data = JSON.parse(event.body)
    const hours = getHourlyPeriod(data.checkInHour, data.checkOutHour)

    // Getting Listing Access Hours...
    const weekDay = moment(data.date).day()
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
    return failure({ status: false, error: err })
  }
}
