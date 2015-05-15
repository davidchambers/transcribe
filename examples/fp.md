<h3 name="map"><code><a href="https://github.com/plaid/transcribe/blob/v0.3.0/examples/fp.js#L4">map :: (a -> b) -> [a] -> [b]</a></code></h3>

Transforms a list of elements of type `a` into a list of elements
of type `b` using the provided function of type `a -> b`.

```javascript
> map(String)([1, 2, 3, 4, 5])
['1', '2', '3', '4', '5']
```

<h3 name="filter"><code><a href="https://github.com/plaid/transcribe/blob/v0.3.0/examples/fp.js#L24">filter :: (a -> Boolean) -> [a] -> [a]</a></code></h3>

Returns the list of elements which satisfy the provided predicate.

```javascript
> filter(function(n) { return n % 2 === 0; })([1, 2, 3, 4, 5])
[2, 4]
```
