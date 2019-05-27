import uuid from "uuid"

import * as dynamoDbLib from "../libs/dynamodb-lib"
import * as queueLib from "../libs/queue-lib"
import { success, failure } from "../libs/response-lib"

export const main = async (event, context) => {

  const data = JSON.parse(event)
  const queueUrl = `https://sqs.${process.env.region}.amazonaws.com/${process.env.accountId}/${process.env.queueName}`;
  const bookingId = uuid.v1();

  const params = {
    TableName: process.env.tableName,
    Item: {
      listingId: data.listingId,
      bookingId: bookingId,
      hostId: data.body.hostId,
      guestId: data.body.guestId,
      reservations: data.body.reservations,
      quantity: data.body.quantity,
      basePrice: data.body.basePrice,
      fees: data.body.fees,
      currency: data.body.currency,
      guestServiceFee: data.body.guestServiceFee,
      hostServiceFee: data.body.hostServiceFee,
      totalPrice: data.body.totalPrice,
      confirmationCode: data.body.confirmationCode,
      paymentState: "pending",
      payoutId: data.body.payoutId,
      bookingState: "pending",
      paymentMethodId: data.body.paymentMethodId,
      subscriptionId: data.body.subscriptionId,
      sourceId: data.body.sourceId,
      priceType: data.body.priceType,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }
  }

  const paramsQueue = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ bookingId: bookingId, listingId: data.listingId, blockedDates: data.body.reservations })
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