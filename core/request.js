import * as dynamoDbLib from "../libs/dynamodb-lib"
import { success, failure } from "../libs/response-lib"

export async function main(event, context) {

  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.id
    },
    ExpressionAttributeNames: {
      '#booking_state': 'bookingState',
      '#paymentState': 'paymentState',
    },
    ExpressionAttributeValues: {
      ":bookingState": "requested",
      ":paymentState": "completed",
      ":updatedAt": Date.now() || null
    },
    UpdateExpression: "SET #booking_state = :bookingState, #paymentState = :paymentState, updatedAt = :updatedAt",
    ReturnValues: "ALL_NEW"
  }

  try {
    await dynamoDbLib.call("update", params)
    return success({ status: true })
  } catch (e) {
    console.log(e)
    return failure({ status: false })
  }

}