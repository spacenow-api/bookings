import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import moment from 'moment'

export const main = async (event, context) => {
  // let plusTime = moment().subtract(1, 'days').unix()*1000;
  let plusHour = moment().subtract(1, 'days').add(35, 'minutes').unix()*1000;
  let lessHour = moment().subtract(1, 'days').subtract(35, 'minutes').unix()*1000;
  console.log('plusHour', plusHour)
  console.log('lessHour', lessHour)

  const params = {
    TableName: process.env.tableName,
    FilterExpression: `#bookingState = :bookingState AND #createdAt BETWEEN :plusHour AND :lessHour`,
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
