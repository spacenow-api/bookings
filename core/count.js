const { success, failure } = require('../libs/response-lib');
const { subDays } = require("date-fns")
const { Bookings } = require('./../models')
const { Op } = require('sequelize')

module.exports.main = async (event, context, callback) => {
  let days = 10000;
  if (event.queryStringParameters) {
    days = event.queryStringParameters.days
  }
  
  const date = subDays(new Date(), days);

  let where = {
    createdAt: {
      [Op.gte]: `${date}`
    }
  };
  try {
    const all = await Bookings.count({ where: where });
    const approved = await Bookings.count({
      where: { ...where, bookingState: "approved" }
    });
    const completed = await Bookings.count({
      where: { ...where, bookingState: "completed" }
    });
    const cancelled = await Bookings.count({
      where: { ...where, bookingState: "cancelled", }
    });
    return success({ count: { all: all, approved, completed, cancelled } })
  } catch (error) {
    return failure({ status: false })
  }
}
