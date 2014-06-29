'use strict';

var q = require('q');
var request = require('request');
var _ = require('lodash');

var CONSTANTS = require('./CONSTANTS.js');
var MgRequest = require('./MgRequest');
var TranscriptParser = require('./TranscriptParser');
var CoursesParser = require('./CoursesParser');

var MgSession = function(u, p) {
  this.u = u || process.env.MG_USER;
  this.p = p || process.env.MG_PASS;
};

MgSession.prototype.login = function() {
  var deferred = q.defer();

  var url = CONSTANTS.URLS.login;
  var jar = MgSession.jar('TESTID=set'); 
  var form = {
    sid:  this.u,
    PIN:  this.p 
  };

  MgRequest.post(url, jar, form)
  .then(function(promised_obj) {
    var cookie_string = promised_obj.jar.getCookieString(CONSTANTS.BASE_URL + '/');
    var contains_sessid = cookie_string.indexOf(' SESSID=') !== -1;
    if (contains_sessid) deferred.resolve(promised_obj);
    else deferred.reject(new Error('could not login'));
  });

  return deferred.promise;
};

MgSession.prototype.promiseTranscriptPage = function(promised_obj) {
  var deferred = q.defer();

  var url = CONSTANTS.URLS.transcript;
  var jar = promised_obj.jar;

  MgRequest.get(url, jar)
  .then(function(promised_obj) {
    if(MgSession.isLoggedIn(promised_obj.body)) deferred.resolve(promised_obj);
    else deferred.reject(new Error('got 404'));
  });

  return deferred.promise;
};

MgSession.prototype.getTranscript = function() {
  var deferred = q.defer();

  this.login()
  .then(this.promiseTranscriptPage)
  .then(function(promised_obj) {
    var page = promised_obj.body;
    if(!MgSession.isLoggedIn(page)) deferred.reject(new Error('404'));
    else {
      var courses = TranscriptParser.parse(promised_obj.body); 
      deferred.resolve(courses);
    }
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

MgSession.prototype.promiseCoursePage = function(selection, promised_obj) {
  // this is a hack cause I have no clue what the fuck is going on with Minerva's
  // post data on that form. Somehow they duplicate keys, put dummy somewhere, some random %25s, ... 
  // I'm not sure but I think I have to write the damn thing by hand and in order.
  // sooo... This is my not so elegant solution but it works and I'm happy :) 
  // If you can refactor it, feel free :) 
  function formUrlEncode(sel) {
    // sel keys : dep, number, season, year
    // season matches WSF for winter summer fall
    var sn;
    switch(sel.season || 'w') {
      case 'w': sn = '01'; break;
      case 's': sn = '05'; break;
      case 'f': sn = '09'; break;
      default:
        throw new Error('season format /[wsf]/');
    }
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

  MgRequest.post(url, jar, form)
  .then(function(coursesJarAndBody) {
    if(MgSession.isLoggedIn(coursesJarAndBody.body)) deferred.resolve(coursesJarAndBody);
    else deferred.reject(new Error('couldnt resolve course selection'));
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

MgSession.prototype.getCourses = function(selection) {
  var deferred = q.defer();

  this.login()
  .then(_.bind(this.promiseCoursePage, this, selection))
  .then(function(promised_obj) {
    deferred.resolve(CoursesParser.parse(promised_obj.body));
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

MgSession.isLoggedIn = function(html) {
  var matches = html.match(/HTTP-404/) || html.match(/P_ValLogin/);
  return ! !!matches;
};

MgSession.jar = function(cookie) {
  var url = CONSTANTS.BASE_URL + '/';
  var j = request.jar();
  var required_cookie = request.cookie(cookie);
  j.setCookie(required_cookie, url);

  return j;
};

module.exports = MgSession;
