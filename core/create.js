import uuid from 'uuid';

import * as dynamoDbLib from '../libs/dynamodb-lib';
import * as queueLib from '../libs/queue-lib';
import { success, failure } from '../libs/response-lib';

export const main = async event => {
  const queueUrl = `https://sqs.${process.env.region}.amazonaws.com/${
    process.env.accountId
  }/${process.env.queueName}`;

  const data = JSON.parse(event.body);

  const bookingId = uuid.v1();

  const confirmationCode = Math.floor((100000 + Math.random()) * 900000);

  let hostServiceFee = 0;
  let guestServiceFee = 13.5;
  if (data.isAbsorvedFee) {
    hostServiceFee = 10;
    guestServiceFee = 3.5;
  }

  const params = {
    TableName: process.env.tableName,
    Item: {
      bookingId: bookingId,
      listingId: data.listingId,
      confirmationCode: confirmationCode,
      hostId: data.hostId,
      guestId: data.guestId,
      quantity: 1,
      basePrice: data.basePrice,
      currency: data.currency,
      guestServiceFee: guestServiceFee,
      hostServiceFee: hostServiceFee,
      totalPrice: data.totalPrice,
      paymentState: 'pending',
      bookingState: 'pending',
      bookingType: data.bookingType,
      priceType: data.priceType,
      periodQuantity: data.periodQuantity,
      reservations: data.reservations,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }
  };

  const paramsQueue = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
      bookingId: bookingId,
      listingId: data.listingId,
      blockedDates: data.reservations
    })
  };

  try {
    await dynamoDbLib.call('put', params);
    await queueLib.call(paramsQueue);
    return success(params.Item);
  } catch (e) {
    return failure({ status: 'error', error: e });
  }
};
