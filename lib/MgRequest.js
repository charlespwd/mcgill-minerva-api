'use strict';

var q = require('q');
var request = require('request');

var MgRequest = {

  post: function (url, jar, form) {
    var deferred = q.defer();

    var options = {
      url: url,
      jar: jar,
      form: form,
    };

    request.post(options, function(err, response, body) {
      if(err) deferred.reject(err);
      else {
        deferred.resolve({
          jar: jar,
          body: body,
          response: response,
        });
      }  
    });
    return deferred.promise;
  },

};

module.exports = MgRequest;
