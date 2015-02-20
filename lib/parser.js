'use strict';

var cheerio = require('cheerio');

exports.parseTranscript= function(html) {
  var column_map = {
    0: 'completed',
    1: 'course',
    2: 'section',
    3: 'title',
    4: 'credit',
    6: 'grade',
    10: 'class_avg'
  };

  var $ = cheerio.load(html);
  var courses = [];
  $('.dataentrytable').find('tr').each(function () {
    var row = {};
    $(this).find('td').each(function (j) {
      if(column_map[j])
        row[column_map[j]] = $(this).text();
    });
    if (row.section && row.section.length === 3) {
      var course = row.course.split(' ');
      row.department = course[0];
      row.course_number = course[1];
      courses.push(row);
    }
  });

  return courses;
};

exports.parseCourses = function(raw_html) {
  var column_map = {
    0: 'is_full',
    1: 'crn',
    2: 'department',
    3: 'course_number',
    4: 'section',
    5: 'type',
    7: 'title',
    8: 'days',
    9: 'time',
    16: 'instructor',
    19: 'status',
  };

  var $ = cheerio.load(raw_html);
  var courses = [];
  // some magic sauce
  $('.datadisplaytable').find('tr').each(function () {
    var row = {};
    $(this).find('td').each(function (j) {
      if(column_map[j])
        row[column_map[j]] = $(this).text();
    });
    if (row.department) {
      if (row.department.length === 1) { // hack for when time spans two rows or more
        var last = courses[courses.length - 1];
        last.days.push(row.days);
        last.time.push(row.time);
      } else {
        row.is_full = (row.is_full === 'C'); // cause on the page its this or a checkbox
        row.days = [row.days];
        row.time = [row.time];
        courses.push(row);
      }
    }
  });

  return courses;
};

exports.parseRegisteredCourses = function(raw_html) {
  var column_map = {
    0: 'status',
    2: 'crn',
    3: 'department',
    4: 'course_number',
    5: 'section',
    6: 'type',
    8: 'credit',
    10: 'title',
  };

  var error_map = {
    0: 'ErrorMsg',
    1: 'crn',
    2: 'department',
    3: 'course_number',
    4: 'section',
    5: 'type',
    7: 'credit',
    9: 'title',
  };

  var $ = cheerio.load(raw_html);
  var courses = [];
  // some magic sauce
  $('.datadisplaytable').find('tr').each(function () {
    var row = {};
    var isError;
    $(this).find('td').each(function (j) {
      if(j === 0) {
        isError = $(this).text().indexOf('Web Registered') === -1;
      }
      if(!isError && column_map[j])
        row[column_map[j]] = $(this).text();
      else if (isError && error_map[j])
        row[error_map[j]] = $(this).text();
    });
    if (row.department)
      courses.push(row);
  });

  return courses;
};
