import * as dynamoDbLib from "../libs/dynamodb-lib"
import { success, failure } from "../libs/response-lib"

export const main = async (event, context) => {
  
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.bookingId
    }
  }

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item)
      return success(result.Item)
    else
      return failure({ status: false, error: "Booking not found." })
  } catch (e) {
    return failure({ status: false })
  }

}