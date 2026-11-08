#!/usr/bin/env node
/**
 * Content build.
 *
 *   npm run build:content          compile + validate + write
 *   npm run check:content           validate only, write nothing
 *   npm run build:content -- --list print an inventory
 *
 * Reads every Markdown file under `content/`, validates it against the schema
 * in `src/schema.ts`, checks that the navigation and the content agree, and
 * writes a compiled TypeScript module to `src/generated/content.ts`.
 *
 * Nothing downstream (web, mobile, server) ever parses Markdown at runtime.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { docSchema } from '../src/schema.js';
import { parseBlocks } from '../src/markdown.js';
import { NAV } from '../src/nav.js';

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const packageRoot = resolve(scriptDir, '..');
const contentRoot = join(packageRoot, 'content');
const generatedDir = join(packageRoot, 'src', 'generated');

const BASE_KEYS = [
  'id',
  'kind',
  'section',
  'title',
  'subtitle',
  'summary',
  'order',
  'tags',
  'edition',
  'attribution',
  'body',
] as const;

const KIND_KEYS: Record<string, string[]> = {
  prayer: [],
  rosary: ['sets'],
  novena: ['novena'],
  chaplet: ['chapters'],
  litany: ['invocations'],
  stations: ['stations'],
  calendar: ['entries'],
};

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.name.endsWith('.md')) found.push(full);
  }
  return found.sort();
}

const errors: string[] = [];
const warnings: string[] = [];

const files = walk(contentRoot);
if (files.length === 0) {
  console.error('No content files found in', contentRoot);
  process.exit(1);
}

const docs = [];
for (const file of files) {
  const relPath = relative(packageRoot, file).replace(/\\/g, '/');
  const raw = matter(readFileSync(file, 'utf8'));
  const data = raw.data as Record<string, unknown>;

  const kind = typeof data.kind === 'string' ? data.kind : '';
  const allowed = new Set([...BASE_KEYS, ...(KIND_KEYS[kind] ?? [])]);
  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) {
      errors.push(
        `${relPath}: unknown frontmatter key "${key}" for kind "${kind || 'unknown'}"`,
      );
    }
  }

  if (typeof data.id === 'string' && data.id !== basename(file, '.md')) {
    errors.push(
      `${relPath}: id "${data.id}" must match the file name "${basename(file, '.md')}"`,
    );
  }

  const parsed = docSchema.safeParse({
    ...data,
    body: parseBlocks(raw.content),
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${relPath}: ${issue.path.join('.') || '(root)'} — ${issue.message}`);
    }
    continue;
  }

  docs.push(parsed.data);
}

// --- duplicates -------------------------------------------------------------
const seen = new Map<string, string>();
for (const doc of docs) {
  const previous = seen.get(doc.id);
  if (previous) errors.push(`duplicate id "${doc.id}" (also in ${previous})`);
  else seen.set(doc.id, doc.id);
}

// --- navigation agreement --------------------------------------------------
const navDocIds = new Set<string>();
const navHrefs = new Map<string, string>();
for (const section of NAV) {
  for (const entry of section.docs) {
    if (entry.docId) navDocIds.add(entry.docId);
    const clash = navHrefs.get(entry.href);
    if (clash) errors.push(`duplicate href "${entry.href}" (${clash})`);
    else navHrefs.set(entry.href, entry.label);
  }
}
for (const id of navDocIds) {
  if (!seen.has(id)) errors.push(`navigation references unknown doc "${id}"`);
}
for (const doc of docs) {
  if (!navDocIds.has(doc.id)) {
    warnings.push(`"${doc.id}" is not linked from the navigation`);
  }
}

// --- report -----------------------------------------------------------------
if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const warning of warnings) console.warn(`  ! ${warning}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const error of errors) console.error(`  x ${error}`);
  process.exit(1);
}

const sections = new Map<string, number>();
for (const doc of docs) sections.set(doc.section, (sections.get(doc.section) ?? 0) + 1);

if (process.argv.includes('--check')) {
  // Validate only. `--check` must never write anything — CI depends on it
  // being a read-only gate.
  console.log(`content: ${docs.length} documents validated`);
  process.exit(0);
}

if (process.argv.includes('--list')) {
  console.log(`\n${docs.length} documents\n`);
  for (const [section, count] of sections) {
    console.log(`  ${section.padEnd(12)} ${count}`);
  }
  console.log('');
  for (const doc of docs) {
    console.log(`  ${doc.section.padEnd(12)} ${doc.id.padEnd(38)} ${doc.title}`);
  }
  console.log('');
  process.exit(0);
}

// --- write ------------------------------------------------------------------
mkdirSync(generatedDir, { recursive: true });

const banner = `// AUTO-GENERATED FILE — do not edit by hand.
//
// Source:      packages/content/content/**/*.md
// Regenerate:  npm run build:content
// Documents:   ${docs.length}
`;
const output = `${banner}
import type { Doc } from '../schema.js';

export const content: Doc[] = ${JSON.stringify(docs, null, 2)};
`;

writeFileSync(join(generatedDir, 'content.ts'), output, 'utf8');

const summary = [...sections.entries()]
  .map(([section, count]) => `${section}:${count}`)
  .join('  ');
console.log(`content: ${docs.length} documents compiled (${summary})`);
