const AWS = require('aws-sdk');

module.exports = call = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
};
