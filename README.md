
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
      done: function(three) {
        console.log(three); //prints 3
      }
    }).then(function(results) {
      console.log(results); //prints {one: 1, two: 2, three: 3}
    })


