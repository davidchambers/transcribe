#!/usr/bin/env node

import fs from 'node:fs/promises';
import module from 'node:module';
import process from 'node:process';

import program from 'commander';

import {transcribe} from '../src/core.js';

export default async () => {
  const pkg = module.createRequire(import.meta.url)('../package.json');

  program
  .version(pkg.version)
  .usage('[options] <file ...>')
  .description(pkg.description)
  .option('--heading-level <num>', 'heading level in range [1, 6] (default: 3)')
  .option('--heading-prefix <str>', 'prefix for heading lines (default: "//#")')
  .option('--insert-into <str>', 'name of a file into which Transcribe will insert generated output')
  .option('--prefix <str>', 'prefix for non-heading lines (default: "//.")')
  .option('--url <str>', 'source URL with {filename} and {line} placeholders')
  .parse(process.argv);

  const files = await Promise.all(
    program.args.map(async name => {
      const text = await fs.readFile(name, 'utf8');
      return {name, text};
    })
  );

  const output = await transcribe(files, {
    ...program,
    headingLevel: Number(program.headingLevel ?? '3'),
  });

  if (program.insertInto == null) {
    process.stdout.write(output);
    return;
  }

  //  Read the file, insert the output, and write to the file again.
  const text = await fs.readFile(program.insertInto, 'utf8');
  const opening = '<!--transcribe-->';
  const closing = '<!--/transcribe-->';
  let from = text.indexOf(opening);
  if (from >= 0) {
    from += opening.length;
    const to = text.indexOf(closing, from);
    if (to >= 0) {
      return fs.writeFile(
        program.insertInto,
        `${text.slice(0, from)}\n\n${output}\n${text.slice(to)}`
      );
    }
  }
  throw new SyntaxError(`${program.insertInto} does not contain ${opening}...${closing}`);
};
