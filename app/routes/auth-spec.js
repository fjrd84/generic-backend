/* jshint expr: true */
const chai = require('chai'),
  expect = chai.expect,
  request = require('supertest'),
  sinon = require('sinon'),
  chaiHttp = require('chai-http'),
  passport = require('passport'),
  app = require('../../server'),
  User = require('../models/user'),
  generateToken = require('../tools/generate-token');

chai.use(chaiHttp);

describe('Requests to the auth path', function () {

  beforeEach(function (done) {
    // Make sure that there are no users in the collection before starting testing
    User.remove({}, function () {
      done();
    });
  });

  afterEach((done) => {
    // Clean the users collection after each test.
    User.remove({}, function () {
      done();
    });
  });

  describe('GET /auth/profile', () => {
    it('should unauthorize a without token',
      function (done) {
        chai.request(app)
          .get('/auth/profile')
          .end((err, res) => {
            expect(res.status).to.equal(401);
            expect(res.error.text).to.equal("Unauthorized");
            done();
          });
      });
  });

  describe('GET /auth/login', () => {
    it('should unauthorize a login with fake data', function (done) {
      chai.request(app)
        .post('/auth/login')
        .send({ email: "fake@fake.com", password: "fakepass" })
        .end((err, res) => {
          expect(res.body.message).to.equal("No user has been found.");
          done();
        });
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user, but not twice', (done) => {
      let userInfo = { email: "testuser@testdomain.com", password: "s3cr3t" };
      chai.request(app)
        .post('/auth/signup')
        .send(userInfo)
        .then((res) => {
          expect(res.body.token).to.exist;
          // After a successful sign up, the same email 
          // shouldn't be allowed to sign up as a new user 
          chai.request(app)
            .post('/auth/signup')
            .send(userInfo)
            .end((err, res) => {
              expect(res.body.message).to.equal("There already exists an account with that email.");
              done();
            });
        });
    });
  });

  describe('POST /auth/signup and POST /auth/login', () => {
    it('should create a new user and then log in', (done) => {
      let userInfo = { email: "testuser@testdomain.com", password: "s3cr3t" };
      chai.request(app)
        .post('/auth/signup')
        .send(userInfo)
        .then((res) => {
          expect(res.body.token).to.exist;
          chai.request(app)
            .post('/auth/login')
            .send(userInfo)
            .end((err, res) => {
              expect(res.body.token).to.exist;
              done();
            });
        });
    });
  });

  describe('POST /auth/profile', () => {
    it('should signup to create a new user and then retrieve the user profile using the auth token as an Authorization header', (done) => {
      let userInfo = { email: "testuser@testdomain.com", password: "s3cr3t" };
      chai.request(app)
        .post('/auth/signup')
        .send(userInfo)
        .then((res) => {
          expect(res.body.token).to.exist;
          let authToken = res.body.token;
          chai.request(app)
            .get('/auth/profile')
            .set('Authorization', 'JWT ' + authToken)
            .end((err, res) => {
              expect(res.body.user._id).to.exist;
              done();
            });
        });
    });
  });


  describe('GET /auth/logout', () => {
    it('should logout a user', (done) => {
      let userInfo = { email: "testuser@testdomain.com", password: "s3cr3t" };
      let authToken;
      chai.request(app)
        .post('/auth/signup')
        .send(userInfo)
        .then((res) => {
          expect(res.body.token).to.exist;
          authToken = res.body.token;
          chai.request(app)
            .post('/auth/login')
            .send(userInfo)
            .then(() => {
              chai.request(app)
                .get("/auth/logout")
                .set('Authorization', 'JWT ' + authToken)
                .end((err, res) => {
                  expect(res.body.message).to.equal("Logged out");
                  done();
                });
            });
        });
    });
  });

  describe('GET /auth/google/callback', () => {
    it('should redirect to the auth route of the client after successfully authenticating using the google strategy', (done) => {

      let stub = sinon.stub(passport, 'authenticate').returns(() => { });

      stub.yields(
        null,
        {
          toObject: () => {
            return { id: "michaelKnight" };
          }
        },
        "Extra Info"
      );

      request(app)
        .get('/auth/google/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.header['location']).to.contain('/auth');
          done();
        });
    });

    it('should return an error message when after authenticating using the google strategy no user has been found', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(function () { });

      let passportErrorMessage = "The user has not been found";

      stub.yields(
        null,
        null,
        passportErrorMessage
      );

      request(app)
        .get('/auth/google/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.body.message).to.equal(passportErrorMessage);
          done();
        });
    });

  });

  describe('GET /auth/facebook/callback', () => {
    it('should redirect to the auth route of the client after successfully authenticating using the facebook strategy', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { });

      stub.yields(
        null,
        {
          toObject: () => {
            return { id: "michaelKnight" };
          }
        },
        "Extra Info"
      );

      request(app)
        .get('/auth/facebook/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.header['location']).to.contain('/auth');
          done();
        });
    });

    it('should return an error message when no user could be authenticated', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        passportErrorMessage = "Error: no user has been found";

      stub.yields(
        null,
        null,
        passportErrorMessage
      );

      chai.request(app)
        .get('/auth/facebook/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.body.message).to.equal(passportErrorMessage);
          done();
        });
    });
  });

  describe('GET /auth/twitter/callback', () => {
    it('should redirect to the auth route of the client after successfully authenticating using the twitter strategy', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { });

      stub.yields(
        null,
        {
          toObject: () => {
            return { id: "michaelKnight" };
          }
        },
        "Extra Info"
      );

      request(app)
        .get('/auth/twitter/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.header['location']).to.contain('/auth');
          done();
        });
    });

    it('should return an error message when after authenticating using the twitter strategy no user has been found', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(function () { });

      let passportErrorMessage = "The user has not been found";

      stub.yields(
        null,
        null,
        passportErrorMessage
      );

      request(app)
        .get('/auth/twitter/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.body.message).to.equal(passportErrorMessage);
          done();
        });
    });
  });

  describe('GET /auth/connect/local', () => {
    it('should connect an existing user to the local strategy', (done) => {
      let exampleUser = { facebook: { id: "1234", token: "1234" } },
        stub = sinon.stub(passport, 'authenticate').returns(() => { });

      User.create(exampleUser, (err, userInDb) => {
        stub.yields(
          null,
          userInDb,
          null
        );

        let token = generateToken(userInDb);

        chai.request(app)
          .post('/auth/connect/local')
          .set('Authorization', "JWT " + token)
          .end((err, res) => {
            stub.restore();
            expect(res.status).to.equal(200);
            expect(res.body.id).to.be.a('string');
            expect(res.body.token).to.be.a('string');
            done();
          });
      });
    });

    it('should return an error when no connecting user has been found in the db', (done) => {
      let exampleUser = { facebook: { id: "1234", token: "1234" } },
        stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        passportErrorMessage = "Error: user not found";

      User.create(exampleUser, (err, userInDb) => {
        stub.yields(
          null,
          null,
          passportErrorMessage
        );

        let token = generateToken(userInDb);

        chai.request(app)
          .post('/auth/connect/local')
          .set('Authorization', "JWT " + token)
          .end((err, res) => {
            stub.restore();
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal(passportErrorMessage);
            done();
          });
      });
    });
  });

  describe('GET /auth/connect/facebook/callback', () => {
    it('should authenticate a user when the user authentication was successful', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        dbUser = {
          toObject: () => {
            return { id: 'someUsersId' };
          }
        };
      stub.yields(null, dbUser, null);
      request(app)
        .get('/auth/connect/facebook/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.header['location']).to.contain('/auth');
          done();
        });
    });

    it('should return an error message when the user couldn\'t be authenticated', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        passportErrorMessage = "Some error message";

      stub.yields(null, null, passportErrorMessage);
      chai.request(app)
        .get('/auth/connect/facebook/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.body.message).to.equal(passportErrorMessage);
          done();
        });
    });

  });


  describe('GET /auth/session', () => {

    it('should start a session', (done) => {
      let newUser = { local: { email: "twitterMan@myhome.com", password: "whateverhash" } };
      User.create(newUser, (err, user) => {
        let token = generateToken(user);

        request(app)
          .get('/auth/session/start')
          .set('Authorization', "JWT " + token)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Session started.");
            done();
          });
      });

      it('should end a session', (done) => {
        let newUser = { local: { email: "twitterMan@myhome.com", password: "whateverhash" } };
        User.create(newUser, (err, user) => {
          let token = generateToken(user);

          request(app)
            .get('/auth/session/end')
            .set('Authorization', "JWT " + token)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.message).to.equal("Session ended.");
              done();
            });
        });

      });
    });
  });

  describe('GET /auth/connect/twitter/callback', () => {
    it('should authenticate a user when the user authentication was successful', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        dbUser = {
          toObject: () => {
            return { id: 'someUsersId' };
          }
        };
      stub.yields(null, dbUser, null);
      request(app)
        .get('/auth/connect/twitter/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.header['location']).to.contain('/auth');
          done();
        });
    });

    it('should return an error message when the user couldn\'t be authenticated', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        passportErrorMessage = "Some error message";

      stub.yields(null, null, passportErrorMessage);
      chai.request(app)
        .get('/auth/connect/twitter/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.body.message).to.equal(passportErrorMessage);
          done();
        });
    });

  });


  describe('GET /auth/connect/google/callback', () => {
    it('should authenticate a user when the user authentication was successful', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        dbUser = {
          toObject: () => {
            return { id: 'someUsersId' };
          }
        };
      stub.yields(null, dbUser, null);
      request(app)
        .get('/auth/connect/google/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.header['location']).to.contain('/auth');
          done();
        });
    });

    it('should return an error message when the user couldn\'t be authenticated', (done) => {
      let stub = sinon.stub(passport, 'authenticate').returns(() => { }),
        passportErrorMessage = "Some error message";

      stub.yields(null, null, passportErrorMessage);
      chai.request(app)
        .get('/auth/connect/google/callback')
        .end((err, res) => {
          stub.restore();
          expect(res.body.message).to.equal(passportErrorMessage);
          done();
        });
    });

  });

  describe('GET /auth/unlink/facebook', () => {
    it('removes the facebook token of a given user', (done) => {
      let exampleUser = { facebook: { token: "someToken" } };
      User.create(exampleUser, (err, user) => {
        let token = generateToken(user);
        chai.request(app)
          .get('/auth/unlink/facebook')
          .set('Authorization', "JWT " + token)
          .end((err, res) => {
            User.findOne({ _id: user._doc._id }, (err, updatedUser) => {
              expect(updatedUser._doc.facebook.token).to.not.exist;
              expect(res.status).to.equal(204);
              done();
            });
          });
      });
    });
  });

  describe('GET /auth/unlink/twitter', () => {
    it('removes the twitter token of a given user', (done) => {
      let exampleUser = { twitter: { token: "someToken" } };
      User.create(exampleUser, (err, user) => {
        let token = generateToken(user);
        chai.request(app)
          .get('/auth/unlink/twitter')
          .set('Authorization', "JWT " + token)
          .end((err, res) => {
            User.findOne({ _id: user._doc._id }, (err, updatedUser) => {
              expect(updatedUser._doc.twitter.token).to.not.exist;
              expect(res.status).to.equal(204);
              done();
            });
          });
      });
    });
  });



  describe('GET /auth/unlink/google', () => {
    it('removes the google token of a given user', (done) => {
      let exampleUser = { google: { token: "someToken" } };
      User.create(exampleUser, (err, user) => {
        let token = generateToken(user);
        chai.request(app)
          .get('/auth/unlink/google')
          .set('Authorization', "JWT " + token)
          .end((err, res) => {
            User.findOne({ _id: user._doc._id }, (err, updatedUser) => {
              expect(updatedUser._doc.google.token).to.not.exist;
              expect(res.status).to.equal(204);
              done();
            });
          });
      });
    });
  });

});