const AWS = require('aws-sdk');

/**
 * @deprecated
 */
module.exports = call = params => {
  const sqs = new AWS.SQS();
  return sqs.sendMessage(params).promise();
};
