import AWS from 'aws-sdk';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { fetchPreReservationsByBookingId } from './preReservation';
import updateBookingState from './updateBookingState';
import { BookingStates } from './../validations';

const BOOKINGS_TABLE = process.env.tableName;

const lambda = new AWS.Lambda();

export const main = async event => {
  const data = JSON.parse(event.body);
  if (data.listingId) {
    try {
      console.log('Listing ID =>', data.listingId);
      const response = await dynamoDbLib.call('scan', {
        TableName: BOOKINGS_TABLE,
        FilterExpression: 'listingId = :listingId AND (bookingState = :pending)',
        ProjectionExpression: 'bookingId',
        ExpressionAttributeValues: {
          ':listingId': data.listingId,
          ':pending': BookingStates.PENDING
        }
      });
      const bookings = response.Items;
      console.log('Bookings =>', response.Items);
      for (const item of bookings) {
        const preReservations = await fetchPreReservationsByBookingId(item.bookingId);
        console.log('Pre Reservations =>', preReservations);
        for (const pre of preReservations) {
          console.log('Is expired =>', pre);
          if (pre.isExpired) {
            await updateBookingState(item.bookingId, BookingStates.TIMEOUT);
            await onCleanAvailabilities(item.bookingId);
          }
        }
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
      Payload: JSON.stringify(bookingId)
    },
    (error, data) => {
      if (error) {
        throw new Error(error);
      }
      console.info(`Availabilities removed with success to booking ${bookingId}`);
      console.log('onCleanAvailabilities', data);
    }
  );
};
