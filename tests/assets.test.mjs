import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareAssets } from '../scripts/prepare-assets.mjs';

test('JFIF photos are included instead of demo images', async () => {
  const root = await mkdtemp(join(tmpdir(), 'birthday-'));
  try {
    await mkdir(join(root, 'photos', 'album'), { recursive: true });
    await writeFile(join(root, 'photos', 'memory.jfif'), 'photo');
    await writeFile(join(root, 'photos', 'album', 'memory.JFIF'), 'photo');
    const manifest = await prepareAssets(root);
    assert.equal(manifest.demo, false);
    assert.deepEqual(manifest.photos, ['photos/album/memory.JFIF', 'photos/memory.jfif']);
    assert.deepEqual(JSON.parse(await readFile(join(root, 'photos-manifest.json'), 'utf8')), manifest);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('quét ảnh thật, encode đường dẫn và giữ nguyên thư cá nhân', async () => {
  const root = await mkdtemp(join(tmpdir(), 'birthday-'));
  try {
    await mkdir(join(root, 'photos', 'Kỷ niệm'), { recursive: true });
    await writeFile(join(root, 'photos', 'Kỷ niệm', 'Vợ yêu.JPG'), 'photo');
    await writeFile(join(root, 'photos', 'no.svg'), 'not personal photo');
    await writeFile(join(root, 'letter.txt'), 'Em ơi,\n\nThương em!');
    const manifest = await prepareAssets(root);
    assert.equal(manifest.demo, false);
    assert.deepEqual(manifest.photos, ['photos/K%E1%BB%B7%20ni%E1%BB%87m/V%E1%BB%A3%20y%C3%AAu.JPG']);
    assert.equal(await readFile(join(root, 'letter.txt'), 'utf8'), 'Em ơi,\n\nThương em!');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('thư mục trống dùng SVG demo riêng và tạo thư mẫu', async () => {
  const root = await mkdtemp(join(tmpdir(), 'birthday-'));
  try {
    const result = await prepareAssets(root);
    assert.equal(result.demo, true);
    assert.ok(result.photos.length >= 6);
    assert.ok(result.photos.every(url => url.startsWith('demo/')));
    assert.ok((await readFile(join(root, 'letter.txt'), 'utf8')).length > 100);
  } finally { await rm(root, { recursive: true, force: true }); }
});
