var flow = require('./q-flow.js'),
    q = require('q'),
    chai = require('chai');

chai.use(require('chai-as-promised')).should()

describe('q-flow', function() {

  describe('resolving values', function() {

    it('should return a static value', function() {
      var results = flow({
        one: 1
      })
      
      return results.should.eventually.contain({one: 1})
    });

    it('should resolve a computed value', function() {
      var results = flow({
        one: function() {
          return 1;
        }
      })
      
      return results.should.eventually.contain({one: 1})
    });

    it('should resolve a raw promise', function() {
      var results = flow({
        twoPromise: q.fcall(function() { return 2 })
      })
      
      return results.should.eventually.contain({twoPromise: 2})
    });

    it('should resolve a promise', function() {
      var results = flow({
        two: function() {
          return q.fcall(function() { return 2 });
        }
      })
      
      return results.should.eventually.contain({two: 2})
    });

    it('should resolve multiple values', function() {
      var results = flow({
        one: function() { return 1 },
        two: function() {
          return 2
        }
      })
      
      return results.should.eventually.contain({one: 1, two: 2})
    });

    it('should resolve a dependent value', function() {
      var results = flow({
        one: function() { return 1 },
        two: function(one) {
          return 1 + one; 
        }
      })
      
      return results.should.eventually.contain({one: 1, two: 2})
    });

    it('should resolve multiple dependent values', function() {
      var results = flow({
        one: function() { return 1 },
        two: function(one) {
          return 1 + one; 
        },
        three: function(one, two) {
          return one + two;
        }
      })
      
      return results.should.eventually.contain({one: 1, two: 2, three: 3})
    });
  })

  describe('error handling', function() {

    it('should pass on the error', function() {
      var results = flow({
        one: function() {
           throw Error("an error");
        }
      })

      return results.should.eventually.be.rejectedWith(Error, "an error");
    });

    it('should pass on the error with a raw promise', function() {
      var results = flow({
        one: q.fcall(function() {
           throw Error("an error");
        })
      })

      return results.should.eventually.be.rejectedWith(Error, "an error");
    });

    it('should pass on the error with a returned promise', function() {
      var results = flow({
        one: function() {
          return q.fcall(function() {
            throw Error("an error");
          });
        }
      })

      return results.should.eventually.be.rejectedWith(Error, "an error");
    });

    it('should pass on an error with a complex flow', function() {
      var results = flow({
        one: 1,
        two: function(one) {
          throw Error("error with value: " + (one + 1));
        }
      });

      return results.should.eventually.be.rejectedWith(Error, "error with value: 2");
    });

    it('should pass a nice error for missing deps', function() {
      var results = flow({
        one: 1,
        two: function(one, a) {
          return one + 1;
        }
      });

      return results.should.eventually.be.rejectedWith(Error, "Unkown dependency a for key: two");
    });
  });

  describe('special keys', function() {

    it('should allow a _catch entry to catch errors', function() {
      var results = flow({
        a: function () {
          throw Error("an error");
        },
        _catch: function(err) {
          return 42;
        }
      });

      return results.should.eventually.eql(42)
    });

    it('should allow a promise to be returned via _catch entry', function() {
      var results = flow({
        a: function () {
          throw Error("an error");
        },
        _catch: function(err) {
          return q.fcall(function() { return 22; });
        }
      });

      return results.should.eventually.eql(22)
    });

    it('should allow a static _catch entry', function() {
      var results = flow({
        a: function () {
          throw Error("an error");
        },
        _catch: 22
      });

      return results.should.eventually.eql(22)
    });

    it('should re-throw errors thrown in a catch entry', function() {
      var results = flow({
        a: function () {
          throw Error("an error");
        },
        _catch: function(err) {
          throw Error('error in catch');
        }
      });

      return results.should.eventually.be.rejectedWith(Error, 'error in catch')
    });

    it('should allow a _then entry to set the result', function() {
      var results = flow({
        one: 1,
        two: function(one) {
          return one + 1;
        },
        _then: function(one, two) {
          return 3;
        }
      });

      return results.should.eventually.eql(3);
    });

    it('should allow a promise to be returned via _then entry', function() {
      var results = flow({
        one: 1,
        two: function(one) {
          return one + 1;
        },
        _then: function(one, two) {
          return q.fcall(function() { return 3 });
        }
      });

      return results.should.eventually.eql(3);
    });

    it('should allow a static _then entry', function() {
      var results = flow({
        one: 1,
        two: function(one) {
          return one + 1;
        },
        _then: 3
      });

      return results.should.eventually.eql(3);
    });

    it('should re-throw errors thrown in the _then entry', function() {
      var results = flow({
        one: 1,
        two: function(one) {
          return one + 1;
        },
        _then: function(one, two) {
          throw Error('error in _then');
        }
      });

      return results.should.eventually.be.rejectedWith(Error, 'error in _then');
    });

    it('should only run _then entries after everything has finished', function() {
      var state = 'not run';

      var results = flow({
        wait: function () {
          var deferred = q.defer();
          setTimeout(function() {
            state = 'run';
            deferred.resolve();
          }, 10);
          return deferred.promise;
        },
        _then: function() { return state; }
      });

      return results.should.eventually.eql('run');
    });

  });

})
