import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export const main = async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    Key: {
      guestId: event.pathParameters.id,
      listingId: event.pathParameters.listingId,
      bookingState: 'pending'
    }
  };
  try {
    const result = await dynamoDbLib.call('get', params);
    return success(result.Item);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
