import AWS from 'aws-sdk'

import { success, failure } from '../libs/response-lib'
import { BookingStates, mapReservations } from './../validations'
import { Bookings } from './../models'

const lambda = new AWS.Lambda()

export async function main(event) {
  const bookingId = event.pathParameters.id
  const bookingObj = await Bookings.findOne({ where: { bookingId } })
  if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
    try {
      await Bookings.update(
        { bookingState: BookingStates.APPROVED, paymentState: 'completed' },
        { where: { bookingId } }
      )
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantGuest`, bookingId)
      const bookingObjUpdated = await Bookings.findOne({ where: { bookingId } })
      return success({ status: true, data: mapReservations(bookingObjUpdated) })
    } catch (e) {
      return failure({ status: 'error', error: e })
    }
  } else {
    console.warn(`Booking ${bookingId} is not Requested.`)
    return success({ status: true, data: mapReservations(bookingObj), blockEmails: true })
  }
}

const onSendEmail = (emailFunctionName, bookingId) => {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      { 
        FunctionName: emailFunctionName,
        Payload: JSON.stringify({ pathParameters: { bookingId: bookingId } })
      }, (error) => {
        if (error) {
          reject(error)
        } else {
          console.info(`Approved email sent with success by booking ${bookingId}`)
          resolve()
        }
      }
    )
  })
}
