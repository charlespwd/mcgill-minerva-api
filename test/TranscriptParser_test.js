
var expect = require('chai').expect;
var fs = require('fs');

var TranscriptParser = require('../lib/TranscriptParser');
var mock_html = fs.readFileSync('./test/mock-transcript.html', { encoding: 'utf8'}); 

describe("TranscriptParser", function () { 
  describe("#parseCourses", function () { 
    var html;
    before(function() {
      html = mock_html; 
    });

    it("should return an array of courses", function() {
      var courses = TranscriptParser.parse(html);
      expect(courses).to.be.an.Array;
      expect(courses[0].Subj).to.equal('MATH');
      expect(courses[0].Crse).to.equal('262');
    });
  });
});
