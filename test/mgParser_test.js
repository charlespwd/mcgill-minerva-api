'use strict';

var expect = require('chai').expect;
var fs = require('fs');

var mgParser = require('../lib/mgParser');
var mock_transcript = fs.readFileSync('./test/mock-transcript.html', { encoding: 'utf8'}); 
var mock_courses = fs.readFileSync('test/mock_courses_page.html', {encoding: 'utf8'});
var mock_no_courses = fs.readFileSync('test/mock_no_courses_page.html', {encoding: 'utf8'});

describe("mgParser", function () { 

  describe("#parseTranscript", function () { 
    it("should return an array of courses", function() {
      var courses = mgParser.parseTranscript(mock_transcript);
      expect(courses).to.be.an.Array;
      expect(courses[0].Subj).to.equal('MATH');
      expect(courses[0].Crse).to.equal('262');
    });
  });
  
  describe("#parseCourses", function () { 
    it("should extract the CRNs", function() {
      var courses = mgParser.parseCourses(mock_courses);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN');
    });

    it("should extract the Subj, Crse, Type, Days, Time, Instructor", function() {
      var courses = mgParser.parseCourses(mock_courses);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN');
      expect(courses[0]).to.include.keys('Subj');
      expect(courses[0]).to.include.keys('Type');
      expect(courses[0]).to.include.keys('Days');
      expect(courses[0]).to.include.keys('Time');
      expect(courses[0]).to.include.keys('Instructor');
    });

    it("should return an empty array if no courses were found", function() {
      var courses = mgParser.parseCourses(mock_no_courses);
      expect(courses).to.be.an.Array;
      expect(courses.length).to.equal(0);
    });
  });
});
