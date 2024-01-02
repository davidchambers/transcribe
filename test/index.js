import {deepStrictEqual as eq, fail} from 'node:assert';

import test from 'oletus';

import {transcribe} from '../src/core.js';


const template = 'https://github.com/owner/name/blob/v1.2.3/{filename}#L{line}';

const identity = {
  name: 'identity.js',
  text:
    '//# identity :: a -> a\n' +
    '//.\n' +
    '//. Returns its argument.\n' +
    'export const identity = x => x;\n',
};

const constant = {
  name: 'constant.js',
  text:
    '//# constant :: a -> b -> a\n' +
    '//.\n' +
    '//. Returns its first argument.\n' +
    'export const constant = x => y => x;\n',
};

const compose = {
  name: 'compose.js',
  text:
    '//# compose :: (b -> c) -> (a -> b) -> a -> c\n' +
    '//.\n' +
    '//. Returns the composition of its two arguments.\n' +
    'export const compose = f => g => x => f (g (x));\n',
};

const combinators = {
  name: 'combinators.js',
  text: identity.text + '\n' + constant.text + '\n' + compose.text,
};

const overText = f => ({name, text}) => ({name, text: f(text)});
const replaceText = (from, to) => overText(text => text.replace(from, to));
const replaceAllText = (from, to) => overText(text => text.replaceAll(from, to));
const unix2dos = replaceAllText('\n', '\r\n');


test('accepts an empty list of files', async () => {
  eq(
    await transcribe([], {url: template}),
    ''
  );
});

test('accepts a single file', async () => {
  eq(
    await transcribe([identity], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('concatenates multiple files (in the given order)', async () => {
  eq(
    await transcribe([identity, constant], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n' +
    '\n' +
    '### <a name="constant" href="https://github.com/owner/name/blob/v1.2.3/constant.js#L1">`constant :: a -\u{2060}> b -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its first argument.\n'
  );
});

test('introduces non-breaking spaces within parenthesized portions of type signatures', async () => {
  eq(
    await transcribe([compose], {url: template}),
    '### <a name="compose" href="https://github.com/owner/name/blob/v1.2.3/compose.js#L1">`compose :: (b\u{A0}-\u{2060}>\u{A0}c) -\u{2060}> (a\u{A0}-\u{2060}>\u{A0}b) -\u{2060}> a -\u{2060}> c`</a>\n' +
    '\n' +
    'Returns the composition of its two arguments.\n'
  );
});

test('preserves Windows line endings', async () => {
  eq(
    await transcribe([unix2dos(identity), unix2dos(constant)], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its argument.\r\n' +
    '\r\n' +
    '### <a name="constant" href="https://github.com/owner/name/blob/v1.2.3/constant.js#L1">`constant :: a -\u{2060}> b -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its first argument.\r\n'
  );
});

test('uses predominant line ending as file and section separator', async () => {
  eq(
    await transcribe([unix2dos(identity), unix2dos(constant), compose], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its argument.\r\n' +
    '\r\n' +
    '### <a name="constant" href="https://github.com/owner/name/blob/v1.2.3/constant.js#L1">`constant :: a -\u{2060}> b -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its first argument.\r\n' +
    '\r\n' +
    '### <a name="compose" href="https://github.com/owner/name/blob/v1.2.3/compose.js#L1">`compose :: (b\u{A0}-\u{2060}>\u{A0}c) -\u{2060}> (a\u{A0}-\u{2060}>\u{A0}b) -\u{2060}> a -\u{2060}> c`</a>\n' +
    '\n' +
    'Returns the composition of its two arguments.\n'
  );
});

test('uses Unix line ending as file and section separator in case of tie', async () => {
  eq(
    await transcribe([unix2dos(identity), replaceText('//.', '')(constant)], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its argument.\r\n' +
    '\n' +
    '### <a name="constant" href="https://github.com/owner/name/blob/v1.2.3/constant.js#L1">`constant :: a -\u{2060}> b -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its first argument.\n'
  );
});

test('calculates lines numbers for file with Unix line endings', async () => {
  eq(
    await transcribe([combinators], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/combinators.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n' +
    '\n' +
    '### <a name="constant" href="https://github.com/owner/name/blob/v1.2.3/combinators.js#L6">`constant :: a -\u{2060}> b -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its first argument.\n' +
    '\n' +
    '### <a name="compose" href="https://github.com/owner/name/blob/v1.2.3/combinators.js#L11">`compose :: (b\u{A0}-\u{2060}>\u{A0}c) -\u{2060}> (a\u{A0}-\u{2060}>\u{A0}b) -\u{2060}> a -\u{2060}> c`</a>\n' +
    '\n' +
    'Returns the composition of its two arguments.\n'
  );
});

test('calculates lines numbers for file with Windows line endings', async () => {
  eq(
    await transcribe([unix2dos(combinators)], {url: template}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/combinators.js#L1">`identity :: a -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its argument.\r\n' +
    '\r\n' +
    '### <a name="constant" href="https://github.com/owner/name/blob/v1.2.3/combinators.js#L6">`constant :: a -\u{2060}> b -\u{2060}> a`</a>\r\n' +
    '\r\n' +
    'Returns its first argument.\r\n' +
    '\r\n' +
    '### <a name="compose" href="https://github.com/owner/name/blob/v1.2.3/combinators.js#L11">`compose :: (b\u{A0}-\u{2060}>\u{A0}c) -\u{2060}> (a\u{A0}-\u{2060}>\u{A0}b) -\u{2060}> a -\u{2060}> c`</a>\r\n' +
    '\r\n' +
    'Returns the composition of its two arguments.\r\n'
  );
});

test('h1', async () => {
  eq(
    await transcribe([identity], {url: template, headingLevel: 1}),
    '# <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('h2', async () => {
  eq(
    await transcribe([identity], {url: template, headingLevel: 2}),
    '## <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('h3', async () => {
  eq(
    await transcribe([identity], {url: template, headingLevel: 3}),
    '### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('h4', async () => {
  eq(
    await transcribe([identity], {url: template, headingLevel: 4}),
    '#### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('h5', async () => {
  eq(
    await transcribe([identity], {url: template, headingLevel: 5}),
    '##### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('h6', async () => {
  eq(
    await transcribe([identity], {url: template, headingLevel: 6}),
    '###### <a name="identity" href="https://github.com/owner/name/blob/v1.2.3/identity.js#L1">`identity :: a -\u{2060}> a`</a>\n' +
    '\n' +
    'Returns its argument.\n'
  );
});

test('throws if heading level is not within valid range', async () => {
  try {
    await transcribe([identity], {url: template, headingLevel: 7});
  } catch (error) {
    eq(error, new RangeError('Heading level must be an integer in range [1, 6]'));
    return;
  }
  fail('Missing expected exception');
});

test('throws if URL template is not specified', async () => {
  try {
    await transcribe([identity], {});
  } catch (error) {
    eq(error, new TypeError('URL template not specified'));
    return;
  }
  fail('Missing expected exception');
});

test('throws if type signature does not contain " :: " separator', async () => {
  try {
    await transcribe([replaceText(' :: ', ' : ')(identity)], {url: template});
  } catch (error) {
    eq(error, new SyntaxError('Type signature does not contain " :: " separator'));
    return;
  }
  fail('Missing expected exception');
});

test('throws if type signature contains unmatched opening parenthesis', async () => {
  try {
    await transcribe([replaceText(')', '')(compose)], {url: template});
  } catch (error) {
    eq(error, new SyntaxError('Type signature contains unbalanced parentheses'));
    return;
  }
  fail('Missing expected exception');
});

test('throws if type signature contains unmatched closing parenthesis', async () => {
  try {
    await transcribe([replaceText('(', '')(compose)], {url: template});
  } catch (error) {
    eq(error, new SyntaxError('Type signature contains unbalanced parentheses'));
    return;
  }
  fail('Missing expected exception');
});
