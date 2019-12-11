const AWS = require('aws-sdk')

const lambda = new AWS.Lambda()

module.exports.onSendEmail = (emailFunctionName, bookingId) => {
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
          console.info(`Email sent with success by booking ${bookingId}`)
          resolve()
        }
      }
    )
  })
}
