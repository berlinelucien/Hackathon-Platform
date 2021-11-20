/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */
const Axios = require('axios');

const csv = require('csvtojson');

const endpoint = 'https://kqm1kgz1g7.execute-api.us-east-1.amazonaws.com/prod/users/add';

const teams = { red: 0, green: 0, blue: 0 };

function assignTeam(user) {
  const counts = { red: 0, green: 0, blue: 0 };
  const redResponses = [
    'Do people even go to lectures?',
    'Yay people!!',
    "5 minutes before they're due",
    "What's an assignment??",
    'The craziest, most colorful flavor they have',
    'Hacking',
  ];
  const greenResponses = [
    'Camera off in my PJs',
    "Don't really care",
    'The minute the professor announces them in class',
    'Depends on my mood',
    'New one every time',
    'Free stuff',
    "First hackathon, I'll find out",
  ];
  const blueResponses = [
    'Always camera ready',
    'My maximum is 5 people',
    "I'm asleep on the call",
    "2 days before they're assigned",
    'The same thing I always get',
    'Workshops',
  ];
  const resps = [
    user['What type of Zoom student are you?'],
    user['How do you feel in a large Zoom meeting?'],
    user['When do you start assignments?'],
    user['When you go into an ice-cream shop, the flavor you pick is...'],
    user['What\'s your favorite thing about hackathons?'],
  ];

  // tally responses
  resps.forEach((resp) => {
    if (redResponses.includes(resp)) {
      counts.red += 1;
    } else if (greenResponses.includes(resp)) {
      counts.green += 1;
    } else if (blueResponses.includes(resp)) {
      counts.blue += 1;
    }
  });

  // determine preference
  const max = Math.max(...Object.values(counts));
  const tie = [];

  Object.keys(counts).forEach((color) => {
    if (max === counts[color]) {
      tie.push(color);
    }
  });

  // assign team
  let teamChoice = '';

  if (tie.length === 1) {
    // no tie
    teamChoice = tie[0];
  } else if (teams[tie[0]] < teams[tie[1]]) {
    // in case of tie, pick less popular team
    teamChoice = tie[0];
  } else if (teams[tie[0]] > teams[tie[1]]) {
    // in case of tie, pick less popular team
    teamChoice = tie[1];
  } else {
    // both teams equal; randomly assign
    teamChoice = tie[Math.floor(Math.random() * 2)];
  }

  // update global count for teams
  teams[teamChoice] += 1;

  // return assigned team
  return teamChoice;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Returns the team with the most members
function getBiggestTeam() {
  const maxSize = Math.max(...Object.values(teams));

  return Object.keys(teams).find((team) => teams[team] === maxSize);
}

// Returns the team with the fewest members
function getSmallestTeam() {
  const minSize = Math.min(...Object.values(teams));

  return Object.keys(teams).find((team) => teams[team] === minSize);
}

// Returns the maximum difference in team size
function getMaxDifference() {
  return teams[getBiggestTeam()] - teams[getSmallestTeam()];
}

// Makes the teams roughly even
function evenOutTeams(users) {
  console.log('Pre Team Distribution: ', teams);
  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    const biggest = getBiggestTeam();
    const smallest = getSmallestTeam();

    // Reassign users on the biggest team to the smallest team
    if (user.campfire_team === biggest) {
      user.campfire_team = smallest;
      teams[biggest] -= 1;
      teams[smallest] += 1;
    }

    // Exit if teams are even
    if (getMaxDifference() <= 1) {
      console.log('Final Team Distribution: ', teams);
      return users;
    }
  }

  // Fail if teams aren't even
  throw new Error(`Unable to balance teams: ${teams}`);
}

// Convert a csv file with csvtojson
csv()
  .fromFile('./responses.csv')
  .then(async (csvResult) => {
    const users = csvResult.map(
      (item) => {
        const teamChoice = assignTeam(item);
        return {
          full_name: `${item['What is your *first name*?']} ${item['Nice to meet you {{field:first_name}}! What is your *last name*?']}`,
          email: item['What is your *email address*?'],
          phone: item['What is your *phone number*?'],
          school: item['What *school* do you attend?'],
          campfire_team: teamChoice,
          group: 'hacker', // for sponsors: "sponsor"
          access_level: 'Hack', // for sponsors: "{company name}"
        };
      },
    );

    evenOutTeams(users);
    /* Uncomment this to invite users to the platform. */
    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      console.log(`Inviting ${user.full_name} at ${user.email} on team ${user.campfire_team}`);
      await Axios.post(endpoint, user);
      await sleep(1000);
    }
  });
