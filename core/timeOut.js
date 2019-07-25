import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

import { main as getBookings } from './get';

export async function main(event, context) {

  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: event.pathParameters.id
    },
    ExpressionAttributeNames: {
      '#booking_state': 'bookingState'
    },
    ExpressionAttributeValues: {
      ':bookingState': 'timeout',
      ':updatedAt': Date.now() || null
    },
    UpdateExpression:
      'SET #booking_state = :bookingState, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW'
  };

  try {
    // setTimeout(async () => {
      const booking = await getBookings({ pathParameters: {id:  event.pathParameters.id }});
      console.log('booking.body', booking.body)
      console.log('booking.body.state', booking.body.bookingState)
      if (booking.body.bookingState == 'pending') {
        console.log('ENTRA AL IF')
        await dynamoDbLib.call('update', params);
        return success({ status: true });
        // clean availability
      }
      // return success({ status: true });
    //  }, 60000);
     
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
}
