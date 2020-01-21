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
    const all = await Bookings.count(where);
    const approved = await Bookings.count({
      where: { ...where, bookingState: "approved" }
    });
    const completed = await Bookings.count({
      where: { ...where, bookingState: "completed" }
    });
    const cancelled = await Bookings.count({
      where: { ...where, bookingState: "cancelled",  }
    });
    return success({ count: { all, approved, completed, cancelled } })
  } catch (error) {
    return failure({ status: false })
  }
}
