# mcgill-minerva-api [![Build Status](https://secure.travis-ci.org/charlespwd/mcgill-courses-api.png?branch=master)](http://travis-ci.org/charlespwd/mcgill-courses-api)

A javascript abstraction layer over McGill's awful minerva. 

## Getting Started
Install the module with: `npm install mcgill-minerva-api`

```javascript
var Session = require('mcgill-minerva-api');
var session = new Session(username, password); // or store 'em in environment MG_USER & MG_PASS
session.getCourses({ dep: 'COMP', number: '250', season: 'w', year: '2015' }); 
// => [{ 
//  Subj: 'COMP',
//  Crse: '250',
//  CRN: '709',
//  Type: 'Lecture', 
//  Days: 'MWF',
//  Time: '09:35 AM-10:25 AM', 
//  Instructor: 'Martin Robillard'
//  ... 
//  },{
//    ...
//  }]
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Charles P Clermont. Licensed under the MIT license.
