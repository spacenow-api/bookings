export default function(sequelize, DataTypes) {
  return sequelize.define(
    'Bookings',
    {
      bookingId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true
      },
      listingId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      hostId: {
        type: DataTypes.STRING(36),
        allowNull: false
      },
      guestId: {
        type: DataTypes.STRING(36),
        allowNull: false
      },
      confirmationCode: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      sourceId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      chargeId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      priceType: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: '1'
      },
      currency: {
        type: DataTypes.STRING(36),
        allowNull: false
      },
      period: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      basePrice: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      hostServiceFee: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      guestServiceFee: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      bookingType: {
        type: DataTypes.ENUM('instant', 'request'),
        allowNull: true,
        defaultValue: 'instant'
      },
      bookingState: {
        type: DataTypes.ENUM(
          'pending',
          'requested',
          'approved',
          'declined',
          'completed',
          'cancelled',
          'expired',
          'recurring',
          'timeout'
        ),
        allowNull: true,
        defaultValue: 'pending'
      },
      paymentState: {
        type: DataTypes.ENUM('pending', 'completed'),
        allowNull: true,
        defaultValue: 'pending'
      },
      checkIn: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      checkOut: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      reservations: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    },
    {
      tableName: 'Bookings',
      timestamps: false
    }
  )
}
