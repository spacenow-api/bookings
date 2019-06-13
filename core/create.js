import uuid from 'uuid';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import * as queueLib from '../libs/queue-lib';
import { success, failure } from '../libs/response-lib';
import { calcTotal, getDates, getEndDate } from '../validations';

const QUEUE_ULR = `https://sqs.${process.env.region}.amazonaws.com/${
  process.env.accountId
}/${process.env.queueName}`;

const IS_ABSORVE = 0.035;
const NO_ABSORVE = 0.135;

const hasBlockAvailabilities = async (listingId, reservationDates) => {
  try {
    // todo: Consider a query in this case to a better and cheper approach [Arthemus]
    // const response = await dynamoDbLib.call('query', {
    //   TableName: process.env.tableName,
    //   IndexName: 'BookingsByListing',
    //   KeyConditionExpression: 'listingId = :listingId',
    //   ProjectionExpression: 'reservations',
    //   ExpressionAttributeValues: {
    //     ':listingId': listingId
    //   }
    // });
    const response = await dynamoDbLib.call('scan', {
      TableName: process.env.tableName,
      FilterExpression:
        'listingId = :listingId AND (bookingState = :pending OR bookingState = :requested OR bookingState = :accepted)',
      ProjectionExpression: 'reservations',
      ExpressionAttributeValues: {
        ':listingId': listingId,
        ':pending': 'pending',
        ':requested': 'requested',
        ':accepted': 'accepted'
      }
    });
    console.log('\n\n\nhasBlockAvailabilities ->\n\n\n', response);
    return false;
  } catch (err) {
    console.error(err);
    return true; // to block reservations because a query error...
  }
};

export const main = async (event, context) => {
  const data = JSON.parse(event.body);
  if (hasBlockAvailabilities(data.listingId, data.reservations)) {
    return failure({
      status: false,
      error: 'The requested dates are not available.'
    });
  } else {
    const bookingId = uuid.v1();
    const confirmationCode = Math.floor((100000 + Math.random()) * 900000);
    const guestServiceFee = data.isAbsorvedFee ? IS_ABSORVE : NO_ABSORVE;
    const hostServiceFee = data.isAbsorvedFee ? 0.1 : 0;

    let totalPrice;
    let reservationDates;
    if (data.priceType === 'daily') {
      reservationDates = data.reservations;
      totalPrice = calcTotal(
        data.basePrice,
        data.quantity,
        reservationDates.length,
        guestServiceFee
      );
    } else {
      const endDate = getEndDate(
        data.reservations[0],
        data.period,
        data.priceType
      );
      reservationDates = getDates(data.reservations[0], endDate);
      totalPrice = calcTotal(
        data.basePrice,
        data.quantity,
        data.period,
        guestServiceFee
      );
    }

    const params = {
      TableName: process.env.tableName,
      Item: {
        listingId: data.listingId,
        bookingId: bookingId,
        hostId: data.hostId,
        guestId: data.guestId,
        reservations: reservationDates,
        quantity: data.quantity || 1,
        basePrice: data.basePrice,
        fees: data.fees,
        period: data.period,
        currency: data.currency,
        guestServiceFee: guestServiceFee,
        hostServiceFee: hostServiceFee,
        totalPrice: totalPrice,
        confirmationCode: confirmationCode,
        paymentState: 'pending',
        payoutId: data.payoutId,
        bookingState: 'pending',
        bookingType: data.bookingType,
        paymentMethodId: data.paymentMethodId,
        subscriptionId: data.subscriptionId,
        sourceId: data.sourceId,
        priceType: data.priceType,
        updatedAt: Date.now(),
        createdAt: Date.now()
      }
    };

    const paramsQueue = {
      QueueUrl: QUEUE_ULR,
      MessageBody: JSON.stringify({
        bookingId: bookingId,
        listingId: data.listingId,
        blockedDates: reservationDates
      })
    };

    try {
      await dynamoDbLib.call('put', params);
    } catch (err) {
      return failure({ status: false, error: err });
    }
    try {
      await queueLib.call(paramsQueue);
    } catch (err) {
      console.error('\nProblems to register reservation on Queue:', err);
    }
    return success(params.Item);
  }
};
