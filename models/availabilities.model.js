'use strict'

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Availabilities',
    {
      availabilityId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true
      },
      bookingId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
          model: 'Bookings',
          key: 'bookingId'
        }
      },
      listingId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'Listing',
          key: 'id'
        }
      },
      blockedDates: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: 'Availabilities'
    }
  )
}
