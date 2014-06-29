'use strict';

var fs = require('fs');
var expect = require('chai').expect;

var CoursesParser = require('../lib/CoursesParser');
var mock_html = fs.readFileSync('test/mock_courses_page.html', {encoding: 'utf8'});
var no_courses_html = fs.readFileSync('test/mock_no_courses_page.html', {encoding: 'utf8'});

describe("CoursesParser", function () { 
  var raw_page_html;
  before(function() {
    raw_page_html = mock_html;
  });

  describe("#parse", function () { 
    it("should extract the CRNs", function() {
      var courses = CoursesParser.parse(raw_page_html);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN');
    });

    it("should extract the Subj, Crse, Type, Days, Time, Instructor", function() {
      var courses = CoursesParser.parse(raw_page_html);
      expect(courses).to.be.an.Array;
      expect(courses[0]).to.include.keys('CRN');
      expect(courses[0]).to.include.keys('Subj');
      expect(courses[0]).to.include.keys('Type');
      expect(courses[0]).to.include.keys('Days');
      expect(courses[0]).to.include.keys('Time');
      expect(courses[0]).to.include.keys('Instructor');
    });
    
    it("should return an empty array if no courses were found", function() {
      var courses = CoursesParser.parse(no_courses_html);
      expect(courses).to.be.an.Array;
      expect(courses.length).to.equal(0);
    });
  });
});
