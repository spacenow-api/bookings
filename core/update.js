import uuid from "uuid"

import * as dynamoDbLib from "../libs/dynamodb-lib"
import { success, failure } from "../libs/response-lib"

export async function main(event, context) {

  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.tableName,
    Key: {
      listingId: event.requestContext.listingId,
      bookingId: event.pathParameters.bookingId
    },
    UpdateExpression: "SET hostId = :hostId, guestId = :guestId, reservations = :reservations, quantity = :quantity, basePrice = :basePrice, fees = :fees, currency = :currency, guestServiceFee = :guestServiceFee, hostServiceFee = :hostServiceFee, totalPrice = :totalPrice, confirmationCode = :confirmationCode, paymentState = :paymentState, payoutId = :payoutId, bookingState = :bookingState, paymentMethodId = :paymentMethodId, subscriptionId = :subscriptionId, sourceId = :sourceId, priceType = :priceType, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":hostId": data.hostId || null,
      ":guestId": data.guestId || null,
      ":reservations": data.reservations || null,
      ":quantity": data.quantity || null,
      ":basePrice": data.basePrice || null,
      ":fees": data.fees || null,
      ":currency": data.currency || null,
      ":guestServiceFee": data.guestServiceFee || null,
      ":hostServiceFee": data.hostServiceFee || null,
      ":totalPrice": data.totalPrice || null,
      ":confirmationCode": data.confirmationCode || null,
      ":paymentState": data.paymentState || null,
      ":payoutId": data.payoutId || null,
      ":bookingState": data.bookingState || null,
      ":paymentMethodId": data.paymentMethodId || null,
      ":subscriptionId": data.subscriptionId || null,
      ":sourceId": data.sourceId || null,
      ":priceType": data.priceType || null,
      ":updatedAt": Date.now() || null
    },
    ReturnValues: "ALL_NEW"
  }

  try {
    await dynamoDbLib.call("update", params)
    return success({ status: true })
  } catch (e) {
    console.log(e)
    return failure({ status: false })
  }

}