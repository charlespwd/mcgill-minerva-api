'use strict';

var q = require('q');
var request = require('request');

var MgRequest = {

  post: function (url, jar, form) {
    var deferred = q.defer();

    request.post({
      url: url,
      jar: jar,
      form: form,
      followAllRedirects: true,
    }, function(err, response, body) {
      if (err) deferred.reject(err);
      deferred.resolve({
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
      deferred.resolve({
        jar: jar,
        body: body,
      });
    });

    return deferred.promise;
  },

};

module.exports = MgRequest;
