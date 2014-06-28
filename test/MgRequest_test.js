'use strict';

var expect = require('chai').expect;
var request = require('request');
var q = require('q');

var CONSTANTS = require('../lib/CONSTANTS');

var MgRequest = require('../lib/MgRequest');
describe("MgRequest", function () { 
  
  it("should return a promise", function () {
    expect(q.isPromise(MgRequest.post())).to.be.true; 
  });

  it("should resolve an object containaing jar and body", function (done) {
    var url = CONSTANTS.URLS.login;
    var jar = request.jar();
    var form = {
      sid: process.env.MG_USER,
      PIN: process.env.MG_PASS
    };
    MgRequest.post(url, jar, form)
      .then(function(jarAndBody) {
        expect(jarAndBody.jar).to.exist;
        expect(jarAndBody.jar).to.equal(jar);
        expect(jarAndBody.body).to.not.match(/HTTP-404/);
        done();
      });
  });
});
