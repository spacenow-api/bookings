import crypto from 'crypto'

import r from './../helpers/response.utils'

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
  return new Promise((resolve, reject) => {
    try {
      const _token = getToken()
      if (token !== _token) throw new Error('Invalid Security Token.')
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
