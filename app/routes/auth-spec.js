const chai = require('chai'),
  expect = chai.expect,
  chaiHttp = require('chai-http'),
  app = require('../../server'),
  User = require('../models/user'),
  mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Requests to the auth path', function () {

  it('GET /auth/profile -> Unauthorized',
    function (done) {
      chai.request(app)
        .get('/auth/profile')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.equal("Unauthorized");
          done();
        });
    });

  it('POST /auth/login -> Unauthorized', function (done) {
    chai.request(app)
      .post('/auth/login')
      .field("email", "fake@fake.com")
      .field("password", "nopass")
      .end((err, res) => {
        expect(res.body.message.message).to.equal("Missing credentials");
        done();
      });
  });
});