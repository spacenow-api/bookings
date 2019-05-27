import * as dynamoDbLib from "../libs/dynamodb-lib"
import { success, failure } from "../libs/response-lib"

export const main = async (event, context) => {
  
  const params = {
    TableName: process.env.tableName,
    FilterExpression: "#gId = :guestId",
    ExpressionAttributeNames:{
        "#gId": "guestId"
    },
    ExpressionAttributeValues: {
      ":guestId": event.pathParameters.id
    }
  }

  try {
    const result = await dynamoDbLib.call("scan", params);
    return success(result.Items)
  } catch (e) {
    console.log(e)
    return failure({ status: false })
  }

}