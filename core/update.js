// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { mapReservations } from './../validations'
import { Bookings } from './../models'

export const main = async (event) => {
  try {
    // const data = JSON.parse(event.body)
    // const { Attributes } = await dynamoDbLib.call('update', {
    //   TableName: process.env.tableName,
    //   Key: {
    //     bookingId: event.pathParameters.id
    //   },
    //   ExpressionAttributeValues: {
    //     ':updatedAt': Date.now(),
    //     ':sourceId': data.sourceId,
    //     ':chargeId': data.chargeId
    //   },
    //   UpdateExpression: 'SET updatedAt = :updatedAt, sourceId = :sourceId, chargeId = :chargeId',
    //   ReturnValues: 'ALL_NEW'
    // })
    // return success({ status: 'updated', data: Attributes })
    const data = JSON.parse(event.body)
    await Bookings.update(
      { sourceId: data.sourceId, chargeId: data.chargeId },
      { where: { bookingId: event.pathParameters.id } }
    )
    const bookingObjUpdated = await Bookings.findOne({ where: { bookingId: event.pathParameters.id } })
    return success({ status: 'updated', data: mapReservations(bookingObjUpdated) })
  } catch (err) {
    console.error(err)
    return failure({ status: 'error', error: err })
  }
}
