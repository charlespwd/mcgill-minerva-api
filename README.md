# mcgill-minerva-api

A javascript abstraction layer over McGill's awful minerva. It can:
 * return your unofficial transcript as json
 * search for courses (by dep, number and semester)
 * add/drop courses  

## Getting Started
Install the module with: `npm install mcgill-minerva-api`

```javascript
var Minerva = require('mcgill-minerva-api');

var minerva = new Minerva(username, password); // or store 'em in environment MG_USER & MG_PASS
minerva.getCourses({ 
    dep: 'COMP',
    number: '250', 
    season: 'w', 
    year: '2015' 
  }).then(function(courses) {
    console.log(courses);
      // => [{ 
      //  isFull: false,
      //  CRN: '709',
      //  Subj: 'COMP',
      //  Crse: '250',
      //  Type: 'Lecture', 
      //  Days: ['MWF'],
      //  Time: ['09:35 AM-10:25 AM'], 
      //  Instructor: 'Martin Robillard',
      //  Status: 'Active'
      //  },{
      //    ...
      //  }]
  }); 
```

## Documentation
`Minerva`'s functions are promises, see Kris Kowal's very excellent [Q](https://github.com/kriskowal/q) module. 
Therefore, to use the results of the function you need to chain chain a `then` with a callback.
  * `getTranscript()`: returns a promise for an array of courses. Course example:  
```javascript
{
  "RW": " " || "RW", // Web registered or not
  "Subj": "COMP",
  "Crse": "208",
  "Sec": "001",
  "Credits": "2",
  "Grade": "A",
  "ClassAvg": "A"
}
```
  * `getCourses(options)`: returns a promise for an array of courses 
      searched on minerva (for regitration). `options` takes :
      + `dep:`, e.g. "MATH",
      + `number`, e.g. "280",
      + `season`, takes `w`, `s`, or `f`. 
      + `year`, takes XXXX,
    Return value example: 
```javascript
{
  "isFull": true || false,
  "CRN": '709',
  "Subj": 'COMP',
  "Crse": '250',
  "Type": 'Lecture', 
  "Days": ['MWF'],
  "Time": ['09:35 AM-10:25 AM'], 
  "Instructor": 'Martin Robillard',
  "Status": 'Active'
}
```
  * `addCourses(options)`: returns a promise for registration of courses by crn. 
      `options` takes: 
      + `season`, `w`, `s`, or `f`;
      + `year`, e.g. 2015;
      + `crn`, crn string or array of crns (course reference numbers)
  * `dropCourses(options)`: returns a promise for the opposite of add courses.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Charles P Clermont. Licensed under the MIT license.
