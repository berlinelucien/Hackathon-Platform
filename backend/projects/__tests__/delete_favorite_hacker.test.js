// tests for delete_favorite_hacker
// Generated by serverless-jest-plugin

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const adder = lambdaWrapper.wrap(mod, { handler: 'add_favorite_hacker' });
const wrapped = lambdaWrapper.wrap(mod, { handler: 'delete_favorite_hacker' });

const AWS = require('aws-sdk');
const UUID = require('uuid');

const sponsor = UUID.v4();
const hacker = UUID.v4();

const example_favorite_hacker = {
  body: JSON.stringify({
    sponsor_id: sponsor,
    user_id: hacker,
  }),
};

const no_user_id = {
  body: JSON.stringify({
    sponsor_id: sponsor,
  }),
};

const no_sponsor_id = {
  body: JSON.stringify({
    user_id: hacker,
  }),
};

const invalid_request = {
  body: JSON.stringify({
    full_name: 'delete user'
  }),
};

describe('delete_favorite_hacker', () => {
  beforeEach(async (done) => {
    await adder.run(example_favorite_hacker);
    done();
  });

  it('Adds and deletes a favorite hacker', async () => {
    const valid_request = {
      body: JSON.stringify({
        sponsor_id: sponsor,
        user_id: hacker,
      }),
    };

    return wrapped.run(valid_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 200 });

      // Check to see if user deleted
      const ddb = new AWS.DynamoDB.DocumentClient();

      const get_request = {
        TableName: process.env.FAVORITE_HACKERS_TABLE,
        Key: { 
          sponsor_id: sponsor,
          user_id: hacker,
        },
      };

      const result = await ddb.get(get_request).promise();
      const isEmpty = JSON.stringify(result) === '{}';

      expect(isEmpty).toBeTruthy();
    });
  });

  it('Fails to delete hacker without user_id', async () => {
    return wrapped.run(no_user_id).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });

  it('Fails to delete hacker without sponsor_id', async () => {    
    return wrapped.run(no_sponsor_id).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });

  it('Fails to delete hacker without both ids', async () => {    
    return wrapped.run(invalid_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });
});
