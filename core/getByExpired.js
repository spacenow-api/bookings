import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import moment from 'moment'

export const main = async (event, context) => {
  let plusTime = moment().add(1, 'days');
  plusTime = new Date(plusTime)
  console.log('plusTime', plusTime)
  const params = {
    TableName: process.env.tableName,
    FilterExpression: `#bookingState = :bookingState AND #createdAt >= :plusTime`,
    ExpressionAttributeNames: {
      '#bookingState': 'bookingState',
      '#createdAt': 'createdAt'
    },
    ExpressionAttributeValues: {
      ':bookingState': 'requested',
      ':plusTime': plusTime
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
