const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const withSentry = require('serverless-sentry-lib');
const twilio = require('twilio');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

// Adds hacker to speed chat queue
module.exports.join_chat = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica'); // TODO load jwt secret from environment vars

  const ddb = new AWS.DynamoDB.DocumentClient();

  // return 500 if jwt does not contain email
  if (!decoded.email) {
    return {
      statusCode: 500,
      body: 'join_chat expects an email',
    };
  }

  // add hacker email and priority (by time) to HACKER_QUEUE table
  const params = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    Item: {
      email: decoded.email,
      priority: Math.floor(new Date().getTime() / 1000),
    },
  };

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

// Removes active sponsor from the database
// Route restricted to users with role sponsor
module.exports.mark_sponsor_offline = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!decoded.email) {
    return {
      statusCode: 500,
      body: 'mark_sponsor_offline expects key "email"',
    };
  }

  const params = {
    TableName: process.env.ACTIVE_SPONSORS_TABLE,
    Key: {
      email: decoded.email,
    },
  };

  // Call DynamoDB to delete the item in the table
  await ddb.delete(params).promise();

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

// Adds new active sponsor to the database
// Route restricted to users with role sponsor
module.exports.mark_sponsor_active = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!decoded.id || !decoded.name || !decoded.email) {
    return {
      statusCode: 500,
      body: 'mark_sponsor_active expects keys "id", "name", and "email"',
    };
  }

  // get sponsor company from USERS_TABLE to create room name
  const sponsorParams = {
    TableName: process.env.USERS_TABLE,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': decoded.id,
    },
  };

  const sponsorResult = await ddb.query(sponsorParams).promise();
  const company = sponsorResult.Items[0].group;
  const first = decoded.name.split(' ')[0];

  let room = `${company}-${first}-`;

  // add 5 random letters to the end of the room name
  for (let i = 0; i < 5; i += 1) {
    room += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }

  const params = {
    TableName: process.env.ACTIVE_SPONSORS_TABLE,
    Item: {
      email: decoded.email,
      company: sponsorResult.Items[0].group,
      room_name: room,
      status: 'ready',
    },
  };

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

// Generate user tokens using Twilio API keys
// Route accessible to all roles
module.exports.generate_twilio_token = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');

  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerTwilioKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.TWILIO_SECRET_NAME },
  ).promise();
  const twilioKeyJSON = JSON.parse(SecretsManagerTwilioKey.SecretString);

  const twilioToken = new twilio.jwt.AccessToken(
    twilioKeyJSON.ACCOUNT_SID,
    twilioKeyJSON.API_KEY,
    twilioKeyJSON.API_SECRET,
  );

  // Assign identity to the token
  twilioToken.identity = decoded.email;

  // Grant the access token Twilio Video capabilities
  const grant = new twilio.jwt.AccessToken.VideoGrant();
  // TODO: Consider adding room grant support
  // grant.room = room;
  twilioToken.addGrant(grant);

  // Serialize the token to a JWT string
  return {
    body: JSON.stringify({
      token: twilioToken.toJwt(),
    }),
    headers: HEADERS,
  };
});

// Pops a hacker from the chats queue
// Route restricted to users with role sponsor
module.exports.pop_hacker = withSentry(async (event) => {
  const decoded = jwt.verify(event.header.Authorization, 'technica');
  const sponsor = decoded.email;
  const ddb = new AWS.DynamoDB.DocumentClient();

  // Define params for scanning
  const params = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    FilterExpression: 'NOT contains (seen, :company)',
    ExpressionAttributeValues: {
      ':company': sponsor,
    },
  };

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  // Get the hacker's email from the top of the scanned results
  const { Items } = await ddb.scan(params).promise();
  const hacker = Items[0].email;
  const hackerPriority = Items[0].priority;

  // Define params for updating
  const updateParams = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    Key: {
      email: hacker,
      priority: hackerPriority,
    },
    UpdateExpression: 'set #visName = :visValue',
    ExpressionAttributeNames: {
      '#visName': 'assigned-to',
    },
    ExpressionAttributeValues: {
      ':visValue': sponsor,
    },
  };

  // Call DynamoDB to update the item to the table
  const result2 = await ddb.update(updateParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(hacker),
    headers: HEADERS,
  };
});

// Marks a user as having attended sponsor room
// Route restricted to users with role sponsor
module.exports.mark_attendance = withSentry(async (event) => {
  const decoded = jwt.verify(event.header.Authorization, 'technica');
  const sponsor = decoded.email
  const body = JSON.parse(event.body);

    // Check if hacker email is in event body
  if (!body.hacker) {
    return {
      statusCode: 500,
      body: 'Missing hacker key',
    };
  }
  
  const ddb = new AWS.DynamoDB.DocumentClient();
  const hackerEmail = body.hacker  
    
  // Find hacker information
  const params = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    FilterExpression: 'contains (email, :hacker)',
    ExpressionAttributeValues: {
      ':hacker': hackerEmail,
    },
  };

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  // Get the hacker's priority
  const { Items }  = await ddb.scan(params).promise();
  const hackerPriority = Items[0].priority
 
  // Update the hacker's information in the queue table 
  const updateParams = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    Key: {
      'email': hackerEmail,
      'priority': hackerPriority
    },
    UpdateExpression: 'ADD #visSet :sponsor, #seenCount :increment',
    ExpressionAttributeNames: {
      '#visSet': 'seen',
      '#seenCount': 'visited'	
    },
    ExpressionAttributeValues: {
      ':sponsor': ddb.createSet([sponsor]),
      ':increment': 1
    },
  };

  // Call DynamoDB to update the item to the table
  const result2 = await ddb.update(updateParams).promise();    
    
  return {
    statusCode: 200,
    body: JSON.stringify(hackerPriority),
    headers: HEADERS,
  };
});
