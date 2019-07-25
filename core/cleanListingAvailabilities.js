import AWS from 'aws-sdk';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { fetchPreReservationsByBookingId } from './preReservation';
import updateBookingState from './updateBookingState';
import { BookingStates } from './../validations';

const BOOKINGS_TABLE = process.env.tableName;

const lambda = new AWS.Lambda();

export const main = async event => {
  // const data = JSON.parse(event.body);
  console.log('event.pathParameters.id', event.pathParameters.id)
  if (event.pathParameters.id) {
    let expirationTime = Date.now() - 60000;  // 1 minute to expire
    console.log('expirationTime', expirationTime)
    try {
      const response = await dynamoDbLib.call('scan', {
        TableName: BOOKINGS_TABLE,
        FilterExpression: 'listingId = :listingId AND (bookingState = :pending) AND (createdAt <= :expirationTime)',
        ProjectionExpression: 'bookingId',
        ExpressionAttributeValues: {
          ':listingId': event.pathParameters.id,
          ':pending': BookingStates.PENDING,
          ':expirationTime': expirationTime
        }
      });
      const bookings = response.Items;
      console.log('bookings', bookings)
      for (const item of bookings) {
        await updateBookingState(item.bookingId, BookingStates.TIMEOUT);
        await onCleanAvailabilities(item.bookingId);
      }
      return success({ status: true });
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
