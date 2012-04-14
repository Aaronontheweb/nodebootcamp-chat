/*
 * Maps low-level objects into consumable forms expected
 * by our ViewModels
 */

exports.createChatMessage = function(username, data){
  return {"author": username, "text":data, "timestamp": new Date()};
}

exports.createUser = function(username){
  return {"username": username};
}

exports.mapArray = function(data, mapFn){
    var arr = Object.keys(data).reduce(function(arr, id){
        arr.push(mapFn(data[id]));
        return arr;
    }, []);

    return arr;
}

