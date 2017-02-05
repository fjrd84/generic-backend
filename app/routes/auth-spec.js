const request = require('supertest'),
  app = require('../../server'),
  mongoose = require('mongoose');

describe('Requests to the auth path', function () {

  it('Returns Unauthorized when accessing protected routes',
    function (done) {
      request(app)
        .get('/auth/profile')
        .expect(401, done);
    });
});