'use strict';

var q = require('q');
var _ = require('lodash');

var CONSTANTS = require('./lib/CONSTANTS.js');
var Request = require('./lib/request-util');
var Parser = require('./lib/parser');
var utils = require('./lib/utils');

function login(user) {
  var deferred = q.defer();

  var url = CONSTANTS.URLS.login;
  var jar = Request.jar('TESTID=set');
  var form = {
    sid:  user.username,
    PIN:  user.password
  };

  function retry(jar, retry_count) {
    retry_count = retry_count;
    return Request.post(url, jar, form)
    .then(function(promised_obj) {
      var cookie_string = promised_obj.jar.getCookieString(CONSTANTS.BASE_URL + '/');
      var contains_sessid = cookie_string.indexOf('SESSID=') !== -1;
      if (contains_sessid) {
        deferred.resolve(promised_obj);
      } else {
        if (retry_count < CONSTANTS.MAX_RETRY_COUNT) {
          retry(promised_obj.jar, retry_count + 1);
        } else {
          deferred.reject(new Error('could not login'));
        }
      }
    });
  }

  retry(jar, 1);

  return deferred.promise;
}

function promiseTranscript() {
  return function(promised_obj) {
    var deferred = q.defer();

    var url = CONSTANTS.URLS.transcript;
    var jar = promised_obj.jar;

    Request.get(url, jar)
    .then(function(promised_obj) {
      if (utils.isLoggedIn(promised_obj.body)) {
        deferred.resolve(promised_obj);
      } else {
        deferred.reject(new Error('got 404'));
      }
    });

    return deferred.promise;
  };
}

function promiseCourses(selection) {
  return function(promised_obj) {
    // this is a hack cause I have no clue what the fuck is going on with
    // McGill's post data on that form. Somehow they duplicate keys, put dummy
    // somewhere, some random %25s, ...  I'm not sure but I think I have to
    // write the damn thing by hand and in order.  sooo... This is my not so
    // elegant solution but it works and I'm happy :) If you can refactor it,
    // feel free :)
    function formUrlEncode(sel) {
      // sel keys : dep, number, season, year
      // season matches WSF for winter summer fall
      var sn = utils.fmtSeason(sel.season);

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
    var form = formUrlEncode(selection || {});

    Request.post(url, jar, form)
    .then(

    // success callback
    function(coursesJarAndBody) {
      if (utils.isLoggedIn(coursesJarAndBody.body)) {
        deferred.resolve(coursesJarAndBody);
      } else {
        deferred.reject(new Error('couldnt resolve course selection'));
      }
    },

    // error callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };
}

function promiseRegisteredCourses(options) {
  return function(promised_obj) {
    var deferred = q.defer();

    var url = CONSTANTS.URLS.registered_courses;
    var jar = promised_obj.jar;
    var form = {
      term_in: (options.year || '2015') + utils.fmtSeason(options.season)
    };

    Request.post(url, jar, form)
    .then(

    // success callback
    function(promised_obj) {
      if (utils.isLoggedIn(promised_obj.body)) {
        deferred.resolve(promised_obj);
      } else {
        deferred.reject(new Error('couldnt get list of registered_courses'));
      }
    },

    // error callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };
}

function promiseAddOrDropCourse(drop, selection) {
  return function(promised_obj) {
    // OH... Myyyy... Goooood. Wtf were McGill Minerva's programmers
    // thinking?????  This has GOT to be the most awful HTTP Post request you
    // could imagine to build
    function formUrlEncode(sel) {
      // sel keys : dep, number, season, year
      // season matches WSF for winter summer fall
      var sn = utils.fmtSeason(sel.season);

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

      if (!(sel.crn instanceof Array)) {
        sel.crn = [sel.crn];
      }

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

      return head + (drop ? core_drop : core_add) + tail ;
    }

    var deferred = q.defer();

    var url = CONSTANTS.URLS.add_courses;
    var jar = promised_obj.jar;
    var form = formUrlEncode(selection || {});

    Request.post(url, jar, form)
    .then(

    // success callback
    function(promised_obj) {
      if (utils.isLoggedIn(promised_obj.body)) {
        deferred.resolve(promised_obj);
      } else {
        deferred.reject(new Error('Either couldnt login, or 404, or 400 bad request'));
      }
    },

    // error callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };
}

function promiseAddCourses(selection) {
  return promiseAddOrDropCourse(false, selection);
}

function promiseDropCourses(selection) {
  return promiseAddOrDropCourse(true, selection);
}

var Minerva = function(u, p) {
  this.username = u || process.env.MG_USER;
  this.password = p || process.env.MG_PASS;
};

Minerva.prototype = {

  // for testing and backward compatibility
  login: function() {
    return login(this);
  },

  getTranscript: function() {
    var deferred = q.defer();

    login(this)
    .then(promiseTranscript())
    .then(

    // success callback
    function(promised_obj) {
      var html = promised_obj.body;
      if (!utils.isLoggedIn(html)) {
        deferred.reject(new Error('404'));
      } else {
        deferred.resolve(Parser.parseTranscript(html));
      }
    },

    // failure callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },

  getCourses: function(selection) {
    var deferred = q.defer();

    login(this)
    .then(promiseCourses(selection))
    .then(

    // success callback
    function(promised_obj) {
      deferred.resolve(Parser.parseCourses(promised_obj.body));
    },

    // failure callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },

  getRegisteredCourses: function(options) {
    var deferred = q.defer();

    login(this)
    .then(promiseRegisteredCourses(options))
    .then(

    // success callback
    function(promised_obj) {
      deferred.resolve(Parser.parseRegisteredCourses(promised_obj.body));
    },

    // error callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },

  addCourses: function(options) {
    var deferred = q.defer();

    login(this)
    .then(promiseAddCourses(options))
    .then(

    // success callback
    function(promised_obj) {
      var courses = Parser.parseRegisteredCourses(promised_obj.body);
      var error = _.find(courses, 'ErrorMsg');
      if (error) {
        deferred.reject(new Error(error.ErrorMsg));
      } else {
        deferred.resolve(courses);
      }
    },

    // error callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },

  dropCourses: function(options) {
    var deferred = q.defer();

    login(this)
    .then(promiseDropCourses(options))
    .then(

    // success callback
    function(promised_obj) {
      var courses = Parser.parseRegisteredCourses(promised_obj.body);
      var error = _.find(courses, 'ErrorMsg');
      if (error) {
        deferred.reject(new Error(error.ErrorMsg));
      } else {
        deferred.resolve(courses);
      }
    },

    // error callback
    function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },
};


module.exports = Minerva;
