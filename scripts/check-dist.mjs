// Fails the build when a published bundle is missing its 'use client'
// directive. Runs as `postbuild`, so it guards `npm run build`, CI, and
// `npm pack` / publish (via `prepack`). See worldware-studios/msg-react#22.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url);
const BUNDLE = /^index\.(mjs|cjs|js)$/;

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
 * Checks every bundle in `distDir`; returns the names of bundles without a
 * 'use client' directive (or all of them as missing if none exist).
 * @param {string | URL} distDir
 * @returns {{ checked: string[], missing: string[] }}
 */
export function checkDist(distDir) {
  const checked = readdirSync(distDir).filter((f) => BUNDLE.test(f)).sort();
  const missing = checked.filter((f) => {
    const source = readFileSync(join(distDir instanceof URL ? distDir.pathname : distDir, f), 'utf8');
    return !directivePrologue(source).includes('use client');
  });
  return { checked, missing };
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const { checked, missing } = checkDist(DIST);
  if (checked.length === 0) {
    console.error('check-dist: no dist/index.* bundles found; run the build first.');
    process.exit(1);
  }
  if (missing.length > 0) {
    console.error(
      `check-dist: missing 'use client' directive in ${missing.map((f) => `dist/${f}`).join(', ')}.\n` +
        "The components use hooks; without the directive RSC frameworks treat them as server code."
    );
    process.exit(1);
  }
  console.log(`check-dist: 'use client' present in ${checked.map((f) => `dist/${f}`).join(', ')}.`);
}
