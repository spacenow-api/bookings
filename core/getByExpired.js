import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import moment from 'moment'

export const main = async (event, context) => {
  let plusHour = moment().subtract(26, 'hours').unix()*1000;
  let lessHour = moment().subtract(24, 'hours').unix()*1000;

  const params = {
    TableName: process.env.tableName,
    FilterExpression: `#bookingState = :bookingState AND #createdAt BETWEEN :lessHour AND :plusHour`,
    ExpressionAttributeNames: {
      '#bookingState': 'bookingState',
      '#createdAt': 'createdAt'
    },
    ExpressionAttributeValues: {
      ':bookingState': 'requested',
      ':plusHour': plusHour,
      ':lessHour': lessHour
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
