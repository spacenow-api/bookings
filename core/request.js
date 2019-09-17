import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.id
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
    await onSendEmail(`spacenow-api-emails-${environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`spacenow-api-emails-${environment}-sendEmailByBookingRequestGuest`, bookingId)
    return success({ status: true, data: Attributes })
  } catch (e) {
    console.error(e);
    return failure({ status: false });
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
