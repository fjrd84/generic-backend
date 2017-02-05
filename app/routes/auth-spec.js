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

  it('GET /auth/profile without token: Unauthorized',
    function (done) {
      chai.request(app)
        .get('/auth/profile')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.equal("Unauthorized");
          done();
        });
    });

  it('POST /auth/login with fake data: Unauthorized', function (done) {
    chai.request(app)
      .post('/auth/login')
      .send({ email: "fake@fake.com", password: "fakepass" })
      .end((err, res) => {
        expect(res.body.message).to.equal("No user has been found.");
        done();
      });
  });

  it('POST /auth/signup creates a new user', (done) => {
    chai.request(app)
      .post('/auth/signup')
      .send({ email: "testuser@testdomain.com", password: "s3cr3t" })
      .end((err, res) => {
        expect(res.body.token).to.exist;
        done();
      });
  });

});