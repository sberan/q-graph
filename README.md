
# q-graph

Promises are great, but it can be a pain to work with complex chains of promises, especially when they
depend on each other. `q-graph` makes it easy to set up the relationships between promises.

### Introduction

A `QGraph` is a JavaScript object which contains a set of `Step`s. `Step`s in the set can depend on each other,
using function parameter names to bind to the result of other `Step`s. When a `QGraph` is created, each step's
value is computed as soon as all it's dependent values are available. A `QGraph` returns a promise object containing all
the computed values of the `QGraph`.

### The simplest graph:

```javascript
    var graph = require('q-graph');
   
    var results = graph({
      step: function() {
        return q(1); // return a promise. This could be a database or web service call.
      }
    });

   results.then(console.log); //prints {step: 1}

```
In this case, we have a single step which returns a promise. This is a lot of code for not much result, so let's try something a little more complex.


### Multiple steps

```javascript
    var graph = require('q-graph');
   
    var results = graph({
      stepOne: function() {
        return q(1); 
      },
      stepTwo: function() {
        return q(2);
      }
    });

   results.then(console.log); //prints {stepOne: 1, stepTwo: 2}

```

This `QGraph` contains two steps - stepOne and stepTwo. The steps will be executed concurrently, since they don't depend on each other.


### `Step` dependencies

The real power of q-graph is in the `Step` dependency resolution. `Step`s can use the result values from other `Step`s when creating their result.
Dependencies are matched by looking up the `Step` value based on the parameter names of the current `Step`.

Example using dependencies to compute the value of `stepThree`

```javascript
    var graph = require('q-graph');

    var results = graph({
      stepOne: function() {
        return q(1); 
      },
      stepTwo: function() {
        return q(2);
      },
      stepThree: function(stepOne, stepTwo) {
        // passes the result of the two previous computations
        return q(stepOne + stepTwo);
      },
    });

    results.then(console.log); //prints {stepOne: 1, stepTwo: 2, stepThree: 3}
```

In this example, `stepOne` and `stepTwo` would be executed concurrently, and their values would be passed to `stepThree`.


### Shortcuts

If a step has no dependencies, it can be replaced by a simple value or promise. A step function can also return a simple value.

The previous example can be simplified like so:

```javascript
    var graph = require('q-graph');

    var results = graph({
      stepOne: 1, //a static value, instead of a function
      stepTwo: 2,
      stepThree: function(stepOne, stepTwo) {
        //return static values instead of a promise
        stepOne + stepTwo;
      },
    });

    results.then(console.log); //prints {stepOne: 1, stepTwo: 2, stepThree: 3}
```

### Special entries:

#### _catch

`_catch` steps will be invoked when the flow encounters an error. This is syntactic sugar for `flow({ ... }).catch( ... );`


*Example*

```javascript
    var result = graph({
      step: function() {
        throw Error("oops");
      },
      _catch: function(err) {
        return "it's all good"
      }
    })

    result.then(console.log); //prints "it's all good"
```

#### _then

`_then` steps modify the `QGraph` result. Instead of a map of all results, the result of the `_then` step is returned. `_then` steps
are not executed until all other steps have finished.

*Example*

```javascript
    var result = graph({
      one: 1,
      two: function(one) {
        return one + 1;
      },
      _then: function(one, two) {
        // modify the result
        return one + two;
      }
    })
   
    result.then(console.log); //prints 3
```

