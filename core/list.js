// import * as dynamoDbLib from '../libs/dynamodb-lib'
import { success, failure } from '../libs/response-lib'
import { Bookings } from './../models'

export const main = async () => {
  try {
    // const result = await dynamoDbLib.call('scan', {
    //   TableName: process.env.tableName
    // })
    // return success(result.Items)
    const result = await Bookings.findAll()
    result.map((o) => {
      const reservationsString = o.reservations
      o.reservations = reservationsString.split(',')
    })
    return success(result)
  } catch (err) {
    console.error(err)
    return failure({ status: false })
  }
}
