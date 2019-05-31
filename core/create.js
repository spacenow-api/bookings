import uuid from 'uuid';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import * as queueLib from '../libs/queue-lib';
import { success, failure } from '../libs/response-lib';
import { calcTotal, getDates, getEndDate } from '../validations';

const IS_ABSORVE = 0.035;
const NO_ABSORVE = 0.135;

export const main = async (event, context) => {
  const data = JSON.parse(event.body);
  const queueUrl = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`;

  const bookingId = uuid.v1();

  const confirmationCode = Math.floor((100000 + Math.random()) * 900000);
  const guestServiceFee = data.isAbsorvedFee ? IS_ABSORVE : NO_ABSORVE;
  const hostServiceFee = data.isAbsorvedFee ? 0.1 : 0;

  let reservationDates;
  let totalPrice;

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
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
      bookingId: bookingId,
      listingId: data.listingId,
      blockedDates: reservationDates
    })
  };

  try {
    await dynamoDbLib.call('put', params);
    await queueLib.call(paramsQueue);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false, error: e });
  }
};
