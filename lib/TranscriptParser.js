'use strict';

//var _ = require('lodash');
var cheerio = require('cheerio');

var column_map = {
  0: 'RW',
  1: 'Crse',
  2: 'Sec',
  4: 'Credits',
  6: 'Grade', 
  10: 'ClassAvg'  
};

module.exports = {
  parse: function(html) {
    var $ = cheerio.load(html);
    var courses = [];
    $('.dataentrytable').find('tr').each(function () {
      var row = {};
      $(this).find('td').each(function (j) {
       if(column_map[j]) 
          row[column_map[j]] = $(this).text();
      });
      if (row.Sec && row.Sec.length === 3) {
        // to mimic course search
        var course = row.Crse.split(' '); 
        row.Subj = course[0];
        row.Crse = course[1]; 
        courses.push(row);
      }
    });  
    return courses;
  }
};
