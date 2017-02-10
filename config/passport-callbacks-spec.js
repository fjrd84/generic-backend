/* jshint expr: true */
const chai = require('chai'),
  expect = chai.expect,
  User = require('../app/models/user.js'),
  passportCallbacks = require('./passport-callbacks');

describe('passport callbacks', () => {


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
    expect(passportCallbacks.localLogin).to.be.a('function');
    expect(passportCallbacks.localSignup).to.be.a('function');
    expect(passportCallbacks.tokenCb).to.be.a('function');
    expect(passportCallbacks.facebook).to.be.a('function');
    expect(passportCallbacks.google).to.be.a('function');
    expect(passportCallbacks.twitter).to.be.a('function');
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
      let exampleUser = { local: { email: "mruser@company.com" } };
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
      let exampleUser = { local: { email: "mruser@company.com" } };
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

  it('should create a local login for a user that has already logged in by using a different strategy', (done) => {
    let req = {},
      exampleUser = { facebook: { id: "asdf", token: "asdf", email: "whocares@email.com", name: "Mr. Nobody" } },
      email = "mrberbedere@nicetest.com", // Emails might be different in different strategies.
      password = "supers3cret";
    let newUser = new User(exampleUser);
    req.user = newUser;
    newUser.save(() => {
      passportCallbacks.localSignup(req, email, password, (err, user) => {
        expect(user._doc.local.email).to.be.equal(email);
        expect(user.validPassword(password)).to.be.true;
        done();
      });

    });

  });

  it('should create a new user with the facebook strategy', (done) => {
    let facebookProfile = {
      id: "userId",
      name: { givenName: "Billy", familyName: "Boy" },
      emails: [{ value: "billy@boy.com" }]
    };
    passportCallbacks.facebook({}, "fbtokensecret", "fbrefreshtoken", facebookProfile, (err, user) => {
      expect(user._doc.facebook.name).to.equal("Billy Boy");
      expect(user._doc.facebook.email).to.equal("billy@boy.com");
      done();
    });
  });

  it('should connect a local user with the facebook strategy', (done) => {
    let exampleUser = { local: { email: "whatever@asdf.com", password: "doesn'tevenmatter" } };
    let facebookProfile = {
      id: "userId",
      name: { givenName: "Billy", familyName: "Boy" },
      emails: [{ value: "billy@boy.com" }]
    };
    let newUser = new User(exampleUser);
    let req = { user: newUser };
    newUser.save(() => {
      passportCallbacks.facebook(req, "fbtokensecret", "fbrefreshtoken", facebookProfile, (err, user) => {
        expect(user._doc.facebook.name).to.equal("Billy Boy");
        expect(user._doc.facebook.email).to.equal("billy@boy.com");
        done();

      });
    });
  });

  it('should connect a local user with the facebook strategy to a user that was previously unlinked from facebook', (done) => {
    let exampleUser = { local: { email: "whatever@asdf.com", password: "doesn'tevenmatter" }, facebook: { id: "userId" } };
    let facebookProfile = {
      id: "userId",
      name: { givenName: "Billy", familyName: "Boy" },
      emails: [{ value: "billy@boy.com" }]
    };
    let newUser = new User(exampleUser);
    newUser.save(() => {
      passportCallbacks.facebook({}, "fbtokensecret", "fbrefreshtoken", facebookProfile, (err, user) => {
        expect(user._doc.facebook.name).to.equal("Billy Boy");
        expect(user._doc.facebook.email).to.equal("billy@boy.com");
        done();

      });
    });
  });


  it('should create a new user with the google strategy', (done) => {
    let googleProfile = {
      id: "userId",
      displayName: "Billy Boy",
      emails: [{ value: "billy@boy.com" }]
    };
    passportCallbacks.google({}, "ggtokensecret", "ggrefreshtoken", googleProfile, (err, user) => {
      expect(user._doc.google.name).to.equal("Billy Boy");
      expect(user._doc.google.email).to.equal("billy@boy.com");
      done();
    });
  });


  it('should connect a local user with the google strategy', (done) => {
    let exampleUser = { local: { email: "whatever@asdf.com", password: "doesn'tevenmatter" } };
    let googleProfile = {
      id: "userId",
      displayName: "Billy Boy",
      emails: [{ value: "billy@boy.com" }]
    };
    let newUser = new User(exampleUser);
    let req = { user: newUser };
    newUser.save(() => {
      passportCallbacks.google(req, "ggtokensecret", "ggrefreshtoken", googleProfile, (err, user) => {
        expect(user._doc.google.name).to.equal("Billy Boy");
        expect(user._doc.google.email).to.equal("billy@boy.com");
        done();
      });
    });
  });

  it('should connect a local user with the google strategy to a user that was previously unlinked from google', (done) => {
    let exampleUser = { local: { email: "whatever@asdf.com", password: "doesn'tevenmatter" }, google: { id: "userId" } };
    let googleProfile = {
      id: "userId",
      displayName: "Billy Boy",
      emails: [{ value: "billy@boy.com" }]
    };
    let newUser = new User(exampleUser);
    newUser.save(() => {
      passportCallbacks.google({}, "ggtokensecret", "ggrefreshtoken", googleProfile, (err, user) => {
        expect(user._doc.google.name).to.equal("Billy Boy");
        expect(user._doc.google.email).to.equal("billy@boy.com");
        done();
      });
    });
  });

  ///

  it('should create a new user with the twitter strategy', (done) => {
    let twitterProfile = {
      id: "billyBoyId",
      username: "billyBoy",
      displayName: "Billy Boy",
    };
    passportCallbacks.twitter({}, "twttoken", "twttokensecret", twitterProfile, (err, user) => {
      expect(user._doc.twitter.displayName).to.equal("Billy Boy");
      expect(user._doc.twitter.username).to.equal("billyBoy");
      done();
    });
  });


  it('should connect a local user with the twitter strategy', (done) => {
    let exampleUser = { local: { email: "whatever@asdf.com", password: "doesn'tevenmatter" } };
    let twitterProfile = {
      id: "billyBoyId",
      username: "billyBoy",
      displayName: "Billy Boy",
    };
    let newUser = new User(exampleUser);
    let req = { user: newUser };
    newUser.save(() => {
      passportCallbacks.twitter(req, "twttoken", "twttokensecret", twitterProfile, (err, user) => {
        expect(user._doc.twitter.displayName).to.equal("Billy Boy");
        expect(user._doc.twitter.username).to.equal("billyBoy");
        done();
      });
    });
  });

  it('should connect a local user with the twitter strategy to a user that was previously unlinked from twitter', (done) => {
    let exampleUser = { local: { email: "whatever@asdf.com", password: "doesn'tevenmatter" }, twitter: { id: "userId" } };
    let twitterProfile = {
      id: "billyBoyId",
      username: "billyBoy",
      displayName: "Billy Boy",
    };
    let newUser = new User(exampleUser);
    newUser.save(() => {
      passportCallbacks.twitter({}, "twttoken", "twttokensecret", twitterProfile, (err, user) => {
        expect(user._doc.twitter.displayName).to.equal("Billy Boy");
        expect(user._doc.twitter.username).to.equal("billyBoy");
        done();
      });
    });
  });

});