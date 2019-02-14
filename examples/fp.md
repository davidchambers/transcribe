### <a name="map" href="https://github.com/plaid/transcribe/blob/v1.1.2/examples/fp.js#L3">`map :: (a -⁠> b) -⁠> Array a -⁠> Array b`</a>

Transforms a list of elements of type `a` into a list of elements
of type `b` using the provided function of type `a -> b`.

```javascript
> map (String) ([1, 2, 3, 4, 5])
['1', '2', '3', '4', '5']
```

### <a name="filter" href="https://github.com/plaid/transcribe/blob/v1.1.2/examples/fp.js#L23">`filter :: (a -⁠> Boolean) -⁠> Array a -⁠> Array a`</a>

Returns the list of elements which satisfy the provided predicate.

```javascript
> filter (function(n) { return n % 2 === 0; }) ([1, 2, 3, 4, 5])
[2, 4]
```
