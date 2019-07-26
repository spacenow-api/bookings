import AWS from 'aws-sdk';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import updateBookingState from './updateBookingState';
import { BookingStates } from './../validations';

const BOOKINGS_TABLE = process.env.tableName;

const lambda = new AWS.Lambda();

export const main = async (event, context) => {
  if (event.pathParameters.id) {
    let expirationTime = Date.now() - 60000;  // 1 minute to expire to test
    const params = {
      TableName: BOOKINGS_TABLE,
      FilterExpression: 'listingId = :listingId AND bookingState = :bookingState AND createdAt < :expirationTime',
      ExpressionAttributeValues: {
        ':listingId': parseInt(event.pathParameters.id),
        ':bookingState': BookingStates.PENDING,
        ':expirationTime': expirationTime
      }
    };

    try {
      const response = await dynamoDbLib.call('scan', params);
      const bookings = response.Items;
      for (const item of bookings) {
        await updateBookingState(item.bookingId, BookingStates.TIMEOUT);
        await onCleanAvailabilities(item.bookingId);
      }
      return success({ status: true, count: bookings.length });
    } catch (err) {
      return failure({
        status: false,
        error: err
      });
    }
  } else {
    return failure({
      status: false,
      error: `It's not possible check availabilities without a valid 'listingId'.`
    });
  }
};

const onCleanAvailabilities = async bookingId => {
  await lambda.invoke(
    {
      FunctionName: 'spacenow-availabilities-api-sandpit-deleteByBooking',
      Payload: JSON.stringify({ bookingId })
    },
    (error) => {
      if (error) {
        throw new Error(error);
      }
      console.info(`Availabilities removed with success to booking ${bookingId}`);
    }
  );
};
