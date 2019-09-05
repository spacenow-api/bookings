import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

import { BookingStates } from './../validations';

export const main = async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    FilterExpression: '#gId = :guestId AND #bState <> :bookingState',
    ExpressionAttributeNames: {
      '#gId': 'guestId',
      '#bState': 'bookingState'
    },
    ExpressionAttributeValues: {
      ':guestId': event.pathParameters.id,
      ':bookingState': BookingStates.TIMEOUT
    }
  };
  try {
    const result = await dynamoDbLib.call('scan', params);
    return success({ count: result.Items.length, items: result.Items });
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
