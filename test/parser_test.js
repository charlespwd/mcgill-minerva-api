'use strict';

var expect = require('chai').expect;
var fs = require('fs');

var Parser = require('../lib/parser');
var mock_transcript = fs.readFileSync('./test/mock-transcript.html', { encoding: 'utf8'});
var mock_courses = fs.readFileSync('test/mock_courses_page.html', {encoding: 'utf8'});
var mock_no_courses = fs.readFileSync('test/mock_no_courses_page.html', {encoding: 'utf8'});
var mock_registered_courses = fs.readFileSync('test/mock_registered_courses.html', {encoding: 'utf8'});
var mock_registration_error = fs.readFileSync('test/mock_registration_error.html', {encoding: 'utf8'});

describe("Parser", function () {

  describe("#parseTranscript", function () {
    it("should return an array of courses", function() {
      var courses = Parser.parseTranscript(mock_transcript);
      expect(courses).to.be.an.Array;
      expect(courses[0].Subj).to.equal('MATH');
      expect(courses[0].Crse).to.equal('262');
    });
  });

  describe("#parseCourses", function () {
    it("should extract the CRNs", function() {
      var courses = Parser.parseCourses(mock_courses);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN');
    });

    it("should extract the Subj, Crse, Type, Days, Time, Instructor", function() {
      var courses = Parser.parseCourses(mock_courses);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN', 'Subj', 'Type', 'Days', 'Time', 'Instructor');
    });

    it("should return an empty array if no courses were found", function() {
      var courses = Parser.parseCourses(mock_no_courses);
      expect(courses).to.be.an.Array;
      expect(courses.length).to.equal(0);
    });
  });

  describe("#parseRegisteredCourses", function () {
    it("should extract CRNs, Statuses, Subj, Crse, Sec, Type, Credits", function (done) {
      var courses = Parser.parseRegisteredCourses(mock_registered_courses);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN', 'Status', 'Subj', 'Crse', 'Sec', 'Type', 'Credits');
      done();
    });

    it("should extract errors and map the CRNs correctly", function (done) {
      var courses = Parser.parseRegisteredCourses(mock_registration_error);
      expect(courses).to.be.an.Array;
      expect(courses[courses.length - 1]).to.include.keys('Title');
      done();
    });
  });
});
