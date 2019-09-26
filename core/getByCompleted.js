import moment from 'moment'

// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async () => {
  try {
    // const result = await dynamoDbLib.call('scan', {
    //   TableName: process.env.tableName,
    //   FilterExpression: `#bookingState = :bookingState AND #checkOut = :nextDay`,
    //   ExpressionAttributeNames: {
    //     '#bookingState': 'bookingState',
    //     '#checkOut': 'checkOut'
    //   },
    //   ExpressionAttributeValues: {
    //     ':bookingState': 'approved',
    //     ':nextDay': nextDay
    //   }
    // })
    // return success({ count: result.Items.length, items: result.Items })
    const nextDay = moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD')
      .toString()
    const bookings = await Bookings.findAll({
      where: {
        bookingState: BookingStates.APPROVED,
        checkOut: nextDay
      }
    })
    return success({ count: bookings.length, items: bookings.map(mapReservations) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
