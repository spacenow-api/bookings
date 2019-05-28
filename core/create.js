import uuid from "uuid"

import * as dynamoDbLib from "../libs/dynamodb-lib"
import * as queueLib from "../libs/queue-lib"
import { success, failure } from "../libs/response-lib"
import { calcTotal, getDates, getEndDate } from '../validations'

export const main = async (event, context) => {

  const data = JSON.parse(event.body)
  const queueUrl = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`;
  const bookingId = uuid.v1();

  const confirmationCode = Math.floor((100000 + Math.random()) * 900000);
  const guestServiceFee = data.isAbsorvedFee ? 1.035 : 1.135;
  const hostServiceFee = data.isAbsorvedFee ? 1.1 : 1;
  const endDate = getEndDate(data.reservations[0], data.period, data.bookingType);
  const reservationDates = getDates(data.reservations[0], endDate);

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
      totalPrice: calcTotal(data.basePrice, data.quantity, data.period, guestServiceFee),
      confirmationCode: confirmationCode,
      paymentState: "pending",
      payoutId: data.payoutId,
      bookingState: "pending",
      bookingType: data.bookingType,
      paymentMethodId: data.paymentMethodId,
      subscriptionId: data.subscriptionId,
      sourceId: data.sourceId,
      priceType: data.priceType,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }
  }

  const paramsQueue = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ bookingId: bookingId, listingId: data.listingId, blockedDates: reservationDates })
  }

  try {
    await dynamoDbLib.call("put", params);
    await queueLib.call(paramsQueue);
    return success(params.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false })
  }
  
}