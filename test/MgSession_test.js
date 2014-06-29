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
        expect(content).to.be.a.String;
        done();
      }, function(err) {
        console.error(err);
        expect(err).to.not.exist;
        done();
      }).done();
    });
  });

  describe("#selectTerm", function () { 
    this.timeout(5000);
    it("should allow selection of term");
    it("should return a page that contains OPTION VALUE='COMP'", function (done) {
      sess.selectTerm()
      .then(function(html) {
        expect(html).to.match(/(OPTION VALUE="COMP")/g);
        done();
      }).fail(function(err) {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe("#selectCourses", function() {
    this.timeout(7000);
    it("should allow choosing a course section", function(done) {
      var selection = { dep: 'COMP', number: '250' };
      sess.selectCourses(selection)
      .then(function(promised_obj) {
        expect(promised_obj.body.indexOf('Classes are cancelled for all')).to.be.greaterThan(0);
        done();
      }).fail(function (err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it("should return a page that contains 'Classes are cancelled for all'", function (done) {
      sess.selectCourses()
      .then(function(promised_obj) {
        expect(promised_obj.body.indexOf('Classes are cancelled for all')).to.be.greaterThan(0);
        done();
      }).fail(function(err) {
        console.log(err);
        expect(err).to.not.exist;
        done();
      });
    });
  });
});
