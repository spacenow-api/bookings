import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import moment from 'moment'

export const main = async (event, context) => {
  const currentDate = moment().format('YYYY-MM-DD').toString();
  const params = {
    TableName: process.env.tableName,
    FilterExpression: `#bookingState = :bookingState AND #checkOut > :currentDate`,
    ExpressionAttributeNames: {
      '#bookingState': 'bookingState',
      '#checkOut': 'checkOut'
    },
    ExpressionAttributeValues: {
      ':bookingState': 'approved',
      ':currentDate': currentDate
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
