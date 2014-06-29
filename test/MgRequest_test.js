'use strict';

var expect = require('chai').expect;
var q = require('q');

var CONSTANTS = require('../lib/CONSTANTS');
var MgRequest = require('../lib/MgRequest');
var MgSession = require('../lib/MgSession');

describe("MgRequest", function () { 

  describe("#post", function () { 
    it("should return a promise", function () {
      expect(q.isPromise(MgRequest.post())).to.be.true; 
    });

    it("should resolve an object containaing jar and body", function (done) {
      var url = CONSTANTS.URLS.login;
      var jar = MgSession.jar('TESTID=set'); 
      var form = {
        sid: this.u,
        PIN: this.p 
      };
      MgRequest.post(url, jar, form)
      .then(function(promised_obj) {
        expect(promised_obj.jar).to.exist;
        expect(promised_obj.jar).to.equal(jar);
        done();
      });
    });
  });

  describe("#get", function () { 
    it("should return a promise", function () {
      expect(q.isPromise(MgRequest.get())).to.be.true; 
    });
   
    it("should resolve an object containaing jar and body", function (done) {
      var url = 'http://google.com'; 
      var jar = MgSession.jar('TESTID=set'); 
      MgRequest.get(url, jar)
      .then(function(promised_obj) {
        expect(promised_obj.jar).to.exist;
        expect(promised_obj.jar).to.equal(jar);
        done();
      });
    });
  });
});
