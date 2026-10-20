import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { validatePage } from './validate';

const TLDR = [
  '> **TL;DR** (max 5 bullets, written for a human reviewer)',
  '> - **What:** A thing.',
  '> - **Why:** A reason.',
  '> - **Check this:** One decision.',
].join('\n');

const FRONT = [
  '---',
  'title: Sample',
  'purpose: One sentence.',
  'portal: dev',
  'nav_order: 2',
  '---',
].join('\n');

function page(front: string, body: string): string {
  return `${front}\n\n# Sample\n\n${body}\n`;
}

let repoRoot = '';

beforeAll(() => {
  repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-'));
  fs.mkdirSync(path.join(repoRoot, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'src', 'exists.ts'), '');
});

const messages = (r: { errors: { message: string }[] }) => r.errors.map((e) => e.message).join('\n');

describe('validatePage', () => {
  it('accepts a fully valid page', async () => {
    const body = `${TLDR}\n\nText with a [link](https://github.com/sunian/infobae-spectra-sandbox/tree/main/src).\n\n\`\`\`mermaid\nflowchart TD\n  A --> B\n\`\`\``;
    const r = await validatePage('docs/dev/architecture.md', page(FRONT, body), repoRoot);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it('reports a missing front matter field', async () => {
    const front = FRONT.replace('purpose: One sentence.\n', '');
    const r = await validatePage('docs/dev/architecture.md', page(front, TLDR), repoRoot);
    expect(messages(r)).toMatch(/purpose/);
  });

  it('requires feature, status, and parent on Product feature pages', async () => {
    const r = await validatePage('docs/product/features/005-x.md', page(FRONT, TLDR), repoRoot);
    const m = messages(r);
    expect(m).toMatch(/feature/);
    expect(m).toMatch(/status/);
    expect(m).toMatch(/parent/);
  });

  it('rejects a Product feature status that is not planned or available', async () => {
    const front = FRONT.replace('---\n\n', '').replace(
      'nav_order: 2\n---',
      'nav_order: 2\nfeature: 005-x\nstatus: done\nparent: Product Portal\n---',
    );
    const r = await validatePage('docs/product/features/005-x.md', page(front, TLDR), repoRoot);
    expect(messages(r)).toMatch(/status/);
  });

  it('reports a missing TL;DR', async () => {
    const r = await validatePage('docs/dev/architecture.md', page(FRONT, 'Just text.'), repoRoot);
    expect(messages(r)).toMatch(/TL;DR/);
  });

  it('reports a TL;DR that is not the first content', async () => {
    const r = await validatePage(
      'docs/dev/architecture.md',
      page(FRONT, `Intro text first.\n\n${TLDR}`),
      repoRoot,
    );
    expect(messages(r)).toMatch(/TL;DR/);
  });

  it('reports a TL;DR with more than 5 bullets', async () => {
    const many = [
      '> **TL;DR**',
      ...[1, 2, 3, 4, 5, 6].map((n) => `> - bullet ${n}`),
    ].join('\n');
    const r = await validatePage('docs/dev/architecture.md', page(FRONT, many), repoRoot);
    expect(messages(r)).toMatch(/bullets/);
  });

  it('accepts a one-sentence TL;DR', async () => {
    const r = await validatePage(
      'docs/dev/architecture.md',
      page(FRONT, '> **TL;DR**: This page explains the app shape.'),
      repoRoot,
    );
    expect(r.errors).toEqual([]);
  });

  it('reports an invalid mermaid block with its line number', async () => {
    const body = `${TLDR}\n\n\`\`\`mermaid\nflowchart TD\n  A --> \n  B -->>> ((\n\`\`\``;
    const content = page(FRONT, body);
    const r = await validatePage('docs/dev/architecture.md', content, repoRoot);
    const issue = r.errors.find((e) => /mermaid/i.test(e.message));
    expect(issue).toBeDefined();
    const fenceLine = content.split('\n').findIndex((l) => l.startsWith('```mermaid')) + 1;
    expect(issue?.line).toBe(fenceLine);
  });

  it('reports a repo link to a missing path', async () => {
    const body = `${TLDR}\n\n[gone](https://github.com/sunian/infobae-spectra-sandbox/blob/main/src/missing.ts)`;
    const r = await validatePage('docs/dev/architecture.md', page(FRONT, body), repoRoot);
    expect(messages(r)).toMatch(/src\/missing\.ts/);
  });

  it('accepts a link to the repository root', async () => {
    const body = `${TLDR}\n\n[repo](https://github.com/sunian/infobae-spectra-sandbox)`;
    const r = await validatePage('docs/dev/architecture.md', page(FRONT, body), repoRoot);
    expect(r.errors).toEqual([]);
  });

  it('reports secret-like strings', async () => {
    const body = `${TLDR}\n\nkey: ghp_abcdefghijklmnopqrstuvwxyz0123456789`;
    const r = await validatePage('docs/dev/architecture.md', page(FRONT, body), repoRoot);
    expect(messages(r)).toMatch(/secret/i);
  });

  it('warns, but does not fail, on a section over 400 words', async () => {
    const long = Array.from({ length: 450 }, () => 'word').join(' ');
    const r = await validatePage(
      'docs/dev/architecture.md',
      page(FRONT, `${TLDR}\n\n## Long\n\n${long}`),
      repoRoot,
    );
    expect(r.errors).toEqual([]);
    expect(r.warnings.length).toBe(1);
  });

  it('only requires title and nav_order on the landing page', async () => {
    const front = '---\ntitle: Home\nnav_order: 1\n---';
    const r = await validatePage('docs/index.md', page(front, TLDR), repoRoot);
    expect(r.errors).toEqual([]);
  });
});
