// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'
import updateBookingState from './../helpers/updateBookingState'
// import { Bookings } from './../models'

export async function main(event) {
  try {
    // await dynamoDbLib.call('update', {
    //   TableName: process.env.tableName,
    //   Key: {
    //     bookingId: event.pathParameters.id
    //   },
    //   ExpressionAttributeNames: {
    //     '#booking_state': 'bookingState'
    //   },
    //   ExpressionAttributeValues: {
    //     ':bookingState': 'expired',
    //     ':updatedAt': Date.now() || null
    //   },
    //   UpdateExpression: 'SET #booking_state = :bookingState, updatedAt = :updatedAt',
    //   ReturnValues: 'ALL_NEW'
    // })
    await updateBookingState(event.pathParameters.id, BookingStates.EXPIRED)
    return success({ status: true })
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
