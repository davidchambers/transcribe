# Transcribe

Transcribe is a simple program which generates Markdown documentation from code
comments.

The general idea is that each "export" should be accompanied by a "docstring".
The first line of the "docstring" should be a Haskell-inspired type signature
in the form `<heading-prefix> <name> :: <type>`.

```javascript
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
```

The __`--heading-prefix`__ option specifies which lines in the source files
contain type signatures to become headings in the output. The default value
is `//#`; specify a different value if using a different comment style. For
example:

    --heading-prefix '#%'

The __`--prefix`__ option specifies which lines in the source files should
appear in the output along with the lines prefixed with `<heading-prefix>`.
The default value is `//.`; specify a different value if using a different
comment style. For example:

    --prefix '#.'

Each line beginning with zero or more whitespace characters followed by the
prefix is included in the output, sans prefix and leading whitespace. The `.`
in the default prefix makes it possible to be selective about which comments
are included in the output: comments such as `// Should never get here!` will
be ignored.

The __`--url`__ option specifies a template for generating links to specific
lines of source code on GitHub or another code-hosting site. The value should
include `{filename}` and `{line}` placeholders to be replaced with the filename
and line number of each of the signature lines. For example:

    --url 'https://github.com/plaid/sanctuary/blob/v0.4.0/{filename}#L{line}'

Avoid pointing to a moving target: include a tag name or commit hash rather
than a branch name such as `master`.

The __`--heading-level`__ option specifies the heading level, an integer in
range [1, 6]. The default value is `3`, which corresponds to an `<h3>` element
in HTML. Specify a different value if desired. For example:

    --heading-level 4

The __`--insert-into`__ option specifies the name of a file into which
Transcribe will insert the generated output. By default, Transcribe writes to
stdout. However, if `--insert-into` is provided, Transcribe will insert the
output in the specified file between two special tags: `<!--transcribe-->` and
`<!--/transcribe-->`. For example:

    --insert-into README.md

The options should be followed by one or more filenames. The filenames may
be separated from the options by `--`. Files are processed in the order in
which they are specified.

Here's a complete example:

    $ transcribe \
    >   --url 'https://github.com/plaid/example/blob/v1.2.3/{filename}#L{line}' \
    >   -- examples/fp.js
    ### <a name="map" href="https://github.com/plaid/example/blob/v1.2.3/examples/fp.js#L4">`map :: (a -⁠> b) -⁠> [a] -⁠> [b]`</a>

    Transforms a list of elements of type `a` into a list of elements
    of type `b` using the provided function of type `a -> b`.

    ```javascript
    > map(String)([1, 2, 3, 4, 5])
    ['1', '2', '3', '4', '5']
    ```

    ### <a name="filter" href="https://github.com/plaid/example/blob/v1.2.3/examples/fp.js#L24">`filter :: (a -⁠> Boolean) -⁠> [a] -⁠> [a]`</a>

    Returns the list of elements which satisfy the provided predicate.

    ```javascript
    > filter(function(n) { return n % 2 === 0; })([1, 2, 3, 4, 5])
    [2, 4]
    ```

By default, the output is written to stdout. One could redirect it to a file to
generate lightweight API documentation:

    $ printf '\n## API\n\n' >>README.md
    $ transcribe \
    >   --url 'https://github.com/plaid/example/blob/v1.2.3/{filename}#L{line}' \
    >   -- examples/fp.js >>README.md

Reading from stdin is not currently supported.

One could also insert the output into an existing file by providing the
`--insert-into` option:

    $ transcribe \
    >   --url 'https://github.com/plaid/example/blob/v1.2.3/{filename}#L{line}' \
    >   --insert-into README.md
    >   -- examples/fp.js
