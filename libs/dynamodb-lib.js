import AWS from "aws-sdk";

export const call = () => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
}