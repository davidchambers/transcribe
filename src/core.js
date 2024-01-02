const escape = s => (
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
);

const controlWrapping = type => {
  const parts = type.split(' => ');
  for (let index = 0; index < parts.length; index += 1) {
    const unparenthesized = [''];
    const parenthesized = [];
    let depth = 0;
    for (const char of parts[index]) {
      if (char === '(') {
        depth += 1;
        parenthesized.push(char);
        unparenthesized.push('');
      } else if (char === ')') {
        if (depth === 0) {
          throw new SyntaxError('Type signature contains unbalanced parentheses');
        }
        depth -= 1;
        parenthesized[parenthesized.length - 1] += char;
      } else if (depth > 0) {
        parenthesized[parenthesized.length - 1] += char;
      } else {
        unparenthesized[unparenthesized.length - 1] += char;
      }
    }
    if (depth !== 0) {
      throw new SyntaxError('Type signature contains unbalanced parentheses');
    }
    unparenthesized.forEach((group, index) => {
      unparenthesized[index] = group.split(' -> ').map(s => s.replaceAll(' ', '\u{A0}')).join(' -> ');
    });
    parenthesized.forEach((group, index) => {
      parenthesized[index] = group.replaceAll(' ', '\u{A0}');
    });
    parts[index] = parenthesized.reduce(
      (part, group, index) => part + group + unparenthesized[index + 1],
      unparenthesized[0]
    );
  }
  return parts.join(' => ').replaceAll('->', '-\u{2060}>');
};

export const transcribe = async (files, {
  headingLevel = 3,
  headingPrefix = '//#',
  prefix = '//.',
  url,
}) => {
  if (!(Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6)) {
    throw new RangeError('Heading level must be an integer in range [1, 6]');
  }

  if (url == null) {
    throw new TypeError('URL template not specified');
  }

  //  Determine the predominant line ending in the given files.
  const counts = {'\n': 0, '\r\n': 0};
  for (const file of files) {
    for (const [ending] of file.text.matchAll(/\n|\r\n/g)) {
      counts[ending] += 1;
    }
  }
  const lineEnding = counts['\r\n'] > counts['\n'] ? '\r\n' : '\n';

  let output = '';
  for (const file of files) {
    if (output !== '') output += lineEnding;
    const iter = file.text.matchAll(/^[ ]*(?<line>.*)(?<ending>\n|\r\n)?/gm);
    let prevLine = NaN;  // used to determine contiguity of output lines
    let currLine = 0;
    for (const {groups: {line, ending = ''}} of iter) {
      currLine += 1;
      if (line.startsWith(headingPrefix)) {
        let from = headingPrefix.length;
        if (line.charAt(from) === ' ') from += 1;
        if (currLine > prevLine + 1) output += lineEnding;
        const signature = line.slice(from);
        const head = '#'.repeat(headingLevel);
        const index = signature.indexOf(' :: ');
        if (index < 0) throw new SyntaxError('Type signature does not contain " :: " separator');
        const name = signature.slice(0, index);
        const href = url.replace('{filename}', file.name).replace('{line}', currLine);
        const type = controlWrapping(signature.slice(index + ' :: '.length));
        output += `${head} <a name="${escape(name)}" href="${escape(href)}">\`${name} :: ${type}\`</a>${ending}`;
        prevLine = currLine;
      } else if (line.startsWith(prefix)) {
        let from = prefix.length;
        if (line.charAt(from) === ' ') from += 1;
        if (currLine > prevLine + 1) output += lineEnding;
        output += line.slice(from) + ending;
        prevLine = currLine;
      }
    }
  }
  return output;
};
