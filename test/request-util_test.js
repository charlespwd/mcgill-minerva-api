'use strict';

var expect = require('chai').expect;
var q = require('q');

var CONSTANTS = require('../lib/CONSTANTS');
var Request = require('../lib/request-util');

describe("Request", function () {

  describe("#post", function () {
    it("should return a promise", function () {
      expect(q.isPromise(Request.post())).to.be.true;
    });

    it("should resolve an object containaing jar and body", function (done) {
      var url = CONSTANTS.URLS.login;
      var jar = Request.jar('TESTID=set');
      var form = {
        sid: this.u,
        PIN: this.p
      };
      Request.post(url, jar, form)
      .then(function(promised_obj) {
        expect(promised_obj.jar).to.exist;
        expect(promised_obj.jar).to.equal(jar);
        done();
      });
    });
  });

  describe("#get", function () {
    it("should return a promise", function () {
      expect(q.isPromise(Request.get())).to.be.true;
    });

    it("should resolve an object containaing jar and body", function (done) {
      var url = 'http://google.com';
      var jar = Request.jar('TESTID=set');
      Request.get(url, jar)
      .then(function(promised_obj) {
        expect(promised_obj.jar).to.exist;
        expect(promised_obj.jar).to.equal(jar);
        done();
      });
    });
  });
});
