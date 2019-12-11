const AWS = require('aws-sdk')

const lambda = new AWS.Lambda()

module.exports.onCleanAvailabilities = (bookingId) => {
  return new Promise((resolve, reject) => {
    lambda.invoke({
      FunctionName: `spacenow-availabilities-api-${process.env.environment}-deleteByBooking`,
      Payload: JSON.stringify({ pathParameters: { id: bookingId } })
    },
    (error) => {
      if (error) {
        reject(error)
      } else {
        console.info(`Availabilities removed with success to booking ${bookingId}`)
        resolve()
      }
    })
  })
}