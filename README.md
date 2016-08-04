## Synopsis

A library that makes adding routes to express app and interaction with database easier than ever

## Code Example
#### models/person.js
```
var mongoose = require('mongoose');

var person = {
    first_name: String,
    last_name: String,
    schoolId: mongoose.Schema.Types.ObjectId,
    address: {
        number: String,
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    birthdate: Date,
    age: Number
};

var PersonSchema = new mongoose.Schema(person);
var PersonModel = mongoose.model('Person', PersonSchema)

module.exports = function(app){
    var schema = [
        {
            'name': PersonModel,
            'requests': {
                'get': [
                    {
                        'url': '/first_name/:first_name'
                    },
                    {
                        'url': '/last_name/:last_name'
                    },
                    {
                        'url': '/full_name/:first_name/:last_name'
                    }
                ],
                'post': [
                    {
                        'url': '/new',
                        'schema': person // Optional
                    }
                ],
                'put': [
                    {
                        'url': '/update/first_name/:id',
                        'params': ['first_name'],
                        'id': true
                    },
                    {
                        'url': '/update/last_name/:id',
                        'params': ['last_name'],
                        'id': true
                    },
                    {
                        'url': '/update/full_name/:id',
                        'params': ['first_name', 'last_name'],
                        'id': true
                    },
                    {
                        'url': '/update/using/age/:age/last_name/:last_name',
                        'params': ['first_name'],
                        'id': false
                    }
                ],
                'remove':[
                    {
                        'url': '/remove/:id',
                        'id': true
                    }
                ]
            }
        }
    ];
```
#### app.js
```
var express = require('express');
var mongoose = require('mongoose');
var person = require('models/person.js')

var app = express();
/*
  Configure app
*/
person(app); // Adds routes
```

##### GET
######By default
Searches database by request query parameters.
```
localhost:8080/node-api/?first_name=firstName&last_name=lastName
```
For nested objects search, use '__'. 
```
localhost:8080/node-api/?address__stree_name=streetName&address__postalcode=postalCode
```
######User customized
Searches by the req parameters.
```
url: 
    full_name/:first_name/:last_name
localhost:8080/node-api/full_name/firstName/lastName
```

##### POST
No need to configure the backend to translate the request body to nested objects in the schema. All you have to do is "address.number" in the PUT request body. This supports as many nested objects in the schema.
The schema parameter will allow error detection but is optional (not implemented yet)
##### PUT
Search the database by the parameters in the request URL and update the value of arguments in the params array.
When the id is set to true, it seaches by id and update. Otherwise, the query may return multiple results, sort them, then update the first in the result set.
##### REMOVE
Similar to PUT but removes from the database. If id is false, the first of the sorted result set is removed.

## Motivation

When configuring server's routes and database interactions, most of the code is repetitive and time consuming. It would be great to have a library ease the process.
A library that takes in routes, parameters names, and a schema object, then configure it for you.

## Installation

```
npm install database-restful
```

## Contributors

If you have any ideas on how to improve the library, or if you find any bug, create an issue or contact me.

## TODO list
- [ ] Support for dates
- [ ] Error check for POST based on provided schema
- [ ] Aggregation
- [ ] Support for other databases (current mongodb)
