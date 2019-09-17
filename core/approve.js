import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'

export async function main(event) {
  const bookingId = event.pathParameters.id
  const { Item: bookingObj } = await dynamoDbLib.call('get', {
    TableName: process.env.tableName,
    Key: {
      bookingId: bookingId
    }
  })
  if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
    const params = {
      TableName: process.env.tableName,
      Key: {
        bookingId: bookingId
      },
      ExpressionAttributeValues: {
        ':updatedAt': Date.now(),
        ':bookingState': BookingStates.APPROVED,
        ':paymentState': 'completed'
      },
      UpdateExpression: 'SET bookingState = :bookingState, paymentState = :paymentState, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW'
    }
    try {
      const { Attributes } = await dynamoDbLib.call('update', params)
      const environment = process.env.environment
      await onSendEmail(`spacenow-api-emails-${environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`spacenow-api-emails-${environment}-sendEmailByBookingInstantGuest`, bookingId)
      return success({ status: true, data: Attributes })
    } catch (e) {
      return failure({ status: 'error', error: e })
    }
  } else {
    console.warn(`Booking ${bookingId} is not Requested.`)
    return success({ status: true, data: bookingObj, blockEmails: true })
  }
}

const onSendEmail = async (emailFunctionName, bookingId) => {
  await lambda.invoke(
    { 
      FunctionName: emailFunctionName,
      Payload: JSON.stringify({ pathParameters: { bookingId: bookingId } })
    }, (error) => {
      if (error) {
        throw new Error(error)
      }
      console.info(`Approved email sent with success by booking ${bookingId}`)
    }
  ).promise()
}
