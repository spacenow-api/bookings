// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async (event) => {
  try {
    // const result = await dynamoDbLib.call('scan', {
    //   TableName: process.env.tableName,
    //   FilterExpression: 'listingId = :listingId AND guestId = :guestId AND bookingState = :bookingState',
    //   ExpressionAttributeValues: {
    //     ':guestId': event.pathParameters.id,
    //     ':listingId': parseInt(event.pathParameters.listingId),
    //     ':bookingState': 'pending'
    //   }
    // })
    // return success({ count: result.Items.length, items: result.Items })
    const bookings = await Bookings.findAll({
      where: {
        guestId: event.pathParameters.id,
        listingId: parseInt(event.pathParameters.listingId),
        bookingState: BookingStates.PENDING
      }
    })
    return success({ count: bookings.length, items: bookings.map(mapReservations) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
