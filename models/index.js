import DataTypes from 'sequelize'

import { getInstance } from './../helpers/mysql.server'
const sequelize = getInstance()

import BookingsModel from './../models/bookings.model'
const Bookings = BookingsModel(sequelize, DataTypes)

import AvailabilitiesModel from './../models/availabilities.model'
const Availabilities = AvailabilitiesModel(sequelize, DataTypes)

export { Bookings, Availabilities }
