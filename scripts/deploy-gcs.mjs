#!/usr/bin/env node
/**
 * Deploy ./dist to a Google Cloud Storage bucket using the `gcloud` CLI.
 *
 * Usage:
 *   GCS_BUCKET=your-bucket-name npm run deploy:gcs
 *   GCS_BUCKET=your-bucket-name GCS_PREFIX=subpath npm run deploy:gcs
 *
 * This script uses `gcloud storage` (not gsutil).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

const bucket = process.env.GCS_BUCKET;
if (!bucket) {
  console.error('[deploy] Set GCS_BUCKET environment variable (without the "gs://" prefix).');
  process.exit(1);
}

if (!existsSync(dist)) {
  console.error('[deploy] ./dist not found. Run `npm run build` first.');
  process.exit(1);
}

const prefix = process.env.GCS_PREFIX ? `/${process.env.GCS_PREFIX.replace(/^\/+|\/+$/g, '')}` : '';
const target = `gs://${bucket}${prefix}`;

function run(cmd, args) {
  console.log(`[deploy] $ ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`[deploy] command failed with exit ${res.status}`);
    process.exit(res.status ?? 1);
  }
}

// rsync the folder and delete files that no longer exist in dist.
run('gcloud', [
  'storage',
  'rsync',
  dist,
  target,
  '--recursive',
  '--delete-unmatched-destination-objects',
]);

// Ensure the HTML is served with short cache, while static assets stay cacheable.
run('gcloud', [
  'storage',
  'objects',
  'update',
  `${target}/index.html`,
  '--cache-control=no-cache, max-age=0',
]);

console.log(`\n[deploy] done. Public URL (if bucket is public):`);
console.log(`  https://storage.googleapis.com/${bucket}${prefix}/index.html`);
