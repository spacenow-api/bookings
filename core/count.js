const { success, failure } = require('../libs/response-lib');
const { subDays } = require("date-fns")
const { Bookings } = require('./../models')
const { Op } = require('sequelize')

module.exports.main = async (event, context, callback) => {
  const days = event.queryStringParameters.days
  let where;
  if (days) {
    const date = subDays(new Date(), days);
    where = {
      where: { 
        createdAt: { 
          [Op.gte]: `${date.getTime()}`
        }
      }
    }
  } else {
    where = {}
  }
  try {
    const data = await Bookings.count(where);
    return success({ count: data })
  } catch (error) {
    return failure({ status: false })
  }
}
