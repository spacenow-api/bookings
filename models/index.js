import DataTypes from 'sequelize'

import { getInstance } from './../helpers/mysql.server'
const sequelize = getInstance()

import BookingsModel from './../models/bookings.model'
const Bookings = BookingsModel(sequelize, DataTypes)

import AvailabilitiesModel from './../models/availabilities.model'
const Availabilities = AvailabilitiesModel(sequelize, DataTypes)

import ListingAccessDaysModel from './../models/listingAccessDays.model'
const ListingAccessDays = ListingAccessDaysModel(sequelize, DataTypes)

import ListingAccessHoursModel from './../models/listingAccessHours.model'
const ListingAccessHours = ListingAccessHoursModel(sequelize, DataTypes)

import VouchersModel from './../models/vouchers.model'
const Vouchers = VouchersModel(sequelize, DataTypes)

export {
  Bookings,
  Availabilities,
  ListingAccessDays,
  ListingAccessHours,
  Vouchers
}
