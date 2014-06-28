'use strict';

var _ = require('lodash');

module.exports = function() {
  this.parseCourses= function(html) {
    // var courses = page.match(/(>[A-Z]{4}\s\d{3}<((.|\s)*?)<\/TR>)/gm); //magic sauce with grades
    var courses = html.match(/(>[A-Z]{4}\s\d{3}<)/gm); //magic sauce
    courses = _.map(courses, function(c) { return c.slice(1,-1); });
  };
};
