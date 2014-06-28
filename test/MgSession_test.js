/* expr true */
'use strict';

var expect = require('chai').expect;
var q = require('q');

var MgSession = require('../lib/MgSession');

describe("MgSession", function () { 
  describe("#getSessionCookieJar", function () { 
    this.timeout(3000);
    var sess;
    beforeEach(function() {
      sess = new MgSession();
    });

    it("should return a promise", function (done) {
      expect(q.isPromise(sess.getSessionCookieJar())).to.be.true;
      done();
    });

    it("should return a mcgill session cookie jar", function(done) {
      sess.getSessionCookieJar().then(function(jar) {
        expect(jar).to.exist;
        done();
      }, function() {
        console.error('this shouldnt be happenin');
      });
    });

    it("should reject if it cannot connect", function(done) {
      sess.p = 'badpassword';
      sess.getSessionCookieJar().then(null, function(err) {
        expect(err).to.exist;
        done();
      }); 
    });

    it("should allow logged in actions", function (done) {
       sess.getSessionCookieJar()
        .then(sess.getTranscriptPage)
        .then(function(content) {
          expect(content).to.be.a.String;
          done();
        }, function(err) {
          console.error(err);
          expect(err).to.not.exist;
          done();
        }).done();
    });
  });
});
