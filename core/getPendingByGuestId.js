import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export const main = async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    FilterExpression: 'listingId = :listingId AND guestId = :guestId AND bookingState = :bookingState',
    ExpressionAttributeValues: {
      ':guestId': event.pathParameters.id,
      ':listingId': event.pathParameters.listingId,
      ':bookingState': 'pending'
    }
  };
  try {
    console.log('params', params)
    console.log('event.pathParameters.listingId', event.pathParameters.listingId)
    console.log('event.pathParameters.id', event.pathParameters.id)
    const result = await dynamoDbLib.call('scan', params);
    console.log(result)
    return success({ count: result.Items.length, bookings: result.Items });
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};
