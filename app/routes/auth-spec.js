const chai = require('chai'),
  expect = chai.expect,
  chaiHttp = require('chai-http'),
  app = require('../../server'),
  User = require('../models/user'),
  environment = require('../../config/environment'),
  mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Requests to the auth path', function () {

  beforeEach(function (done) {
    if (!mongoose.connection.db) {
      mongoose.connect(environment.db, done);
    }
    // Make sure that there are no users in the collection before starting testing
    User.remove({}, function (err) {
      done();
    });
  });

  afterEach((done) => {
    // Clean the users collection after each test.
    User.remove({}, function (err) {
      done();
    });
  });

  it('should unauthorize a GET /auth/profile without token',
    function (done) {
      chai.request(app)
        .get('/auth/profile')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.equal("Unauthorized");
          done();
        });
    });

  it('should unauthorize a POST /auth/login with fake data', function (done) {
    chai.request(app)
      .post('/auth/login')
      .send({ email: "fake@fake.com", password: "fakepass" })
      .end((err, res) => {
        expect(res.body.message).to.equal("No user has been found.");
        done();
      });
  });

  it('should POST /auth/signup to create a new user, but not twice', (done) => {
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

  it('should POST /auth/signup to creates a new user and then log in with POST /auth/login', (done) => {
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

  it('should POST /auth/signup to create a new user and then retrieve the user profile on GET /auth/profile using the auth token as an Authorization header', (done) => {
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
          .send(userInfo)
          .end((err, res) => {
            expect(res.body.user._id).to.exist;
            done();
          });
      });
  });


});