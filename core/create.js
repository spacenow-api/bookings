import uuid from "uuid"

import * as dynamoDbLib from "../libs/dynamodb-lib"
import * as queueLib from "../libs/queue-lib"
import { success, failure } from "../libs/response-lib"

export const main = async (event, context) => {

  const data = JSON.parse(event.body)
  const queueUrl = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`;
  const bookingId = uuid.v1();

  const params = {
    TableName: process.env.tableName,
    Item: {
      listingId: event.listingId,
      bookingId: bookingId,
      hostId: data.hostId,
      guestId: data.guestId,
      reservations: data.reservations,
      quantity: data.quantity,
      basePrice: data.basePrice,
      fees: data.fees,
      currency: data.currency,
      guestServiceFee: data.guestServiceFee,
      hostServiceFee: data.hostServiceFee,
      totalPrice: data.totalPrice,
      confirmationCode: data.confirmationCode,
      paymentState: "Pending",
      payoutId: data.payoutId,
      bookingState: "Pending",
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
    MessageBody: JSON.stringify({ bookingId: bookingId, listingId: event.listingId, blockedDates: data.reservations })
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