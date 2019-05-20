import AWS from "aws-sdk";

export const call = (params) => {
  const sqs = new AWS.SQS();
  return sqs.sendMessage(params).promise();
}