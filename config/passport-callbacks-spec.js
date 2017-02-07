const chai = require('chai'),
  expect = chai.expect,
  User = require('../app/models/user.js'),
  passportCallbacks = require('./passport-callbacks');

describe('passport callbacks', () => {

  let exampleUser = { local: { email: "mruser@company.com" } };

  beforeEach('empty the users collection', (done) => {
    User.remove({}, () => {
      done();
    });
  });

  after('empty the users collection', (done) => {
    User.remove({}, () => {
      done();
    });
  });

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

  it('should validate the user password using a local strategy',
    (done) => {
      let newUser = new User(exampleUser);
      newUser.local.password = newUser.generateHash("passw0rd");
      newUser.save(() => {
        passportCallbacks.localLogin({}, exampleUser.local.email, "passw0rd", (err, user) => {
          let userObject = user.toObject();
          expect(userObject).to.have.a.property('_id').that.is.an('object');
          done();
        });
      });
    });

  it('should reject a wrong password using a local strategy',
    (done) => {
      let newUser = new User(exampleUser);
      newUser.local.password = newUser.generateHash("passw0rd");
      newUser.save(() => {
        passportCallbacks.localLogin({}, exampleUser.local.email, "wrongPassw0rd", (err, user) => {
          expect(user).to.be.false;
          done();
        });
      });
    });

  it('should sign in a new user',
    (done) => {
      let email = "mrproper@limpio.com",
          password = "cl3aning4ll";

      passportCallbacks.localSignup({}, email, password, (err, user) => {
        expect(user).to.be.an('object');
        expect(user._doc.local.email).to.equal(email);
        // The password must be hashed
        expect(user._doc.local.password).to.not.equal(password);
        done();
      });
    });
});