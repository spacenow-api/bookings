// import AWS from 'aws-sdk'

// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import updateBookingState from './../helpers/updateBookingState'
import { onCleanAvailabilities } from './../helpers/availabilities.function'
import { BookingStates } from './../validations'
// import { Bookings } from './../models'

// const lambda = new AWS.Lambda()

export async function main(event, context) {
  try {
    // const { Attributes } = await dynamoDbLib.call('update', {
    //   TableName: process.env.tableName,
    //   Key: {
    //     bookingId: event.pathParameters.id
    //   },
    //   ExpressionAttributeNames: {
    //     '#booking_state': 'bookingState'
    //   },
    //   ExpressionAttributeValues: {
    //     ':bookingState': BookingStates.TIMEOUT,
    //     ':updatedAt': Date.now() || null
    //   },
    //   UpdateExpression: 'SET #booking_state = :bookingState, updatedAt = :updatedAt',
    //   ReturnValues: 'ALL_NEW'
    // })
    // await onCleanAvailabilities(event.pathParameters.id)
    // return success({ status: true, data: Attributes })
    const bookingUpdated = await updateBookingState(event.pathParameters.id, BookingStates.TIMEOUT)
    await onCleanAvailabilities(event.pathParameters.id)
    return success({ status: true, data: bookingUpdated })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}
