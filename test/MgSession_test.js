/* expr true */
'use strict';

var expect = require('chai').expect;
var q = require('q');

var MgSession = require('../lib/MgSession');

describe("MgSession", function () { 
  var sess;
  beforeEach(function() {
    sess = new MgSession();
  });

  describe("#login", function () { 
    this.timeout(3000);

    it("should return a promise", function (done) {
      expect(q.isPromise(sess.login())).to.be.true;
      done();
    });

    it("should return a mcgill session cookie jar", function(done) {
      sess.login().then(function(promised_obj) {
        expect(promised_obj).to.exist;
        expect(promised_obj.jar).to.exist;
        done();
      }, function() {
        console.error('this shouldnt be happenin');
      });
    });

    it("should reject if it cannot connect", function(done) {
      sess.p = 'badpassword';
      sess.login().then(function() {
        console.log('should not happen');
        expect('couldnt login').to.be.false;
        done();
      }, function(err) {
        expect(err).to.exist;
        done();
      }); 
    });

    it("should allow logged in actions", function (done) {
      sess.getTranscript()
      .then(function(content) {
        expect(content).to.be.an.Array;
        done();
      }, function(err) {
        console.error(err);
        expect(err).to.not.exist;
        done();
      }).done();
    });
  });

  describe("#getCourses", function() {
    this.timeout(7000);
    it("should allow choosing a course section", function(done) {
      var selection = { dep: 'COMP', number: '250' };
      sess.getCourses(selection)
      .then(function(courses) {
        expect(courses).to.be.an.Array;
        expect(courses[0].Subj).to.equal('COMP');
        expect(courses[0].Crse).to.equal('250');
        done();
      }).fail(function (err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it("should return a page that contains 'Classes are cancelled for all'", function (done) {
      sess.getCourses()
      .then(function(courses) {
        expect(courses).to.be.an.Array;
        done();
      }).fail(function(err) {
        console.log(err);
        expect(err).to.not.exist;
        done();
      });
    });
  });
});
