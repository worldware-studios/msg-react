import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { vi } from 'vitest';
import { checkDist, directivePrologue, runCheck } from './check-dist.mjs';

describe('directivePrologue', () => {
  it('reads single- and double-quoted directives in order', () => {
    expect(directivePrologue(`'use client';\n"use strict";\nvar x = 1;`)).toEqual([
      'use client',
      'use strict',
    ]);
  });

  it('skips leading line and block comments and blank lines', () => {
    expect(directivePrologue(`// banner\n/* license */\n\n'use client';\nfoo();`)).toEqual([
      'use client',
    ]);
  });

  it('accepts a directive without a trailing semicolon', () => {
    expect(directivePrologue(`"use client"\nimport x from 'y';`)).toEqual(['use client']);
  });

  it('stops at the first non-directive statement', () => {
    expect(directivePrologue(`import x from 'y';\n'use client';`)).toEqual([]);
  });
});

describe('checkDist', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'msg-react-dist-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('passes bundles that start with the directive', () => {
    writeFileSync(join(dir, 'index.mjs'), `'use client';\nexport {};`);
    writeFileSync(join(dir, 'index.cjs'), `'use client';\n"use strict";\n`);
    expect(checkDist(dir)).toEqual({ checked: ['index.cjs', 'index.mjs'], missing: [] });
  });

  it('reports bundles without the directive, ignoring non-bundle files', () => {
    writeFileSync(join(dir, 'index.mjs'), `// src/x.tsx\nimport { useContext } from "react";`);
    writeFileSync(join(dir, 'index.cjs'), `'use client';\n`);
    writeFileSync(join(dir, 'index.d.ts'), `export {};`);
    expect(checkDist(dir)).toEqual({ checked: ['index.cjs', 'index.mjs'], missing: ['index.mjs'] });
  });

  it('also checks chunk files beside the index bundles', () => {
    writeFileSync(join(dir, 'index.mjs'), `'use client';\nimport './chunk-AB12.mjs';`);
    writeFileSync(join(dir, 'chunk-AB12.mjs'), `export const x = 1;`);
    expect(checkDist(dir)).toEqual({
      checked: ['chunk-AB12.mjs', 'index.mjs'],
      missing: ['chunk-AB12.mjs'],
    });
  });

  it('reports nothing checked for an empty dist', () => {
    expect(checkDist(dir)).toEqual({ checked: [], missing: [] });
  });
});

describe('runCheck', () => {
  let dir;
  const io = () => ({ log: vi.fn(), error: vi.fn() });

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'msg-react-run-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns 0 and logs the checked bundles when all have the directive', () => {
    writeFileSync(join(dir, 'index.mjs'), `'use client';\n`);
    const out = io();
    expect(runCheck(dir, out)).toBe(0);
    expect(out.log).toHaveBeenCalledWith("check-dist: 'use client' present in dist/index.mjs.");
    expect(out.error).not.toHaveBeenCalled();
  });

  it('returns 1 and names the bundles missing the directive', () => {
    writeFileSync(join(dir, 'index.mjs'), `import x from 'y';\n`);
    writeFileSync(join(dir, 'index.cjs'), `"use strict";\n`);
    const out = io();
    expect(runCheck(dir, out)).toBe(1);
    expect(out.error.mock.calls[0][0]).toContain("missing 'use client' directive in dist/index.cjs, dist/index.mjs.");
  });

  it('returns 1 when no bundles were built', () => {
    const out = io();
    expect(runCheck(dir, out)).toBe(1);
    expect(out.error).toHaveBeenCalledWith('check-dist: no .mjs/.cjs bundles found in dist/; run the build first.');
  });
});
