// Fails the build when a published bundle is missing its 'use client'
// directive. Runs as `postbuild`, so it guards `npm run build`, CI, and
// `npm pack` / publish (via `prepack`). See worldware-studios/msg-react#22.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Every JS output file, not just index.*: the tsup banner applies to all of
// them (including any future chunks), so the check must too.
const BUNDLE = /\.(mjs|cjs)$/;

/**
 * Returns the directive prologue (leading string-literal statements) of a
 * script, skipping comments and blank lines.
 * @param {string} source
 * @returns {string[]}
 */
export function directivePrologue(source) {
  const directives = [];
  let rest = source;
  for (;;) {
    rest = rest.replace(/^(?:\s+|\/\/[^\n]*\n?|\/\*[\s\S]*?\*\/)+/, '');
    const match = rest.match(/^(['"])([^'"\n]*)\1\s*;?/);
    if (!match) return directives;
    directives.push(match[2]);
    rest = rest.slice(match[0].length);
  }
}

/**
 * Checks every `.mjs`/`.cjs` bundle in `distDir`; returns the bundles checked
 * and those without a 'use client' directive. An empty `checked` list (nothing
 * built) is reported as a failure by {@link runCheck}.
 * @param {string} distDir
 * @returns {{ checked: string[], missing: string[] }}
 */
export function checkDist(distDir) {
  const checked = readdirSync(distDir).filter((f) => BUNDLE.test(f)).sort();
  const missing = checked.filter(
    (f) => !directivePrologue(readFileSync(join(distDir, f), 'utf8')).includes('use client')
  );
  return { checked, missing };
}

/**
 * Checks `distDir` and reports the result; returns the process exit code.
 * @param {string} distDir
 * @param {{ log: (msg: string) => void, error: (msg: string) => void }} io
 * @returns {0 | 1}
 */
export function runCheck(distDir, io = console) {
  const { checked, missing } = checkDist(distDir);
  if (checked.length === 0) {
    io.error('check-dist: no .mjs/.cjs bundles found in dist/; run the build first.');
    return 1;
  }
  if (missing.length > 0) {
    io.error(
      `check-dist: missing 'use client' directive in ${missing.map((f) => `dist/${f}`).join(', ')}.\n` +
        'The components use hooks; without the directive RSC frameworks treat them as server code.'
    );
    return 1;
  }
  io.log(`check-dist: 'use client' present in ${checked.map((f) => `dist/${f}`).join(', ')}.`);
  return 0;
}

// CLI entry (`node scripts/check-dist.mjs`). Only runs when executed directly,
// not when imported by tests (where import.meta.url may not be a file: URL).
/* v8 ignore next 3 -- CLI entry; runCheck is tested directly. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = runCheck(fileURLToPath(new URL('../dist/', import.meta.url)));
}
