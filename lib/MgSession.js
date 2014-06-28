'use strict';

var Q = require('q');
var request = require('request');

var CONSTANTS = require('./CONSTANTS.js');

var MgSession = function() {
  this.u = process.env.MG_USER;
  this.p = process.env.MG_PASS;
};

MgSession.prototype.getSessionCookieJar = function() {
  var deferred = Q.defer();

  var j = MgSession.jar('TESTID=set');

  request.post({
    url: CONSTANTS.URLS.login,
    jar: j,
    form: {
      sid: this.u,
      PIN: this.p
    }
  }, function() {
      var cookie_string = j.getCookieString(CONSTANTS.BASE_URL + '/');
      var sessid_cookie = cookie_string.match(/SESSID=[^;]*/);
      if (sessid_cookie) deferred.resolve(j);
      else deferred.reject(new Error('could not login'));
  });

  return deferred.promise;
};

MgSession.prototype.getTranscriptPage = function(jar) {
  var deferred = Q.defer();

  request.get({
    url: CONSTANTS.URLS.transcript,
    jar: jar
  }, function(err, resp, body) {
    if(err) deferred.reject(err);
    if(MgSession.isLoggedIn(body)) deferred.resolve(body);
    else deferred.reject(new Error('got 404'));
  });

  return deferred.promise;
};

MgSession.prototype.getTranscript = function() {
  var deferred = Q.defer();

  this.getSessionCookieJar()
  .then(this.getTranscriptPage)
  .then(function(page) {
    if(!MgSession.isLoggedIn(page)) deferred.reject(new Error('404'));
    else {
      var courses = page.match(/(>[A-Z]{4}\s\d{3}<((.|\s)*?)<\/TR>)/gm); //magic sauce
      deferred.resolve(courses);
    }
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
