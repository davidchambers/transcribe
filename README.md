# Transcribe

Transcribe is a simple program which generates Markdown documentation from code
comments.

The general idea is that each "export" should be accompanied by a "docstring".
The first line of the "docstring" should be a Haskell-inspired type signature.
The signature line is identified by `::`, which must have a space either side.

```javascript
//. map :: (a -> b) -> [a] -> [b]
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
```

The `--prefix` option specifies which lines in the source files should appear
in the output. The default value is `//.`; specify a different value if using
a different comment style. For example:

    --prefix '#.'

Each line beginning with zero or more whitespace characters followed by the
prefix is included in the output, sans prefix and leading whitespace. The `.`
in the default prefix makes it possible to be selective about which comments
are included in the output: comments such as `// Should never get here!` will
be ignored.

The `--url` option specifies a template for generating links to specific lines
of source code on GitHub or another code-hosting site. The value should include
`{filename}` and `{line}` placeholders to be replaced with the filename and
line number of each of the signature lines. For example:

    --url 'https://github.com/plaid/sanctuary/blob/v0.4.0/{filename}#L{line}'

Avoid pointing to a moving target: include a tag name or commit hash rather
than a branch name such as `master`.

The `--heading` option specifies the heading level. The default value is `###`,
which corresponds to an `<h3>` element in HTML. Remember to quote the value if
providing this option, since `#` begins a line comment in Bash. For example:

    --heading '####'

The options should be followed by one or more filenames. The filenames may
be separated from the options by `--`. Files are processed in the order in
which they are specified.

Here's a complete example:

    $ transcribe \
    >   --url 'https://github.com/plaid/example/blob/v1.2.3/{filename}#L{line}' \
    >   -- examples/fp.js
    ### [`map :: (a -> b) -> [a] -> [b]`](https://github.com/plaid/example/blob/v1.2.3/examples/fp.js#L4)

    Transforms a list of elements of type `a` into a list of elements
    of type `b` using the provided function of type `a -> b`.

    ```javascript
    > map(String)([1, 2, 3, 4, 5])
    ['1', '2', '3', '4', '5']
    ```

    ### [`filter :: (a -> Boolean) -> [a] -> [a]`](https://github.com/plaid/example/blob/v1.2.3/examples/fp.js#L24)

    Returns the list of elements which satisfy the provided predicate.

    ```javascript
    > filter(function(n) { return n % 2 === 0; })([1, 2, 3, 4, 5])
    [2, 4]
    ```

The output is written to stdout. One could redirect it to a file to generate
lightweight API documentation:

    $ printf '\n## API\n\n' >>README.md
    $ transcribe \
    >   --url 'https://github.com/plaid/example/blob/v1.2.3/{filename}#L{line}' \
    >   -- examples/fp.js >>README.md

Reading from stdin is not currently supported.
