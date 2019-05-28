import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export const main = async event => {
  console.debug(`Booking Update: ${event.pathParameters.id}`);
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.id
    },
    ExpressionAttributeNames: {
      '#sourceId': 'sourceId',
      '#chargeId': 'chargeId',
    },
    ExpressionAttributeValues: {
      ":updatedAt": Date.now(),
      ":sourceId": data.sourceId,
      ":chargeId": data.chargeId,
    },
    UpdateExpression: "SET #updatedAt = :updatedAt, #sourceId = :sourceId, #chargeId = :chargeId",
    ReturnValues: "ALL_NEW"
  }
  try {
    await dynamoDbLib.call('update', params);
    return success({ status: true });
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
