'use strict';

var q = require('q');
var request = require('request');

var mgRequest = {

  post: function (url, jar, form) {
    var deferred = q.defer();

    var options;
    // temporary fix until @mikeal pushes my pull request in request 2.37.0
    // once we're there we can just put form: form
    if (typeof form === 'string') {
      options = {
        url: url,
        jar: jar,
        header: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: form
      };
    } else {
      options = {
        url: url,
        jar: jar,
        form: form
      };
    }

    request.post(options, function(err, response, body) {
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

module.exports = mgRequest;
