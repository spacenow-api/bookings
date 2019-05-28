import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export const main = async event => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.id
    },
    ExpressionAttributeValues: {
      ':updatedAt': Date.now(),
      ':sourceId': data.sourceId,
      ':chargeId': data.chargeId
    },
    UpdateExpression:
      'SET updatedAt = :updatedAt, sourceId = :sourceId, chargeId = :chargeId',
    ReturnValues: 'ALL_NEW'
  };
  try {
    const { Items } = await dynamoDbLib.call('update', params);
    return success({ status: 'updated', data: Items });
  } catch (e) {
    return failure({ status: 'error', error: e });
  }
};
