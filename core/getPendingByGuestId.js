import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export const main = async (event, context) => {
  let expirationTime = Date.now() - 60000;  // 1 minute expire to test
  const params = {
    TableName: process.env.tableName,
    FilterExpression: 'listingId = :listingId AND guestId = :guestId AND bookingState = :bookingState AND createdAt >= :expirationTime',
    ExpressionAttributeValues: {
      ':guestId': event.pathParameters.id,
      'listingId': event.pathParameters.listingId,
      ':bookingState': 'pending',
      ':expiredTime': expirationTime
    }
  };
  try {
    const result = await dynamoDbLib.call('scan', params);
    return success({ count: result.Items.length, bookings: result.Items });
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
