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
const { getHourlyPeriod, isAvailableThisDay, getMomentObjByDate } = require('./../validations')

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

    if (checkInHour && checkOutHour) {
      // Checking availability for a start-to-end time...
      const hours = getHourlyPeriod(checkInHour, checkOutHour)
      if (listingDataObj && listingDataObj.minTerm > hours) {
        throw new Error(`This space must be booked for at least ${listingDataObj.minTerm} hours`)
      }
      const isAvailable = isAvailableThisDay(checkInHour, checkOutHour, accessHoursObj)
      return success({
        status: true,
        hours,
        isAvailable,
        openHour: checkInHour,
        closeHour: checkOutHour
      })
    } else {
      // Checking availability for a date...
      if (accessHoursObj) {
        const startMoment = getMomentObjByDate(accessHoursObj.openHour)
        const endMoment = getMomentObjByDate(accessHoursObj.closeHour)
        const open = getTime(startMoment)
        const close = getTime(endMoment)
        const isAvailable = isAvailableThisDay(open, close, accessHoursObj)
        const hours = getHourlyPeriod(open, close)
        return success({
          status: true,
          hours,
          isAvailable,
          openHour: open,
          closeHour: close
        })
      } else {
        throw new Error(`Not open on this date`)
      }
    }
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}

const getTime = (moment) => {
  let hours = moment.hours().toString()
  hours = hours.padStart(2, '0')
  let minutes = moment.minutes().toString()
  minutes = minutes.padStart(2, '0')
  return `${hours}:${minutes}`
}
