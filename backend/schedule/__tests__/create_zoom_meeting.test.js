// tests for add_event_to_user_list
// Generated by serverless-jest-plugin

const jestPlugin = require('serverless-jest-plugin');
const mod = require('../handler');

const { lambdaWrapper } = jestPlugin;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'create_zoom_meeting' });

const example_request = {
  event_name: 'Hello',
};

const example_failed_request_no_event = {
  wrong_param: 'no',
};

const example_failed_request_empty_event = {

};

const example_request_too_many_event = {
  event_name: 'Hello',
  user_id: 'shouldnothave',
};

describe('create_zoom_meeting', () => {
  beforeAll((done) => {
    done();
  });

  it('Correctly creates a zoom meeting and puts it into the database', () => {
    const bodyStub = example_request;

    const event = {
      body: JSON.stringify(bodyStub),
    };
    return wrapped.run(event).then((response) => {
      expect(response).toBeDefined();
      expect(JSON.parse(response.body)).toHaveProperty('zoom_link');
    });
  });

  it('Calls for a zoom meeting without prerequisite event_name', () => {
    const bodyStub = example_failed_request_no_event;

    const event = {
      body: JSON.stringify(bodyStub),
    };
    return wrapped.run(event).then((response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });

  it('Calls for a zoom meeting without prerequisite event_name', () => {
    const bodyStub = example_failed_request_empty_event;

    const event = {
      body: JSON.stringify(bodyStub),
    };
    return wrapped.run(event).then((response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });

  it('Calls for a zoom meeting with too much given info', () => {
    const bodyStub = example_request_too_many_event;

    const event = {
      body: JSON.stringify(bodyStub),
    };
    return wrapped.run(event).then((response) => {
      expect(response).toBeDefined();
      // It shouldn't fail, it'll just have params passed in that aren't used
      expect(JSON.parse(response.body)).toHaveProperty('zoom_link');
    });
  });
});
