'use strict';


//# map :: (a -> b) -> [a] -> [b]
//.
//. Transforms a list of elements of type `a` into a list of elements
//. of type `b` using the provided function of type `a -> b`.
//.
//. ```javascript
//. > map(String)([1, 2, 3, 4, 5])
//. ['1', '2', '3', '4', '5']
//. ```
var map = function(f) {
  return function(xs) {
    var output = [];
    for (var idx = 0; idx < xs.length; idx += 1) {
      output.push(f(xs[idx]));
    }
    return output;
  };
};


//# filter :: (a -> Boolean) -> [a] -> [a]
//.
//. Returns the list of elements which satisfy the provided predicate.
//.
//. ```javascript
//. > filter(function(n) { return n % 2 === 0; })([1, 2, 3, 4, 5])
//. [2, 4]
//. ```
var filter = function(pred) {
  return function(xs) {
    var output = [];
    for (var idx = 0; idx < xs.length; idx += 1) {
      if (pred(xs[idx])) {
        output.push(xs[idx]);
      }
    }
    return output;
  };
};


module.exports = {
  filter: filter,
  map: map,
};
