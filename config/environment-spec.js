const chai = require('chai'),
  expect = chai.expect,
  request = require('supertest');

describe('Different environments are loaded depending on the NODE_ENV environment variable', () => {
  let initialEnv;
  before((done) => {
    // Save the initial NODE_ENV in order to restore it later
    initialEnv = process.env.NODE_ENV;
    require('./environment');
    // The environment is loaded and removed from the cache, in order to force a reload when there's a different NODE_ENV
    delete require.cache[require.resolve('./environment')];
    done();
  });

  after((done) => {
    process.env.NODE_ENV = initialEnv;
    done();
  });

  it('should have different ports for each environment', (done) => {
    // test
    process.env.NODE_ENV = 'test';
    let portTest = require('./environment').port;
    delete require.cache[require.resolve('./environment')];
    // debug 
    process.env.NODE_ENV = 'debug';
    let portDebug = require('./environment').port;
    delete require.cache[require.resolve('./environment')];
    // prod 
    process.env.NODE_ENV = 'prod';
    let portProd = require('./environment').port;
    expect(portTest).to.not.equal(portDebug);
    expect(portDebug).to.not.equal(portProd);
    expect(portTest).to.not.equal(portProd);
    done();
  });

});