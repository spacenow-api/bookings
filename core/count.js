import { success, failure } from '../libs/response-lib'
import { subDays } from "date-fns"
import { Bookings } from './../models'
import { Op } from 'sequelize'

export const main = async (event) => {
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
