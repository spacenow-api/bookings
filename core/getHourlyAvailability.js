const moment = require('moment')
const mysql2 = require('mysql2')
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'mysql',
  dialectModule: mysql2,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_SCHEMA,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  logging: process.env.DEBUG ? console.debug : false,
  dialectOptions: {
    useUTC: false,
    dateStrings: false,
    typeCast: true
  }
})

const ListingAccessDays = require('./../models/listingAccessDays.model')(sequelize, DataTypes);
const ListingAccessHours = require('./../models/listingAccessHours.model')(sequelize, DataTypes);
const ListingData = require('./../models/listingData.model')(sequelize, DataTypes);

const { success, failure } = require('../libs/response-lib');
const { getHourlyPeriod, isAvailableThisDay, getMomentObjByDate, getTime, getRange } = require('./../validations')

module.exports.main = async (event, context, callback) => {
  try {
    const { listingId, date, checkInHour, checkOutHour } = JSON.parse(event.body)

    const weekDay = moment(date).day()

    const listingDataObj = await ListingData.findOne({ where: { listingId: listingId } })

    const accessDayObj = await ListingAccessDays.findOne({
      where: { listingId: listingId }
    })

    const accessHoursObj = await ListingAccessHours.findOne({
      where: {
        listingAccessDaysId: accessDayObj.id,
        weekday: `${weekDay}`
      }
    })

    const hours = getHourlyPeriod(checkInHour, checkOutHour)
    if (listingDataObj && listingDataObj.minTerm > hours) {
      throw new Error(`This space must be booked for at least ${listingDataObj.minTerm} hours`)
    }

    const isAvailable = isAvailableThisDay(checkInHour, checkOutHour, accessHoursObj)

    // Primary object result...
    let hourlyAvailability = {
      status: true,
      hours,
      isAvailable
    }

    // Suggestion object...
    const suggestionObj = getHourlySuggestion(accessHoursObj, listingDataObj.minTerm)
    hourlyAvailability = { ...hourlyAvailability, suggestion: suggestionObj }

    return success(hourlyAvailability)
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}

const getHourlySuggestion = (accessHoursObj, minTerm) => {
  const openMomentObj = getMomentObjByDate(accessHoursObj.openHour)
  const closeMomentObj = getMomentObjByDate(accessHoursObj.closeHour)
  const hourlyRange = getRange(openMomentObj, closeMomentObj)
  const openRange = [...hourlyRange]
  openRange.pop()
  const closeRange = [...hourlyRange]
  closeRange.shift()
  const closeSuggestion = moment(openMomentObj)
    .add(2, 'hours')
    .format('HH:mm')
  return {
    firstHour: getTime(openMomentObj),
    lastHour: getTime(closeMomentObj),
    openRange: openRange,
    closeRange: closeRange,
    openSuggestion: getTime(openMomentObj),
    closeSuggestion: closeSuggestion
  }
}
