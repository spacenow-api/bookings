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
      console.log('---- >booking id', event.pathParameters.id)
      const booking = await getBookings({ pathParameters: {id:  event.pathParameters.id }});
      console.log('----> booking.body', booking.body)
      const bookingData = await booking.json();

      console.log('----> booking', booking)
      
      console.log('----> bookingData', bookingData)
      if (bookingData.bookingState == 'pending') {
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
