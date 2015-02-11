'use strict';

exports.isLoggedIn = function(html) {
  var matches = html.match(/HTTP-404/) || html.match(/P_ValLogin/) || html.match(/400 Bad Request/);
  return ! !!matches;
};

exports.fmtSeason = function(season) {
  switch(season || 'w') {
    case 'w': return '01';
    case 's': return '05';
    case 'f': return '09';
    default:
      throw new Error('season format /[wsf]/');
  }
};


