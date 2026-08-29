#!/usr/bin/env node
/* Verifies the trainer's algorithm without a browser.
 *
 * 1. compiles the whole page script, so a syntax error fails the build;
 * 2. extracts the CORE MATH region — the page's single source of truth — and
 *    checks every date of the Gregorian range against the runtime's own
 *    calendar, with both year-offset methods.
 *
 * Usage: node tools/selftest.mjs [path/to/index.html] */

import { readFileSync } from "node:fs";

const SCRIPT_OPEN = '<script type="module">';
const SCRIPT_CLOSE = "</" + "script>";
const MATH_START = "/* CORE MATH START */";
const MATH_END = "/* CORE MATH END */";

const page = process.argv[2] ?? "index.html";
const html = readFileSync(page, "utf8");

function slice(text, open, close, what) {
  const from = text.indexOf(open);
  const to = text.indexOf(close, from + open.length);
  if (from < 0 || to < 0)
    throw new Error("Could not find " + what + " in " + JSON.stringify(page) +
      ": " + JSON.stringify({ open: open, close: close, from: from, to: to }));
  return text.slice(from + open.length, to);
}

const script = slice(html, SCRIPT_OPEN, SCRIPT_CLOSE, "the page script");
new Function(script); /* throws on a syntax error, never runs the body */
console.log("syntax ok — " + script.split("\n").length + " lines of page script");

const math = slice(script, MATH_START, MATH_END, "the core math region");
const source = "data:text/javascript," +
  encodeURIComponent(math + "\nexport { runSelfTest, MIN_YEAR, MAX_YEAR };");
const { runSelfTest, MIN_YEAR, MAX_YEAR } = await import(source);

const startedAt = Date.now();
const result = runSelfTest(MIN_YEAR, MAX_YEAR);
const seconds = ((Date.now() - startedAt) / 1000).toFixed(2);

if (result.failures.length > 0) {
  console.error("FAILED after " + result.checked + " dates:");
  console.error(JSON.stringify(result.failures, null, 2));
  process.exit(1);
}
console.log("all correct — " + result.checked.toLocaleString() + " dates in " +
  MIN_YEAR + "–" + MAX_YEAR + ", both offset methods, " + seconds + "s");
