'use strict'

const { DataTypes } = require('sequelize')

const { getInstance } = require('./../helpers/mysql.server')

const sequelize = getInstance()

const Bookings = require('./../models/bookings.model')(sequelize, DataTypes)
const Availabilities = require('./../models/availabilities.model')(sequelize, DataTypes)

module.exports = {
  Bookings,
  Availabilities
}
