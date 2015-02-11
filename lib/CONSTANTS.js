'use strict';

var _ = require('lodash');

var BASE_URL = exports.BASE_URL =  'https://horizon.mcgill.ca';
var BASE_PATH = exports.BASE_PATH = '/pban1';
var URIS = {
  login              : '/twbkwbis.P_ValLogin',
  transcript         : '/bzsktran.P_Display_Form?user_type=S&tran_type=V',
  select_term        : '/bwckgens.p_proc_term_date',
  select_courses     : '/bwskfcls.P_GetCrse',
  registered_courses : '/bwskfreg.P_AltPin',
  add_courses        : '/bwckcoms.P_Regs',
};

exports.MAX_RETRY_COUNT = 5;
exports.URLS =
  _.mapValues(URIS, function(uri) { return BASE_URL + BASE_PATH + uri;});
