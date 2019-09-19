import AWS from 'aws-sdk'

import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'

import { BookingStates } from './../validations'

const lambda = new AWS.Lambda()

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.id
    },
    ExpressionAttributeNames: {
      '#booking_state': 'bookingState'
    },
    ExpressionAttributeValues: {
      ':bookingState': BookingStates.TIMEOUT,
      ':updatedAt': Date.now() || null
    },
    UpdateExpression:
      'SET #booking_state = :bookingState, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW'
  }
  try {
    const { Attributes } = await dynamoDbLib.call('update', params)
    onCleanAvailabilities(event.pathParameters.id)
    return success({ status: true, data: Attributes })
  } catch (e) {
    console.error(e)
    return failure({ status: false })
  }
}

const onCleanAvailabilities = (bookingId) => {
  const environment = process.env.environment
  lambda.invoke(
    {
      FunctionName: `spacenow-availabilities-api-${environment}-deleteByBooking`,
      Payload: JSON.stringify({ pathParameters: { id: bookingId } })
    },
    (error) => {
      if (error) {
        console.error(error)
      } else {
        console.info(`Availabilities removed with success to booking ${bookingId}`)
      }
    }
  )
}
