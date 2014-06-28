/* expr true */
'use strict';

var expect = require('chai').expect;
var q = require('q');

var MgSession = require('../lib/MgSession');

describe("MgSession", function () { 
  describe("#getSessionCookie", function () { 

    var sess;
    beforeEach(function() {
      sess = new MgSession();
    });

    it("should return a promise", function (done) {
      expect(q.isPromise(sess.getSessionCookie())).to.be.true;
      done();
    });

    it("should return a mcgill session cookie", function(done) {
      sess.getSessionCookie().then(function(cookie) {
        expect(cookie).to.match(/SESSID/);
        done();
      }, function() {
        console.error('this shouldnt be happenin');
      });
    });

    it("should reject if it cannot connect", function(done) {
      sess.p = 'badpassword';
      sess.getSessionCookie().then(null, function(err) {
        expect(err).to.exist;
        done();
      }); 
    });

    it("should allow logged in actions", function (done) {
      sess.getSessionCookie()
        .then(sess.getTranscript)
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
