'use strict';

var expect = require('chai').expect;
var q = require('q');

var CONSTANTS = require('../lib/CONSTANTS');
var mgRequest = require('../lib/mgRequest');
var Minerva = require('../minerva');

describe("mgRequest", function () { 

  describe("#post", function () { 
    it("should return a promise", function () {
      expect(q.isPromise(mgRequest.post())).to.be.true; 
    });

    it("should resolve an object containaing jar and body", function (done) {
      var url = CONSTANTS.URLS.login;
      var jar = Minerva.jar('TESTID=set'); 
      var form = {
        sid: this.u,
        PIN: this.p 
      };
      mgRequest.post(url, jar, form)
      .then(function(promised_obj) {
        expect(promised_obj.jar).to.exist;
        expect(promised_obj.jar).to.equal(jar);
        done();
      });
    });
  });

  describe("#get", function () { 
    it("should return a promise", function () {
      expect(q.isPromise(mgRequest.get())).to.be.true; 
    });
   
    it("should resolve an object containaing jar and body", function (done) {
      var url = 'http://google.com'; 
      var jar = Minerva.jar('TESTID=set'); 
      mgRequest.get(url, jar)
      .then(function(promised_obj) {
        expect(promised_obj.jar).to.exist;
        expect(promised_obj.jar).to.equal(jar);
        done();
      });
    });
  });
});
