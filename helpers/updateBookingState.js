// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { mapReservations } from './../validations'
import { Bookings } from './../models'

export default async (bookingId, state) => {
  try {
    // const { Attributes } = await dynamoDbLib.call('update', {
    //   TableName: process.env.tableName,
    //   Key: {
    //     bookingId: bookingId
    //   },
    //   ExpressionAttributeValues: {
    //     ':bookingState': state,
    //     ':updatedAt': Date.now()
    //   },
    //   UpdateExpression: 'SET bookingState = :bookingState, updatedAt = :updatedAt',
    //   ReturnValues: 'ALL_NEW'
    // })
    // return Attributes
    await Bookings.update({ bookingState: state }, { where: { bookingId } })
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    return mapReservations(bookingObj)
  } catch (err) {
    throw err
  }
}
