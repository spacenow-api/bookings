import AWS from 'aws-sdk'

const lambda = new AWS.Lambda()

export const onSendEmail = (emailFunctionName, bookingId) => {
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
