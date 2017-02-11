let jwt = require('jsonwebtoken'),
  environment = require('../../config/environment');

/**
   * Utility for generating a JWT token and binding it to a user.
   * @param {User} user
   */
let generateToken = (user) => {
  return jwt.sign(user.toObject(), environment.secretKey, {
    expiresIn: environment.tokenValidityTime
  });
};
module.exports = generateToken;