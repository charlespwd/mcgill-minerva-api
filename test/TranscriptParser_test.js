
var TranscriptParser = require('../lib/TranscriptParser');
var expect = require('chai').expect;
var mock_html = require('./mock-html');

describe("TranscriptParser", function () { 
  describe("#parseCourses", function () { 
    var html;
    before(function() {
      html = mock_html; 
    });

    var parser;
    beforeEach(function() {
      parser = new TranscriptParser();
    });

    it("should return an array of courses (codes + number)", function() {
      var courses = parser.parseCourses(html);
      expect(courses).to.be.an.array;
    });
  });
});
