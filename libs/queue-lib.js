const AWS = require('aws-sdk');

module.exports = call = params => {
  const sqs = new AWS.SQS();
  return sqs.sendMessage(params).promise();
};
