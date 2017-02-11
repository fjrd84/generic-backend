/* jshint expr: true */
const chai = require('chai'),
  expect = chai.expect,
  request = require('supertest'),
  sinon = require('sinon'),
  chaiHttp = require('chai-http'),
  passport = require('passport'),
  app = require('../../server'),
  User = require('../models/user');

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
      let stub = sinon.stub(passport, 'authenticate');

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
          expect(res.header['location']).to.contain('/auth');
          stub.restore();
          done();
        });
    });
  });

  describe('GET /auth/connect/local', () => {
    it('should connect an existing user to the local strategy', (done) => {
      let stub = sinon.stub(passport, 'authenticate');

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
        .get('/auth/connect/local')
        .end((err, res) => {

          stub.restore();
          done();
        });
    });
  });

});