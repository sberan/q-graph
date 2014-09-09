
# q-flow

### Dependency injected promise workflows

A flow is a set of computations. Entries in the set can depend on each other,
using function parameter names to bind to the result of other entries.

Entry values can be a simple value, a promise, or a function. A function will be invoked once all it's dependencies
are finished, and can return either a simple value, or a promise.

Entries will be run concurrently, as long as all their dependencies are fulfilled.

### Example Flow

```javascript
    var flow = require('q-flow');

    flow({
      stepOne: function() {
        return q(1); // returning a promise. This could be a database or web service call.
      },
      stepTwo: function(stepOne) {
        // will be called with the result computed by stepOne
        return stepOne + 1;
      },
      stepThree: function(stepOne, stepTwo) {
        // depends on the two previous computations
        return stepOne + stepTwo;
      },
    }).then(console.log); //prints {stepOne: 1, stepTwo: 2, stepThree: 3}
```

### Special entries:

#### _catch

`_catch` entries will be invoked when the flow encounters an error. This is syntactic sugar for `flow({ ... }).catch( ... );`


*Example*

```javascript
    flow({
      step: function() {
        throw Error("oops");
      },
      _catch: function(err) {
        return "it's all good"
      }
    }).then(console.log); //prints "it's all good"
```

#### _then

`_then` entries wait for all other entries to run, and modify the result of the flow. Instead of a map of all results, the result of the `_then` entry is returned.

*Example*

```javascript
    flow({
      one: 1,
      two: function(one) {
        return one + 1;
      },
      _then: function(one, two) {
        return one + two
      }
    }).then(console.log); //prints 3
```

