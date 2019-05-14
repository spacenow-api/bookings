import uuid from "uuid"

import * as dynamoDbLib from "../libs/dynamodb-lib"
import { success, failure } from "../libs/response-lib"

export const main = async (event, context) => {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.tableName,
    Item: {
      listingId: event.requestContext.listingId,
      bookingId: uuid.v1(),
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

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false })
  }
  
}