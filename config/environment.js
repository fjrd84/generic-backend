const environment = require('./environment.json'),
  environmentTest = require('./environment-test.json'),
  environmentDebug = require('./environment-debug.json');

let currentEnvironment;

/*
 * Keys defined in environment.json are default.
 * When other environments apply, keys defined for them will have
 * preference over keys defined in environment.json
 */
switch (process.env.NODE_ENV) {
  case 'test':
    currentEnvironment = Object.assign({}, environment, environmentTest);
    break;
  case 'debug':
    currentEnvironment = Object.assign({}, environment, environmentTest, environmentDebug);
    break;
  default:
    currentEnvironment = Object.assign({}, environment, { auth: require('./auth.js') });
}

module.exports = currentEnvironment;