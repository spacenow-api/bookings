import { Op } from 'sequelize'

// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async (event) => {
  try {
    // const result = await dynamoDbLib.call('scan', {
    //   TableName: process.env.tableName,
    //   FilterExpression: '#gId = :guestId AND #bState <> :bookingState',
    //   ExpressionAttributeNames: {
    //     '#gId': 'guestId',
    //     '#bState': 'bookingState'
    //   },
    //   ExpressionAttributeValues: {
    //     ':guestId': event.pathParameters.id,
    //     ':bookingState': BookingStates.TIMEOUT
    //   }
    // })
    // return success({ count: result.Items.length, items: result.Items })
    const bookings = await Bookings.findAll({
      where: {
        guestId: event.pathParameters.id,
        bookingState: { [Op.ne]: BookingStates.TIMEOUT }
      }
    })
    return success({ count: bookings.length, items: bookings.map(mapReservations) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
