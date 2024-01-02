#!/usr/bin/env node

import process from 'node:process';

import main from '../src/main.js';

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
