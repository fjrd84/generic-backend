const chai = require('chai'),
  expect = chai.expect,
  passportCallbacks = require('./passport-callbacks');

describe('passport callbacks', () => {
  it('should contain a callback for each strategy', (done) => {
    expect(passportCallbacks.localLogin).to.exist;
    expect(passportCallbacks.localSignup).to.exist;
    expect(passportCallbacks.tokenCb).to.exist;
    expect(passportCallbacks.facebook).to.exist;
    expect(passportCallbacks.google).to.exist;
    expect(passportCallbacks.twitter).to.exist;
    done();
  });

  it('should return a no user has been found message', (done) => {
    passportCallbacks.localLogin(null, null, null, (err, user, info) => {
      expect(info).to.equal("No user has been found.");
      done();
    });
  });

  it('should validate the user password using a local strategy', (done) => {
    passportCallbacks.localLogin({}, null, "passw0rd", (err, user) => {
      //todo
      done();
    });
  });

});