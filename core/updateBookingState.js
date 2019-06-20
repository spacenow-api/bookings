import * as dynamoDbLib from '../libs/dynamodb-lib';

export default async (bookingId, state) => {
  const params = {
    TableName: process.env.tableName,
    Key: {
      bookingId: bookingId
    },
    ExpressionAttributeValues: {
      ':bookingState': state,
      ':updatedAt': Date.now()
    },
    UpdateExpression: 'SET bookingState = :bookingState, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW'
  };
  try {
    const { Attributes } = await dynamoDbLib.call('update', params);
    return Attributes;
  } catch (err) {
    throw new Error(err);
  }
};
