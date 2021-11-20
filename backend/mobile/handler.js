const AWS = require('aws-sdk');
const withSentry = require('serverless-sentry-lib');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

module.exports.remove_me = withSentry(async (event) => {
    return {statusCode: 200};
});


// REMOVE AFTER ADDING A RELEVANT FUNCTION
// module.exports.get_easter_eggs = withSentry(async (event) => {
//   if (!event.queryStringParameters || !event.queryStringParameters.user_id) {
//     return {
//       statusCode: 500,
//       body: 'get_user_shortlink_clicks expects key "user_id"',
//     };
//   }
//   const ddb = new AWS.DynamoDB.DocumentClient();

//   const userId = event.queryStringParameters.user_id;

//   const params = {
//     TableName: process.env.EASTER_EGGS_TABLE,
//     FilterExpression: 'user_id = :val',
//     ExpressionAttributeValues: {
//       ':val': userId,
//     },
//   };
//   let results = [];
//   let end = false;

//   while (!end) {
//     const result = await ddb.scan(params).promise();
//     results = results.concat(result.Items);
//     if (!result.LastEvaluatedKey) {
//       end = true;
//     }
//     params.ExclusiveStartKey = result.LastEvaluatedKey;
//   }

//   return {
//     statusCode: 200,
//     body: JSON.stringify(results),
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Credentials': true,
//     },
//   };
// });
