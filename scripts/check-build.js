'use strict';
/*
 * check-build.js — CI guard for the single-file Tempo app.
 *
 * What it catches: SYNTAX breakage in index.html's inline <script> — a missing
 *   brace, stray paren, broken string from a bad edit. These are exactly the
 *   failures a hand-edited single-file app is prone to.
 * What it does NOT catch: runtime/logic errors or undefined references — those
 *   only surface when the code actually executes in a browser. `new Function`
 *   COMPILES the body (throwing SyntaxError on malformed JS) but never RUNS it,
 *   so this is safe to run in CI and is a syntax gate, not a behavior test.
 *
 * Usage:  node scripts/check-build.js [path]   (defaults to index.html)
 * Exit 0 = all inline scripts parse; exit 1 = something is broken.
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'index.html';

let html;
try {
  html = fs.readFileSync(path.resolve(file), 'utf8');
} catch (e) {
  console.error(`\u2717 cannot read ${file}: ${e.message}`);
  process.exit(1);
}

// Every INLINE <script> block; skip <script src="..."> (not ours to parse).
const blocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m => !/\bsrc\s*=/i.test(m[1]))
  .map(m => m[2]);

if (blocks.length === 0) {
  console.error(`\u2717 no inline <script> found in ${file} \u2014 refusing to ship an empty app.`);
  process.exit(1);
}

let failed = 0;
blocks.forEach((code, i) => {
  try {
    new Function(code); // parse/compile only — does not execute
    console.log(`\u2713 script block #${i + 1} parses (${code.length} chars)`);
  } catch (e) {
    failed++;
    console.error(`\u2717 script block #${i + 1} failed to parse: ${e.message}`);
  }
});

if (failed) {
  console.error(`\n\u2717 ${failed} script block(s) broken in ${file} \u2014 blocking deploy.`);
  process.exit(1);
}
console.log(`\n\u2713 ${file}: all ${blocks.length} inline script block(s) valid.`);
