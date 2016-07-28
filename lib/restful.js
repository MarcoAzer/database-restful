/*
var schema = [
    {
        'name': Servant,
        'requests': {
            'get': [
                {
                    'url': '/first_name/:first_name'
                },
                {
                    'url': '/last_name/:last_name'
                }
            ],
            'post': [

            ],
            'put': [

            ]
        }
    },
    {
        ...
    }
];
*/

var Parse_GET_URL = function(url){
    var params = [];
    var index = url.indexOf(':', 0);
    while(index != -1){
        var str = '';
        // last param
        if(url.indexOf(':', index + 1) == -1)
            str = url.substring(index + 1);
        else
            str = url.substring(index + 1, url.indexOf('/', index));

        params.push(str);
        index = url.indexOf(':', index + 1);
    } // while
    return params;
};

var make_newer_object = function(reqBody, schema){
    var newObject = {};
    for(var key in reqBody){
        var dotIndex = key.indexOf('.', 0);
        if(dotIndex == -1){
            newObject[key] = reqBody[key];
        }
        else{
            // Get nested objects
            var objects = [];
            var startIndex = 0;
            while(1){
                var obj = key.substring(startIndex, dotIndex);
                objects.push(obj);
                startIndex = dotIndex + 1;
                dotIndex = key.indexOf('.', startIndex);
                if(dotIndex == -1){
                    obj = key.substring(startIndex);
                    objects.push(obj);
                    break;
                }
            }
            // Make nested objects
            var targetObj;
            var i;
            for(i = 0; i < objects.length - 1; i++){
                var obj = objects[i];
                if(!newObject[obj]) {
                    newObject[obj] = {}
                }
                targetObj = newObject[obj];
            }
            targetObj[objects[i]] = reqBody[key];
        }
    }
    return newObject;
};

module.exports = function(app, schema, baseEndPoint){

    if(!baseEndPoint)
        baseEndPoint = '';

    schema.forEach(function(table){
        table.requests.get.forEach(function(obj){
            // Parse URL and add to params array
            var params = Parse_GET_URL(obj.url);

            app.get(baseEndPoint + obj.url, function(req, res){
                var searchObj = {};

                params.forEach(function(elem){
                    searchObj[elem] = req.params[elem];
                });

                table.name.find(searchObj, function(err, returnObj){
                    if(err)
                        throw err;
                    else
                        res.send(returnObj);
                });
            });
        });

        table.requests.post.forEach(function(obj){
            app.post(baseEndPoint + obj.url, function(req, res){
                var newObj = make_newer_object(req.body, obj.schema);
                var newObject = new table.name(newObj);
                newObject.save(function(err, data){
                    if(err)
                        throw err;
                    else
                        res.send(data);
                });
            });
        });

        table.requests.put.forEach(function(obj){
            app.put(baseEndPoint + obj.url, function(req, res){
                var urlParams = Parse_GET_URL(obj.url);

                var update = {};
                obj.params.forEach(function(p){
                    update[p] = req.body[p];
                });

                // One parameter
                if(obj['id'] == true){
                    var id = req.params[urlParams[0]];
                    table.name.findByIdAndUpdate(
                        id,
                        update,
                        {
                            'new': true,
                            'upsert': true
                        },
                        function(err, data){
                            if(err)
                                throw err;
                            else
                                res.send(data);
                        });
                }
                else{
                    var query = {};
                    urlParams.forEach(function(p){
                        query[p] = req.params[p];
                    });

                    table.name.findOneAndUpdate(
                        query,
                        update,
                        {
                            'new': true,
                            'upsert': true,
                            'sort': 'asc'
                        },
                        function(err, data){
                            if(err)
                                throw err;
                            else
                                res.send(data);
                        }
                    );
                }
            });
        });

        table.requests.remove.forEach(function(obj){
            app.delete(baseEndPoint + obj.url, function(req, res){
                var urlParams = Parse_GET_URL(obj.url);

                // One parameter
                if(obj['id'] == true){
                    var id = req.params[urlParams[0]];
                    table.name.findByIdAndRemove(
                        id,
                        function(err, data){
                            if(err)
                                throw err;
                            else
                                res.send(data);
                        });
                }
                else{
                    var query = {};
                    urlParams.forEach(function(p){
                        query[p] = req.params[p];
                    });

                    table.name.findOneAndRemove(
                        query,
                        function(err, data){
                            if(err)
                                throw err;
                            else
                                res.send(data);
                        }
                    );
                }
            });
        });
    });
};
