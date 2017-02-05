const environment = require('./environment.json'),
  environmentTest = require('./environment-test.json');

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
  default:
    currentEnvironment = environment;
}

module.exports = currentEnvironment;