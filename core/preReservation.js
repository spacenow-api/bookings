import uuid from 'uuid';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

const BOOKINGS_PRE_RESERVATION_TABLE = process.env.preReservationTableName;

export const createPreReservation = async bookingId => {
  if (bookingId) {
    try {
      await dynamoDbLib.call('put', {
        TableName: BOOKINGS_PRE_RESERVATION_TABLE,
        Item: {
          id: uuid.v1(),
          bookingId: bookingId,
          ttl: Math.floor(Date.now() / 1000)
        }
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error(
      "It's not possible create a reservation without a 'bookingId'."
    );
  }
};

export const fetchAllPreReservations = async () => {
  try {
    const result = await dynamoDbLib.call('scan', {
      TableName: BOOKINGS_PRE_RESERVATION_TABLE
    });
    return success(result.Items);
  } catch (e) {
    console.error(e);
    return failure({ status: false, error: e });
  }
};

export const getPreReservationsByBookingId = async event => {
  const data = JSON.parse(event.body);
  if (data && data.bookingId) {
    try {
      const result = await dynamoDbLib.call('scan', {
        TableName: BOOKINGS_PRE_RESERVATION_TABLE,
        FilterExpression: 'bookingId = :bookingId',
        ExpressionAttributeValues: { ':bookingId': data.bookingId }
      });
      return success(result.Items);
    } catch (e) {
      console.error(e);
      return failure({ status: false, error: e });
    }
  } else {
    return failure({
      status: false,
      error: "The field 'bookingId' is required."
    });
  }
};
