'use strict';

var q = require('q');
var request = require('request');
var CONSTANTS = require('./CONSTANTS');

var Request = {
  jar: function(cookie) {
    var url = CONSTANTS.BASE_URL + '/';
    var cookieJar = request.jar();
    var required_cookie = request.cookie(cookie);
    cookieJar.setCookie(required_cookie, url);

    return cookieJar;
  },

  post: function (url, jar, form) {
    var deferred = q.defer();
    var headers = {
      'Pragma': 'no-cache',
      'Origin': 'https://horizon.mcgill.ca',
      // 'Accept-Encoding': 'gzip, deflate',
      // 'Accept-Language': 'en-US,en',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Referer': 'https://horizon.mcgill.ca/pban1/twbkwbis.P_WWWLogin',
    };

    var options = {
      url: url,
      headers: headers,
      jar: jar,
      form: form,
      followAllRedirects: true,
    };

    request.post(options, function(err, response, body) {
      if (err) { return deferred.reject(err); }
      return deferred.resolve({
        jar: jar,
        body: body,
        response: response,
      });
    });

    return deferred.promise;
  },

  get: function (url, jar) {
    var deferred = q.defer();

    request.post({
      url: url,
      jar: jar,
    }, function(err, response, body) {
      if (err) { return deferred.reject(err); }
      return deferred.resolve({
        jar: jar,
        body: body,
      });
    });

    return deferred.promise;
  },

};

module.exports = Request;
