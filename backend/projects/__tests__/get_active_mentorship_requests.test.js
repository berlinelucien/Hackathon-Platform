// tests for multiple endpoints
// Generated by serverless-jest-plugin

const jestPlugin = require('serverless-jest-plugin');
const mod = require('../handler');

const { lambdaWrapper } = jestPlugin;
const adder = lambdaWrapper.wrap(mod, { handler: 'create_mentorship_request' });
const getter = lambdaWrapper.wrap(mod, { handler: 'get_active_mentorship_requests' });
const getter_user = lambdaWrapper.wrap(mod, { handler: 'get_user_mentorship_requests' });
const updater = lambdaWrapper.wrap(mod, { handler: 'update_mentorship_request' });

const request = {
  body: JSON.stringify({
    user_id: 'test',
    title: 'I need help with Java!',
    description: "Java is a terrible language and I don't understand it, please help!",
    topic: 'backend',
  }),
};

const user_id = 'test';
const user_request = {
  queryStringParameters: { user_id: 'test' },
};

// create a request, get it, get its id, update some fields

describe('get_active_mentorship_requests', () => {
  beforeAll((done) => {
    //  lambdaWrapper.init(liveFunction); // Run the deployed lambda
    done();
  });

  it('uploads a mentorship request, then checks if it succeeded',async () => 
  await adder.run(request).then(async (response) => {
    const res = JSON.parse(response.body);
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode', 200);
  }));

  it('gets the first request, updates it, then checks if it updated', async () => {
    const result = await getter.run().then(async (response) => {
      const res = JSON.parse(response.body);
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 200);

      return { body: JSON.stringify(res[0]) };
    });
    result.title = 'this title was updated';
    return await updater.run(result).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  it('gets a mentorship request by user, then checks if its correct', async () =>
  await getter_user.run(user_request).then(async (response) => {
    const res = JSON.parse(response.body);
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode', 200);
    const bad_matches = res.filter((obj) => obj.user_id != user_id);
    expect(bad_matches).toMatchObject([]);
  }));
});
