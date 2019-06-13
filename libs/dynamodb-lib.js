import AWS from 'aws-sdk';

const checkEnvironment = () => {
  if (process.env.DYNAMODB_LOCAL_SERVER) {
    AWS.config.update({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    });
  }
};

export const call = (action, params) => {
  checkEnvironment();
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
};
