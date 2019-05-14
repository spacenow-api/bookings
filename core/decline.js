import uuid from "uuid"

import * as dynamoDbLib from "../libs/dynamodb-lib"
import { success, failure } from "../libs/response-lib"

export async function main(event, context) {

  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.tableName,
    Key: {
      listingId: event.listingId,
      bookingId: event.pathParameters.bookingId
    },
    UpdateExpression: "SET bookingState = :bookingState, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":bookingState": "Declined",
      ":updatedAt": Date.now() || null
    },
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