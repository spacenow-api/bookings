export default function(sequelize, DataTypes) {
  return sequelize.define(
    'Vouchers',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('percentual', 'zerofee', 'value'),
        allowNull: false,
        defaultValue: 'value'
      },
      unique: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: '0'
      },
      expireTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      usageCount: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0'
      },
      status: {
        type: DataTypes.ENUM('active', 'desactive'),
        allowNull: false,
        defaultValue: 'active'
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
      tableName: 'Vouchers'
    }
  )
}
