var request = require('supertest');
var app = require('./server');
var mongoose = require('mongoose');


describe('Requests to the root path', function () {

  it('Returns a 200 status code', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  after(done => {
    mongoose.connection.close();
    done();
  });

});