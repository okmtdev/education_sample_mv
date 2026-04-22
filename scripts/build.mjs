#!/usr/bin/env node
/**
 * Simple build: copy ./public into ./dist.
 * The game is written in vanilla ES modules so no bundling is required.
 */
import { cp, rm, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = resolve(root, 'public');
const dest = resolve(root, 'dist');

if (!existsSync(src)) {
  console.error(`[build] source directory not found: ${src}`);
  process.exit(1);
}

if (existsSync(dest)) {
  await rm(dest, { recursive: true, force: true });
}
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

const s = await stat(dest);
console.log(`[build] copied ${src} -> ${dest} (ok=${s.isDirectory()})`);
