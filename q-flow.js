var q = require('q'),
    _ = require('underscore'),
    getParameterNames = require('get-parameter-names');

module.exports = function(flowSpec) {
  var entries = {}; 
  var results = {};
  var promises = []

  Object.keys(flowSpec).forEach(function (key) { 
    var deferred = q.defer();
    entries[key] = {val: flowSpec[key], deferred: deferred, promise: deferred.promise}
    promises.push(deferred.promise);
    deferred.promise.then(function(val) {
      results[key] = val;
    });
  });
  
  Object.keys(flowSpec).forEach(function (key) {
    var entry = entries[key];

    // a raw promise or val
    if(q.isPromise(entry.val) || !_.isFunction(entry.val)) {
      q(entry.val).then(function(val) {
        entry.deferred.resolve(val);
      }).catch(entry.deferred.reject)
      return;
    }

    //a function
    var deps = getParameterNames(entry.val)
    var depPromises = deps.map(function(depName) { return entries[depName].promise })
    q.all(depPromises).then(function(depResults) {
      q.fapply(entry.val, depResults).then(function(result) {
        entry.deferred.resolve(result);
      }).catch(entry.deferred.reject);
    });
  });


  return q.all(promises).then(function() {
    return results;
  });
}
