import uuid from 'uuid';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

const BOOKINGS_PRE_RESERVATION_TABLE = process.env.preReservationTableName;

export const createPreReservation = async bookingId => {
  if (bookingId) {
    const expireTime = Math.floor(new Date(Date.now() + 60 * 1000) / 1000);
    try {
      await dynamoDbLib.call('put', {
        TableName: BOOKINGS_PRE_RESERVATION_TABLE,
        Item: {
          id: uuid.v1(),
          bookingId: bookingId,
          ttl: expireTime
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
  try {
    const result = await dynamoDbLib.call('scan', {
      TableName: BOOKINGS_PRE_RESERVATION_TABLE,
      FilterExpression: 'bookingId = :bookingId',
      ExpressionAttributeValues: { ':bookingId': event.pathParameters.id }
    });
    return success(result.Items);
  } catch (e) {
    console.error(e);
    return failure({ status: false, error: e });
  }
};
