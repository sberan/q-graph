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

    it('should pass on an error with a complex flow', function() {
      var results = flow({
        one: 1,
        two: function(one) {
          throw Error("error with value: " + (one + 1));
        },
        three: function(one) {
          return one + 2;
        }
      });

      return results.should.eventually.be.rejectedWith(Error, "error with value: 2");
    });
  });
})
