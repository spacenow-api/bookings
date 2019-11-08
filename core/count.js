import { success, failure } from '../libs/response-lib'
import { subDays } from "date-fns"
import { Bookings } from './../models'
import { Op } from 'sequelize'

export const main = async (event) => {
  const days = event.queryStringParameters.days
  const date = subDays(new Date(), days);
  try {
    const data = await Bookings.count({
      where: { 
        createdAt: { 
          [Op.gte]: `${date.getTime()}`
        }
      }
    });
    return success({ count: data })
  } catch (error) {
    return failure({ status: false })
  }
}
