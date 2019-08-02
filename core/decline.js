import AWS from 'aws-sdk'

import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { BookingStates } from './../validations'

const lambda = new AWS.Lambda()

export async function main(event) {
  const bookingId = event.pathParameters.id
  const { Item: bookingObj } = await dynamoDbLib.call('get', {
    TableName: process.env.tableName,
    Key: {
      bookingId: bookingId
    }
  })
  if (BookingStates.REQUESTED === bookingObj.bookingState) {
    const params = {
      TableName: process.env.tableName,
      Key: {
        bookingId: event.pathParameters.id
      },
      ExpressionAttributeNames: {
        '#booking_state': 'bookingState'
      },
      ExpressionAttributeValues: {
        ':bookingState': BookingStates.DECLINED,
        ':updatedAt': Date.now()
      },
      UpdateExpression:
        'SET #booking_state = :bookingState, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW'
    }
    try {
      const { Attributes } = await dynamoDbLib.call('update', params)
      await onCleanAvailabilities(bookingId)
      return success({ status: true, data: Attributes })
    } catch (e) {
      console.error(e)
      return failure({ status: false })
    }
  } else {
    console.warn(`Booking ${bookingId} is not Requested.`)
    return success({ status: false })
  }
}

const onCleanAvailabilities = async bookingId => {
  console.info(`Delete Availabilities by Booking ${bookingId}`)
  await lambda.invoke(
    {
      FunctionName: 'spacenow-availabilities-api-sandpit-deleteByBooking',
      Payload: JSON.stringify({ pathParameters: { id: bookingId } })
    },
    error => {
      if (error) {
        throw new Error(error)
      }
      console.info(
        `Availabilities removed with success to booking ${bookingId}`
      )
    }
  )
}
