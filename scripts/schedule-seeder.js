/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const Axios = require('axios');

const csv = require('csvtojson');

const endpoint = 'https://mnp7nvpwm4.execute-api.us-east-1.amazonaws.com/stg/add_event'; // stg

// Convert a csv file with csvtojson
csv()
  .fromFile('./bitcamp-schedule.csv')
  .then(async (csvResult) => {
    const formattedScheduleItems = csvResult.map((item) => {
      delete item.id;
      delete item.link;
      return item;
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const item of formattedScheduleItems) {
      await Axios.post(endpoint, item);
      // await sleep(100);
    }
  });
