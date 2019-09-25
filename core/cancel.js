// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'
import { Bookings } from './../models'

export async function main(event) {
  // const params = {
  //   TableName: process.env.tableName,
  //   Key: {
  //     bookingId: event.pathParameters.id
  //   },
  //   ExpressionAttributeNames: {
  //     '#booking_state': 'bookingState'
  //   },
  //   ExpressionAttributeValues: {
  //     ':bookingState': 'cancelled',
  //     ':updatedAt': Date.now() || null
  //   },
  //   UpdateExpression:
  //     'SET #booking_state = :bookingState, updatedAt = :updatedAt',
  //   ReturnValues: 'ALL_NEW'
  // };
  try {
    // await dynamoDbLib.call('update', params);
    await Bookings.update(
      {
        updatedAt: Date.now(),
        bookingState: BookingStates.CANCELLED
      },
      { where: { bookingId: event.pathParameters.id } }
    )
    return success({ status: true })
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
