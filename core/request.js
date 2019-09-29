import AWS from 'aws-sdk'

import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

const lambda = new AWS.Lambda()

export async function main(event) {
  try {
    const bookingId = event.pathParameters.id
    await Bookings.update(
      { bookingState: BookingStates.REQUESTED, paymentState: BookingStates.COMPLETED },
      { where: { bookingId } }
    )
    const bookingObjUpdated = await Bookings.findOne({ where: { bookingId } })
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestGuest`, bookingId)
    return success({ status: true, data: mapReservations(bookingObjUpdated) })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err })
  }
}

const onSendEmail = (emailFunctionName, bookingId) => {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      {
        FunctionName: emailFunctionName,
        Payload: JSON.stringify({ pathParameters: { bookingId: bookingId } })
      },
      (error) => {
        if (error) {
          reject(error)
        } else {
          console.info(`Requested email sent with success by booking ${bookingId}`)
          resolve()
        }
      }
    )
  })
}
