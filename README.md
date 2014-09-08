
# q-flow

### A utility to describe promise workflows as a dependency graph

Pass an object to describe workflows of promises. Entries in the object
may be used by other entries, and results are passed into other entries that depend
on them.

### A Simple Example

    var flow = require('q-flow');

    flow({
      one: 1,
      two: function(one) {
        return one + 1;
      },
      three: function(one, two) {
        return one + two;
      },
    }).then(console.log); //prints {one: 1, two: 2, three: 3}

### Special entries:

#### `_catch` entries:

`_catch` entries will be invoked when the flow encounters an error. This is syntactic sugar for flow({ ... }).catch( ... );


*Example*

    flow({
      step: function() {
        throw Error("oops");
      },
      _catch: function(err) {
        return "it's all good"
      }
    }).then(console.log); //prints "it's all good"

#### `_then` entries

`_then` entries modify the result of the flow. Instead of a map of all results, the result of the `_then` entry is returned.

*Example*

    flow({
      one: 1,
      two: function(one) {
        return one + 1;
      },
      _then: function(one, two) {
        return one + two
      }
    }).then(console.log); //prints 3

