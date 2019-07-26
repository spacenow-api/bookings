import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export const main = async (event, context) => {
  console.log('guestId', event.pathParameters.id)
  console.log('typeof guestId', typeof event.pathParameters.id)
  console.log('listingId', event.pathParameters.listingId)
  console.log('typeof listingId', typeof event.pathParameters.listingId)
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingState: 'pending',
      guestId: event.pathParameters.id,
      listingId: event.pathParameters.listingId
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
