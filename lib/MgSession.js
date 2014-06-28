'use strict';

var Q = require('q');
var request = require('request');

var CONSTANTS = require('./CONSTANTS.js');

var MgSession = function() {
  this.u = process.env.MG_USER;
  this.p = process.env.MG_PASS;
};

MgSession.prototype.getSessionCookie = function() {
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
    if (sessid_cookie) deferred.resolve(cookie_string);
    else deferred.reject(new Error('could not login'));
  });

  return deferred.promise;
};

MgSession.prototype.getTranscript = function(cookie) {
  var deferred = Q.defer();

  var j = MgSession.jar(cookie);

  request.get({
    url: CONSTANTS.URLS.transcript,
    jar: j
  }, function(err, resp, body) {
    if(err) deferred.reject(err);
    if(!MgSession.is404(body)) deferred.resolve(body);
    else deferred.reject(new Error('got 404'));
  });

  return deferred.promise;
};

MgSession.is404 = function(html) {
  var matches = html.match(/HTTP-404/);
  return !!matches;
};

MgSession.jar = function(cookie) {
  var url = CONSTANTS.BASE_URL + '/';
  var j = request.jar();
  var required_cookie = request.cookie(cookie);
  j.setCookie(required_cookie, url);

  return j;
};
module.exports = MgSession;
