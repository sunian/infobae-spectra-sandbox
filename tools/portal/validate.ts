import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { JSDOM } from 'jsdom';

export interface Issue {
  line?: number;
  message: string;
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

const REPO_URL = 'https://github.com/sunian/infobae-spectra-sandbox';
const MAX_SECTION_WORDS = 400;
const STATUSES = ['planned', 'available'];

const SECRET_PATTERNS: RegExp[] = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{36}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /\bsk-[A-Za-z0-9]{20,}/,
  /api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9]{16,}/i,
];

type MermaidApi = { parse: (text: string) => Promise<unknown> };
let mermaidApi: MermaidApi | undefined;

/** mermaid needs a DOM. Install a jsdom window once, then load mermaid. */
async function loadMermaid(): Promise<MermaidApi> {
  if (mermaidApi) return mermaidApi;
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const globals = globalThis as Record<string, unknown>;
  globals.window = dom.window;
  globals.document = dom.window.document;
  Object.defineProperty(globals, 'navigator', { value: dom.window.navigator, configurable: true });
  const mod = await import('mermaid');
  mermaidApi = mod.default as MermaidApi;
  return mermaidApi;
}

function isFeaturePage(file: string): boolean {
  return file.includes('docs/product/features/');
}

function isDecisionPage(file: string): boolean {
  return file.includes('docs/dev/decisions/');
}

function requiredFields(file: string): string[] {
  if (file.endsWith('docs/index.md')) return ['title', 'nav_order'];
  const fields = ['title', 'purpose', 'portal', 'nav_order'];
  if (isFeaturePage(file)) fields.push('feature', 'status', 'parent');
  if (isDecisionPage(file)) fields.push('feature', 'parent');
  return fields;
}

/** Line (1-based) where the Markdown body starts, so issue lines match the file. */
function bodyOffset(content: string, body: string): number {
  const total = content.split('\n').length;
  const bodyLines = body.split('\n').length;
  return total - bodyLines;
}

/** Portal pages must not carry a TL;DR block. TL;DR is only for SpecKit artifacts. */
function checkNoTldr(lines: string[], offset: number, errors: Issue[]): void {
  lines.forEach((line, i) => {
    if (/^> \*\*TL;DR\*\*/.test(line)) {
      errors.push({
        line: offset + i + 1,
        message: 'TL;DR block is not allowed on portal pages (constitution principle VII)',
      });
    }
  });
}

async function checkMermaid(lines: string[], offset: number, errors: Issue[]): Promise<void> {
  for (let i = 0; i < lines.length; i++) {
    if (!/^```mermaid\s*$/.test(lines[i])) continue;
    const start = i;
    const block: string[] = [];
    i++;
    while (i < lines.length && !/^```\s*$/.test(lines[i])) block.push(lines[i++]);
    try {
      const api = await loadMermaid();
      await api.parse(block.join('\n'));
    } catch (error) {
      const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
      errors.push({ line: offset + start + 1, message: `Invalid mermaid diagram: ${detail}` });
    }
  }
}

function checkLinks(
  file: string,
  lines: string[],
  offset: number,
  repoRoot: string,
  errors: Issue[],
): void {
  const link = /\]\(([^)\s]+)\)/g;
  lines.forEach((text, idx) => {
    for (const match of text.matchAll(link)) {
      const target = match[1].split('#')[0];
      if (target === '' || target.startsWith('{{') || target.startsWith('mailto:')) continue;
      if (target.startsWith(REPO_URL)) {
        const rel = target.replace(new RegExp(`^${REPO_URL}(/(blob|tree)/main)?/?`), '');
        if (rel !== '' && !fs.existsSync(path.join(repoRoot, rel))) {
          errors.push({ line: offset + idx + 1, message: `Repo link points to a missing path: ${rel}` });
        }
      } else if (!/^[a-z]+:/.test(target) && !target.startsWith('/')) {
        const resolved = path.resolve(repoRoot, path.dirname(file), target);
        if (!fs.existsSync(resolved)) {
          errors.push({ line: offset + idx + 1, message: `Relative link points to a missing file: ${target}` });
        }
      }
    }
  });
}

function checkSecrets(lines: string[], offset: number, errors: Issue[]): void {
  lines.forEach((text, idx) => {
    if (SECRET_PATTERNS.some((pattern) => pattern.test(text))) {
      errors.push({ line: offset + idx + 1, message: 'Secret-like string found' });
    }
  });
}

function checkSectionLength(lines: string[], offset: number, warnings: Issue[]): void {
  let inFence = false;
  let start = 0;
  let words = 0;
  const flush = () => {
    if (words > MAX_SECTION_WORDS) {
      warnings.push({ line: offset + start + 1, message: `Section has ${words} words, the guide is ${MAX_SECTION_WORDS}` });
    }
  };
  lines.forEach((text, idx) => {
    if (/^```/.test(text)) inFence = !inFence;
    if (!inFence && /^#{1,6} /.test(text)) {
      flush();
      start = idx;
      words = 0;
      return;
    }
    if (!inFence) words += text.split(/\s+/).filter(Boolean).length;
  });
  flush();
}

export async function validatePage(
  file: string,
  content: string,
  repoRoot: string,
): Promise<ValidationResult> {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;

  for (const field of requiredFields(file)) {
    if (data[field] === undefined || data[field] === '') {
      errors.push({ line: 1, message: `Front matter is missing "${field}"` });
    }
  }
  if (isFeaturePage(file) && data.status !== undefined && !STATUSES.includes(String(data.status))) {
    errors.push({ line: 1, message: `status must be "planned" or "available", got "${String(data.status)}"` });
  }

  const lines = parsed.content.split('\n');
  const offset = bodyOffset(content, parsed.content);
  checkNoTldr(lines, offset, errors);
  await checkMermaid(lines, offset, errors);
  checkLinks(file, lines, offset, repoRoot, errors);
  checkSecrets(lines, offset, errors);
  checkSectionLength(lines, offset, warnings);
  return { errors, warnings };
}

function collectMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectMarkdown(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

/** Walks the portals and the landing page, prints each issue, and returns the exit code. */
export async function main(repoRoot: string): Promise<number> {
  const files = [
    path.join(repoRoot, 'docs/index.md'),
    ...collectMarkdown(path.join(repoRoot, 'docs/dev')),
    ...collectMarkdown(path.join(repoRoot, 'docs/product')),
  ].filter((file) => fs.existsSync(file));

  let errorCount = 0;
  for (const abs of files) {
    const rel = path.relative(repoRoot, abs);
    const result = await validatePage(rel, fs.readFileSync(abs, 'utf8'), repoRoot);
    for (const issue of result.errors) console.error(`${rel}:${issue.line ?? 1} error ${issue.message}`);
    for (const issue of result.warnings) console.warn(`${rel}:${issue.line ?? 1} warning ${issue.message}`);
    errorCount += result.errors.length;
  }
  console.log(`Checked ${files.length} page(s): ${errorCount} error(s).`);
  return errorCount > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  main(repoRoot).then((code) => process.exit(code));
}
