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
          
          //expect(err.text).to.equal("Unauthorized");
          expect(res).to.have.status(401);
          done();
        });
    });

  it('POST /auth/login -> Unauthorized', function (done) {
    done();
    /*    chai.request(app)
          .post('/auth/login', {
            email: "fake@fake.com",
            password: "nopass"
          })
          .expect(400)
          .end((err, res) => {
            console.log(res.body);
            assert(body.message);
            done();
          });*/
  });
});