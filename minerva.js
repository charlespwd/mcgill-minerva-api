'use strict';

var q = require('q');
var request = require('request');
var _ = require('lodash');

var CONSTANTS = require('./lib/CONSTANTS.js');
var mgRequest = require('./lib/mgRequest');
var mgParser = require('./lib/mgParser');

var Minerva = function(u, p) {
  this.u = u || process.env.MG_USER;
  this.p = p || process.env.MG_PASS;
};

Minerva.prototype.getTranscript = function() {
  var deferred = q.defer();

  this.login()
  .then(this.promiseTranscriptPage)
  .then(function(promised_obj) {
    var page = promised_obj.body;
    if(!Minerva.isLoggedIn(page)) deferred.reject(new Error('404'));
    else {
      deferred.resolve(mgParser.parseTranscript(promised_obj.body));
    }
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.prototype.getCourses = function(selection) {
  var deferred = q.defer();

  this.login()
  .then(_.bind(this.promiseCoursePage, this, selection))
  .then(function(promised_obj) {
    deferred.resolve(mgParser.parseCourses(promised_obj.body));
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.prototype.getRegisteredCourses = function(options) {
  var deferred = q.defer();

  this.login()
  .then(_.bind(this.promiseRegisteredCoursesPage, this, options))
  .then(function(promised_obj) {
    deferred.resolve(mgParser.parseRegisteredCourses(promised_obj.body));
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.prototype.addCourses = function(options) {
  var deferred = q.defer();

  this.login()
  .then(_.bind(this.promiseAddCoursePage, this, options))
  .then(function(promised_obj) {
    var courses = mgParser.parseRegisteredCourses(promised_obj.body);
    var error = _.find(courses, 'ErrorMsg');
    if (error) deferred.reject(new Error(error.ErrorMsg));
    else deferred.resolve(courses);
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.prototype.dropCourses = function(options) {
  var deferred = q.defer();

  this.login()
  .then(_.bind(this.promiseDropCoursePage, this, options))
  .then(function(promised_obj) {
    var courses = mgParser.parseRegisteredCourses(promised_obj.body);
    var error = _.find(courses, 'ErrorMsg');
    if (error) deferred.reject(new Error(error.ErrorMsg));
    else deferred.resolve(courses);
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};


Minerva.prototype.login = function() {
  var deferred = q.defer();

  var url = CONSTANTS.URLS.login;
  var jar = Minerva.jar('TESTID=set'); 
  var form = {
    sid:  this.u,
    PIN:  this.p 
  };

  mgRequest.post(url, jar, form)
  .then(function(promised_obj) {
    var cookie_string = promised_obj.jar.getCookieString(CONSTANTS.BASE_URL + '/');
    var contains_sessid = cookie_string.indexOf(' SESSID=') !== -1;
    if (contains_sessid) deferred.resolve(promised_obj);
    else deferred.reject(new Error('could not login'));
  });

  return deferred.promise;
};

Minerva.jar = function(cookie) {
  var url = CONSTANTS.BASE_URL + '/';
  var j = request.jar();
  var required_cookie = request.cookie(cookie);
  j.setCookie(required_cookie, url);

  return j;
};

Minerva.prototype.promiseTranscriptPage = function(promised_obj) {
  var deferred = q.defer();

  var url = CONSTANTS.URLS.transcript;
  var jar = promised_obj.jar;

  mgRequest.get(url, jar)
  .then(function(promised_obj) {
    if(Minerva.isLoggedIn(promised_obj.body)) deferred.resolve(promised_obj);
    else deferred.reject(new Error('got 404'));
  });

  return deferred.promise;
};

Minerva.prototype.promiseCoursePage = function(selection, promised_obj) {
  // this is a hack cause I have no clue what the fuck is going on with mgRequest's
  // post data on that form. Somehow they duplicate keys, put dummy somewhere, some random %25s, ... 
  // I'm not sure but I think I have to write the damn thing by hand and in order.
  // sooo... This is my not so elegant solution but it works and I'm happy :) 
  // If you can refactor it, feel free :) 
  function formUrlEncode(sel) {
    // sel keys : dep, number, season, year
    // season matches WSF for winter summer fall
    var sn = Minerva.fmtSeason(sel.season);

    var boilerplate = [
      "term_in=" + (sel.year || '2015') + sn,
      "&sel_subj=dummy",
      "&sel_day=dummy",
      "&sel_schd=dummy",
      "&sel_insm=dummy",
      "&sel_camp=dummy",
      "&sel_levl=dummy",
      "&sel_sess=dummy",
      "&sel_instr=dummy",
      "&sel_ptrm=dummy",
      "&sel_attr=dummy",
      "&sel_subj=" + (sel.dep || 'COMP').toUpperCase(),
      "&sel_crse=" + (sel.number || ''),
      "&sel_title=",
      "&sel_schd=%25",
      "&sel_from_cred=",
      "&sel_to_cred=",
      "&sel_levl=%25",
      "&sel_ptrm=%25",
      "&sel_instr=%25",
      "&sel_attr=%25",
      "&begin_hh=0",
      "&begin_mi=0",
      "&begin_ap=a",
      "&end_hh=0",
      "&end_mi=0",
      "&end_ap=a"
    ].join('');
    return boilerplate;
  }

  var deferred = q.defer();

  var url = CONSTANTS.URLS.select_courses;
  var jar = promised_obj.jar;
  // var form = "term_in=201501&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=COMP&sel_crse=&sel_title=&sel_schd=%25&sel_from_cred=&sel_to_cred=&sel_levl=%25&sel_ptrm=%25&sel_instr=%25&sel_attr=%25&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a";
  var form = formUrlEncode(selection || {});

  mgRequest.post(url, jar, form)
  .then(function(coursesJarAndBody) {
    if(Minerva.isLoggedIn(coursesJarAndBody.body)) deferred.resolve(coursesJarAndBody);
    else deferred.reject(new Error('couldnt resolve course selection'));
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.prototype.promiseRegisteredCoursesPage = function(options, promised_obj) {
  var deferred = q.defer();

  var url = CONSTANTS.URLS.registered_courses;
  var jar = promised_obj.jar;
  var form = {
    term_in: (options.year || '2015') + Minerva.fmtSeason(options.season)
  };

  mgRequest.post(url, jar, form)
  .then(function(promised_obj) {
    if(Minerva.isLoggedIn(promised_obj.body)) deferred.resolve(promised_obj);
    else deferred.reject(new Error('couldnt get list of registered_courses'));
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.prototype.promiseAddCoursePage = function(selection, promised_obj) {
  return this.promiseAddOrDropCoursePage(false, selection, promised_obj);
};

Minerva.prototype.promiseDropCoursePage = function(selection, promised_obj) {
  return this.promiseAddOrDropCoursePage(true, selection, promised_obj);
};

Minerva.prototype.promiseAddOrDropCoursePage = function(drop, selection, promised_obj) {
  // OH... Myyyy... Goooood. Wtf were McGill Minerva's programmers thinking?????
  // This has GOT to be the most awful HTTP Post request you could imagine to build
  function formUrlEncode(sel) {
    // sel keys : dep, number, season, year
    // season matches WSF for winter summer fall
    var sn = Minerva.fmtSeason(sel.season);

    var head = [
      "term_in=" + (sel.year || '2015') + sn,

      // these are necessary otherwise post doesnt work... (wtf)
      "&RSTS_IN=DUMMY",
      "&assoc_term_in=DUMMY",
      "&CRN_IN=DUMMY",
      "&start_date_in=DUMMY",
      "&end_date_in=DUMMY",
      "&SUBJ=DUMMY",
      "&CRSE=DUMMY",
      "&SEC=DUMMY",
      "&LEVL=DUMMY",
      "&CRED=DUMMY",
      "&GMOD=DUMMY",
      "&TITLE=DUMMY",
      "&MESG=DUMMY",
      "&REG_BTN=DUMMY",
      "&MESG=DUMMY",
    ].join('');

    if (!(sel.crn instanceof Array))
      sel.crn = [sel.crn];

    var core_add = '', core_drop = '';
    _.forEach(sel.crn, function(crn) {
      // this is where it's happening for registering courses
      core_add += [
        "&RSTS_IN=RW",
        "&CRN_IN=" + crn,
        "&assoc_term_in=",
        "&start_date_in=",
        "&end_date_in=",
        "&regs_row=0", // for dropping make this 10, for adding, make this 0
      ].join('');

      // this is where it's happening for dropping course
      core_drop += [ 
        "&RSTS_IN=DW",
        "&assoc_term_in=" + (sel.year || '2015') + sn,
        "&CRN_IN=" + crn,
        "&start_date_in=",
        "&end_date_in=",
        "&regs_row=10", // for dropping make this 10, for adding, make this 0
      ].join('');
    });

    var tail = [
      "&wait_row=0",
      "&add_row=10",
      "&REG_BTN=Submit+Changes",
    ].join('');

    return head + (drop? core_drop:core_add) + tail ;
  }

  var deferred = q.defer();

  var url = CONSTANTS.URLS.add_courses;
  var jar = promised_obj.jar;
  var form = formUrlEncode(selection || {});
  //  form = "term_in=201501&RSTS_IN=DUMMY&assoc_term_in=DUMMY&CRN_IN=DUMMY&start_date_in=DUMMY&end_date_in=DUMMY&SUBJ=DUMMY&CRSE=DUMMY&SEC=DUMMY&LEVL=DUMMY&CRED=DUMMY&GMOD=DUMMY&TITLE=DUMMY&MESG=DUMMY&REG_BTN=DUMMY&MESG=DUMMY&RSTS_IN=&assoc_term_in=201501&CRN_IN=6900&start_date_in=01%2F05%2F2015&end_date_in=04%2F14%2F2015&SUBJ=COMP&CRSE=424&SEC=001&LEVL=Undergraduate&CRED=++++3.000&GMOD=Standard&TITLE=Artificial+Intelligence.&MESG=DUMMY&RSTS_IN=&assoc_term_in=201501&CRN_IN=122&start_date_in=01%2F05%2F2015&end_date_in=04%2F14%2F2015&SUBJ=MECH&CRSE=362&SEC=001&LEVL=Undergraduate&CRED=++++2.000&GMOD=Standard&TITLE=Mechanical+Laboratory+1.&MESG=DUMMY&RSTS_IN=&assoc_term_in=201501&CRN_IN=1724&start_date_in=01%2F05%2F2015&end_date_in=04%2F14%2F2015&SUBJ=SOCI&CRSE=312&SEC=001&LEVL=Undergraduate&CRED=++++3.000&GMOD=Standard&TITLE=Sociology+of+Work+and+Industry.&RSTS_IN=RW&CRN_IN=3050&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&RSTS_IN=RW&CRN_IN=&assoc_term_in=&start_date_in=&end_date_in=&regs_row=3&wait_row=0&add_row=10&REG_BTN=Submit+Changes";

  mgRequest.post(url, jar, form)
  .then(function(promised_obj) {
    if(Minerva.isLoggedIn(promised_obj.body)) deferred.resolve(promised_obj);
    else {
      console.log(promised_obj.body);
      deferred.reject(new Error('Either couldnt login, or 404, or 400 bad request'));
    } 
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

Minerva.isLoggedIn = function(html) {
  var matches = html.match(/HTTP-404/) || html.match(/P_ValLogin/) || html.match(/400 Bad Request/);
  return ! !!matches;
};

Minerva.fmtSeason = function(season) {
  switch(season || 'w') {
    case 'w': return '01';
    case 's': return '05'; 
    case 'f': return '09';
    default:
      throw new Error('season format /[wsf]/');
  }
};

module.exports = Minerva;
