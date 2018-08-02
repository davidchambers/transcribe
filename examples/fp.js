'use strict';

//# map :: (a -> b) -> Array a -> Array b
//.
//. Transforms a list of elements of type `a` into a list of elements
//. of type `b` using the provided function of type `a -> b`.
//.
//. ```javascript
//. > map (String) ([1, 2, 3, 4, 5])
//. ['1', '2', '3', '4', '5']
//. ```
function map(f) {
  return function(xs) {
    var output = [];
    for (var idx = 0; idx < xs.length; idx += 1) {
      output.push (f (xs[idx]));
    }
    return output;
  };
}
exports.map = map;

//# filter :: (a -> Boolean) -> Array a -> Array a
//.
//. Returns the list of elements which satisfy the provided predicate.
//.
//. ```javascript
//. > filter (function(n) { return n % 2 === 0; }) ([1, 2, 3, 4, 5])
//. [2, 4]
//. ```
function filter(pred) {
  return function(xs) {
    var output = [];
    for (var idx = 0; idx < xs.length; idx += 1) {
      if (pred (xs[idx])) {
        output.push (xs[idx]);
      }
    }
    return output;
  };
}
exports.filter = filter;
