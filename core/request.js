import AWS from 'aws-sdk'

import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

const lambda = new AWS.Lambda()

export async function main(event) {
  const bookingId = event.pathParameters.id
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: bookingId
    },
    ExpressionAttributeNames: {
      '#booking_state': 'bookingState',
      '#paymentState': 'paymentState'
    },
    ExpressionAttributeValues: {
      ':bookingState': 'requested',
      ':paymentState': 'completed',
      ':updatedAt': Date.now() || null
    },
    UpdateExpression: 'SET #booking_state = :bookingState, #paymentState = :paymentState, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW'
  };
  try {
    const { Attributes } = await dynamoDbLib.call('update', params)
    const environment = process.env.environment
    await onSendEmail(`api-emails-${environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${environment}-sendEmailByBookingRequestGuest`, bookingId)
    return success({ status: true, data: Attributes })
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
}

const onSendEmail = (emailFunctionName, bookingId) => {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      { 
        FunctionName: emailFunctionName,
        Payload: JSON.stringify({ pathParameters: { bookingId: bookingId } })
      }, (error) => {
        if (error) {
          reject(error)
        } else {
          console.info(`Requested email sent with success by booking ${bookingId}`)
          resolve()
        }
      }
    )
  })
}
