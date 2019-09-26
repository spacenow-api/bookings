import AWS from 'aws-sdk'

// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'
import { onCleanAvailabilities } from './../helpers/availabilities.function'
import updateBookingState from './../helpers/updateBookingState'
import { Bookings } from './../models'

const lambda = new AWS.Lambda()

export async function main(event) {
  const bookingId = event.pathParameters.id
  // const { Item: bookingObj } = await dynamoDbLib.call('get', {
  //   TableName: process.env.tableName,
  //   Key: {
  //     bookingId: bookingId
  //   }
  // })
  const bookingObj = await Bookings.findOne({ where: { bookingId } })
  if (BookingStates.REQUESTED === bookingObj.bookingState) {
    try {
      // const { Attributes } = await dynamoDbLib.call('update', {
      //   TableName: process.env.tableName,
      //   Key: {
      //     bookingId: bookingId
      //   },
      //   ExpressionAttributeNames: {
      //     '#booking_state': 'bookingState'
      //   },
      //   ExpressionAttributeValues: {
      //     ':bookingState': BookingStates.DECLINED,
      //     ':updatedAt': Date.now()
      //   },
      //   UpdateExpression: 'SET #booking_state = :bookingState, updatedAt = :updatedAt',
      //   ReturnValues: 'ALL_NEW'
      // })
      const bookingUpdated = await updateBookingState(bookingId, BookingStates.DECLINED)
      await onCleanAvailabilities(bookingId)
      await onSendDeclinedEmail(bookingId)
      return success({ status: true, data: bookingUpdated })
    } catch (err) {
      console.error(err)
      return failure({ status: false, error: err })
    }
  } else {
    console.warn(`Booking ${bookingId} is not Requested.`)
    return success({ status: true, data: bookingObj, blockEmails: true })
  }
}

const onSendDeclinedEmail = (bookingId) => {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      {
        FunctionName: `api-emails-${process.env.environment}-sendEmailByBookingDeclined`,
        Payload: JSON.stringify({ pathParameters: { bookingId: bookingId } })
      },
      (error) => {
        if (error) {
          reject(error)
        } else {
          console.info(`Declined email sent with success by booking ${bookingId}`)
          resolve()
        }
      }
    )
  })
}
