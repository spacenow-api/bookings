import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';
import { fetchPreReservationsByBookingId } from './preReservation';
import updateBookingState from './updateBookingState';
import { BookingStates } from './../validations';

const BOOKINGS_TABLE = process.env.tableName;

export default async event => {
  const data = JSON.parse(event.body);
  if (data.listingId) {
    try {
      const response = await dynamoDbLib.call('scan', {
        TableName: BOOKINGS_TABLE,
        FilterExpression: 'listingId = :listingId AND (bookingState = :pending)',
        ProjectionExpression: 'bookingId',
        ExpressionAttributeValues: {
          ':listingId': data.listingId,
          ':pending': 'pending'
        }
      });
      const bookings = response.Items;
      for (const item of bookings) {
        const preReservations = await fetchPreReservationsByBookingId(item.bookingId);
        for (const pre of preReservations) {
          if (pre.isExpired) {
            await updateBookingState(item.bookingId, BookingStates.PEDDING);
            await onCleanAvailabilities(item.bookingId);
          }
        }
      }
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

const onCleanAvailabilities = async (bookingId) => {
  
}
