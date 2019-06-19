import uuid from 'uuid';
import moment from 'moment';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import * as queueLib from '../libs/queue-lib';
import { success, failure } from '../libs/response-lib';
import { createPreReservation } from './preReservation';
import { calcTotal, getDates, getEndDate } from '../validations';

const QUEUE_ULR = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`;

const BOOKINGS_TABLE = process.env.tableName;

const IS_ABSORVE = 0.035;
const NO_ABSORVE = 0.135;

const hasBlockAvailabilities = async (listingId, reservationDates) => {
  try {
    const response = await dynamoDbLib.call('scan', {
      TableName: BOOKINGS_TABLE,
      FilterExpression: 'listingId = :listingId AND (bookingState = :pending OR bookingState = :requested OR bookingState = :accepted)',
      ProjectionExpression: 'reservations',
      ExpressionAttributeValues: {
        ':listingId': listingId,
        ':pending': 'pending',
        ':requested': 'requested',
        ':accepted': 'accepted'
      }
    });

    let reservationsFromBooking = response.Items.map(o => o.reservations);
    reservationsFromBooking = [].concat.apply([], reservationsFromBooking);

    const similars = [];
    reservationsFromBooking.forEach(fromBooking => {
      reservationDates.forEach(toCreate => {
        if (moment(fromBooking).isSame(toCreate, 'day')) {
          if (similars.indexOf(toCreate) === -1) {
            similars.push(toCreate);
          }
        }
      });
    });

    return similars.length > 0;
  } catch (err) {
    console.error(err);
    return true; // to block reservations if has a query error...
  }
};

export const main = async (event, context) => {
  const data = JSON.parse(event.body);

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

  if (await hasBlockAvailabilities(data.listingId, reservationDates)) {
    return failure({
      status: false,
      error: 'The requested dates are not available.'
    });
  } else {
    // Defining checkIn, checkOut booking dates...
    const sortedReservations = reservationDates.sort((a, b) => a.valueOf() - b.valueOf());
    const checkIn = moment(sortedReservations[0]).format('YYYY-MM-DD').toString();
    const checkOut = moment(sortedReservations[sortedReservations.length - 1]).format('YYYY-MM-DD').toString();

    const params = {
      TableName: BOOKINGS_TABLE,
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
        checkIn,
        checkOut,
        updatedAt: Date.now(),
        createdAt: Date.now()
      }
    };

    // Creating record on 'bookings' table...
    try {
      await dynamoDbLib.call('put', params);
    } catch (err) {
      return failure({ status: false, error: err });
    }

    // Creating record on 'bookings-pre-reservation' table...
    try {
      await createPreReservation(bookingId);
      console.debug('Pre-Reservation created with success.');
    } catch (err) {
      console.error('\nProblems to register a pre-reservation record:', err);
    }

    // Creating availabilities...
    try {
      await queueLib.call({
        QueueUrl: QUEUE_ULR,
        MessageBody: JSON.stringify({
          bookingId: bookingId,
          listingId: data.listingId,
          blockedDates: reservationDates
        })
      });
    } catch (err) {
      console.error('\nProblems to register reservation on Queue:', err);
    }
    return success(params.Item);
  }
};
