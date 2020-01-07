const DataTypes = require('sequelize');

const { getInstance } = require('./../helpers/mysql.server');
const sequelize = getInstance();

const Bookings = require('./../models/bookings.model')(sequelize, DataTypes);
const Availabilities = require('./../models/availabilities.model')(sequelize, DataTypes);
const ListingAccessDays = require('./../models/listingAccessDays.model')(sequelize, DataTypes);
const ListingAccessHours = require('./../models/listingAccessHours.model')(sequelize, DataTypes);
const Vouchers = require('./../models/vouchers.model')(sequelize, DataTypes);
const User = require('./../models/user.model')(sequelize, DataTypes);
const ListingData = require('./../models/listingData.model')(sequelize, DataTypes);

module.exports = {
  Bookings,
  Availabilities,
  ListingAccessDays,
  ListingAccessHours,
  Vouchers,
  User,
  ListingData
};
