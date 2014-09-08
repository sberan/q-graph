var q = require('q'),
    _ = require('underscore'),
    getParameterNames = require('get-parameter-names'),
    util = require('util');

module.exports = function(flowSpec) {
  var entries = {}; 
  var results = {};
  var promises = [];

  Object.keys(flowSpec).forEach(function (key) { 
    if (key === '_catch') {
      return; //don't resolve dependencies for catch functions
    }
    var deferred = q.defer();
    entries[key] = {val: flowSpec[key], deferred: deferred, promise: deferred.promise}
    promises.push(deferred.promise);
    deferred.promise.then(function(val) {
      results[key] = val;
    });
  });
  
  Object.keys(entries).forEach(function (key) {
    var entry = entries[key];

    // a raw promise or val
    if (q.isPromise(entry.val) || !_.isFunction(entry.val)) {
      q(entry.val).then(function(val) {
        entry.deferred.resolve(val);
      }).catch(entry.deferred.reject)
      return;
    }

    //a function
    var deps = getParameterNames(entry.val)
    var unknownDeps = _.difference(deps, Object.keys(flowSpec));
    if (unknownDeps.length) {
      entry.deferred.reject(new Error(util.format("Unkown %s %s for key: %s", unknownDeps.length == 1? 'dependency': 'dependencies', unknownDeps, key)));
      return;
    }

    var depPromises = deps.map(function(depName) { return entries[depName] && entries[depName].promise })
    
    q.all(depPromises).then(function(depResults) {
      q.fapply(entry.val, depResults).then(function(result) {
        entry.deferred.resolve(result);
      }).catch(entry.deferred.reject)
    });
  });


  var result = q.all(promises).then(function() {
    return results;
  })

  if(flowSpec['_catch']) {
    var c = flowSpec['_catch'];
    if (q.isPromise(c) || !_.isFunction(c)) {
      result = result.catch(function() {
        return c;
      })
    } else {
      result = result.catch(c);
    }
  }

  return result;
}
