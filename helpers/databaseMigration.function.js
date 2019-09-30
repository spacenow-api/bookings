import crypto from 'crypto'

import * as dynamoDbLib from './../libs/dynamodb-lib'
import r from './../helpers/response.utils'
import { Bookings, Availabilities } from './../models'

const SECRET_KEY = 'S3c73jsu!'

export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  execute(event.pathParameters.token)
    .then((data) => callback(null, r.success(data)))
    .catch((err) => callback(null, r.failure(err)))
}

const getToken = () =>
  crypto
    .createHash('sha256')
    .update(SECRET_KEY, 'utf8')
    .digest('hex')

function execute(token) {
  return new Promise(async (resolve, reject) => {
    var currentRecord
    try {
      const _token = getToken()
      if (token !== _token) {
        throw new Error('Invalid Security Token.')
      }

      // Migrating Bookings...
      const { Items: dynamoBookings } = await dynamoDbLib.call('scan', {
        TableName: `${process.env.environment}-bookings`
      })
      for (const item of dynamoBookings) {
        currentRecord = item
        const count = await Bookings.count({
          where: { bookingId: item.bookingId }
        })
        if (count <= 0) {
          if (item.listingId && item.hostId && item.guestId && item.confirmationCode) {
            await Bookings.create({
              bookingId: item.bookingId,
              listingId: item.listingId,
              hostId: item.hostId,
              guestId: item.guestId,
              confirmationCode: item.confirmationCode,
              priceType: item.priceType,
              quantity: item.quantity,
              currency: item.currency,
              period: item.period,
              basePrice: item.basePrice,
              hostServiceFee: item.hostServiceFee,
              guestServiceFee: item.guestServiceFee,
              totalPrice: item.totalPrice,
              bookingType: item.bookingType,
              bookingState: item.bookingState,
              paymentState: item.paymentState,
              checkIn: item.checkIn,
              checkOut: item.checkOut,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              reservations: item.reservations.join(',')
            })
          } else {
            console.warn(`Booking ${item.bookingId} doesn't have enough informations.`)
          }
        }
      }

      // Migrating Availabilities...
      const { Items: dynamoAvailabilities } = await dynamoDbLib.call('scan', {
        TableName: `${process.env.environment}-availabilities`
      })
      for (const item of dynamoAvailabilities) {
        currentRecord = item
        const count = await Availabilities.count({
          where: { availabilityId: item.availabilityId }
        })
        if (count <= 0) {
          await Availabilities.create({
            availabilityId: item.availabilityId,
            bookingId: item.bookingId,
            listingId: item.listingId,
            blockedDates: item.blockedDates.join(','),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          })
        }
      }

      resolve()
    } catch (err) {
      console.error('Record with error: ', currentRecord)
      reject({ err })
    }
  })
}
