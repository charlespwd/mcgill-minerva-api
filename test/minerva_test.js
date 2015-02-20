/* expr true */
'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var q = require('q');

var Minerva = require('../minerva');

describe("Minerva", function () {
  this.timeout(10000);
  var sess;
  beforeEach(function() {
    sess = new Minerva();
  });

  describe("#login", function () {

    it("should return a promise", function (done) {
      expect(q.isPromise(sess.login())).to.be.true;
      done();
    });

    it("should return a mcgill session cookie jar", function(done) {
      sess.login().then(function(promised_obj) {
        expect(promised_obj).to.exist;
        expect(promised_obj.jar).to.exist;
        done();
      }, function(err) {
        done(err);
      });
    });

    it("should reject if it cannot connect", function(done) {
      sess.password = 'badpassword';
      sess.login().then(function(err) {
        done(err);
      }, function() {
        done();
      });
    });
  });

  describe("#getTranscript", function() {
    it("should get a list of courses and grades", function (done) {
      sess.getTranscript()
      .then(function(content) {
        expect(content).to.be.an.Array;
        expect(content[0].Subj).to.exist;
        expect(content[0].Grade).to.exist;
        done();
      }, function(err) {
        done(err);
      });
    });
  });

  describe("#getCourses", function() {
    it("should allow choosing a course section", function(done) {
      var selection = { dep: 'COMP', number: '250' };
      sess.getCourses(selection)
      .then(function(courses) {
        expect(courses).to.be.an.Array;
        expect(courses[0].Subj).to.equal('COMP');
        expect(courses[0].Crse).to.equal('250');
        done();
      }, function (err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it("should return a page that contains 'Classes are cancelled for all'", function (done) {
      sess.getCourses()
      .then(function(courses) {
        expect(courses).to.be.an.Array;
        done();
      }, function(err) {
        done(err);
      });
    });
  });

  describe("#getRegisteredCourses", function () {
    it("should return a list of courses that you are registered for", function(done) {
      sess.getRegisteredCourses({ season: 'w', year: '2015' })
      .then(function(promised_obj) {
        expect(promised_obj).to.be.an.Array;
        expect(promised_obj[0]).to.include.keys('Status', 'CRN', 'Type');
        done();
      }, function(err) {
        done(err);
      });
    });

    it("should tell you if you are not registered for anything with an empty array", function(done) {
      sess.getRegisteredCourses({ season: 's', year: '2015' })
      .then(function(promised_obj) {
        expect(promised_obj).to.be.an.Array;
        expect(promised_obj.length).to.be.equal(0);
        done();
      }, function(err) {
        done(err);
      });
    });
  });

  describe("#addCourses", function() {

    it("should allow registering for a course", function(done) {
      sess.addCourses({season: 'w', year: '2015', crn: '3050'}) //3050 == COMP 208
      .then(function(promised_obj) {
        var wr_course = _.find(promised_obj, { CRN: '3050' });
        expect(wr_course.Status).to.contain('Web Registered on');
        done();
      }, function(err) {
        done(err);
      });
    });

    it("should allow registering for multiple courses", function(done) {
      sess.addCourses({season: 'w', year: '2015', crn: ['9182', '709']}) //3050 == COMP 208
      .then(function(promised_obj) {
        var wr_course1 = _.find(promised_obj, { CRN: '9182' });
        expect(wr_course1.Status).to.contain('Web Registered on');
        var wr_course2 = _.find(promised_obj, { CRN: '709' });
        expect(wr_course2.Status).to.contain('Web Registered on');
        done();
      }, function(err) {
        done(err);
      });
    });

    it("should tell you if you couldnt register", function (done){
      sess.addCourses({season: 'w', year: '2015', crn: '3050'}) //3050 == COMP 208
      .then(function() {
        expect(false).to.be.true;
        done();
      }, function(err) {
        done(err);
      });
    });
  });

  describe("#dropCourses", function () {
    it("should enable dropping courses", function(done) {
      sess.dropCourses({season: 'w', year: '2015', crn: '3050'})
      .then(function() {
        expect(true).to.be.true;
        done();
      }, function(err) {
        done(err);
      });
    });

    it("should allow dropping multiple courses", function(done) {
      sess.dropCourses({season: 'w', year: '2015', crn: ['9182', '709']})
      .then(function(promised_obj) {
        var wr_course1 = _.find(promised_obj, { CRN: '9182' });
        expect(wr_course1).to.be.undefined;
        var wr_course2 = _.find(promised_obj, { CRN: '709' });
        expect(wr_course2).to.be.undefined;
        done();
      }, function(err) {
        done(err);
      });
    });

    it("should tell you if you couldnt drop course", function(done) {
      sess.dropCourses({season: 'w', year: '2015', crn: '3050'})
      .then(function(err) {
        expect(err).to.exist;
        done();
      }, function(err) {
        done(err);
      });
    });
  });
});
