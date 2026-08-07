#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.GH_REPO || 'JavierRibaldelRio/Tech2Net';
const OUT = join(__dirname, '..', 'release-data.json');

function emptyPayload(reason) {
  return {
    generatedAt: new Date().toISOString(),
    tag: null,
    name: null,
    publishedAt: null,
    htmlUrl: `https://github.com/${REPO}/releases`,
    releasesIndexUrl: `https://github.com/${REPO}/releases`,
    assets: [],
    note: reason,
  };
}

let payload;
try {
  const raw = execFileSync('gh', ['api', `repos/${REPO}/releases/latest`], {
    encoding: 'utf8',
    env: process.env,
  });
  const rel = JSON.parse(raw);
  payload = {
    generatedAt: new Date().toISOString(),
    tag: rel.tag_name,
    name: rel.name || rel.tag_name,
    publishedAt: rel.published_at,
    htmlUrl: rel.html_url,
    releasesIndexUrl: `https://github.com/${REPO}/releases`,
    assets: (rel.assets || []).map((a) => ({
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
    })),
  };
} catch (err) {
  console.error('No se pudo obtener la última release, generando ficha vacía:', err.message);
  payload = emptyPayload('no-release-found');
}

writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Escrito ${OUT}`);
console.log(JSON.stringify(payload, null, 2));
