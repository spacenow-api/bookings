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

const { success, failure } = require('../libs/response-lib');
const { getHourlyPeriod, isAvailableThisDay } = require('./../validations')

module.exports.main = async (event, context, callback) => {
  try {
    const data = JSON.parse(event.body)
    const hours = getHourlyPeriod(data.checkInHour, data.checkOutHour)
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
