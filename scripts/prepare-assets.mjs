import { readdir, mkdir, writeFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sample = `Gửi em, người anh thương nhất ♡

Chúc mừng sinh nhật vợ yêu của anh!

Cảm ơn em đã bước vào cuộc đời anh, biến những ngày bình thường thành những điều thật đáng nhớ. Có em, một bữa cơm giản dị cũng thành ấm áp, một buổi chiều mưa cũng thấy dịu dàng hơn.

Tuổi mới, anh mong em luôn khỏe mạnh, được làm những điều mình thích và cười thật nhiều. Mong em luôn biết rằng, dù hôm nay hay những ngày sau nữa, vẫn có một người ở đây để lắng nghe và nắm tay em.

Anh không hứa mọi ngày đều hoàn hảo. Nhưng anh muốn cùng em đi qua từng ngày, cùng giữ lại những niềm vui bé xíu và cùng viết thêm thật nhiều kỷ niệm.

Hôm nay là ngày của em. Còn thương em, là chuyện của anh mỗi ngày.

Yêu em thật nhiều,
Chồng của em ♡`;

export async function prepareAssets(root = resolve('public')) {
  await mkdir(join(root, 'photos'), { recursive: true });
  async function scan(dir, prefix = 'photos') {
    const entries = await readdir(dir, { withFileTypes: true });
    const results = await Promise.all(entries.map(entry => {
      const url = `${prefix}/${encodeURIComponent(entry.name)}`;
      if (entry.isDirectory()) return scan(join(dir, entry.name), url);
      return entry.isFile() && /\.(jpe?g|jfif|png|webp|avif)$/i.test(entry.name) ? [url] : [];
    }));
    return results.flat().sort();
  }
  let photos = await scan(join(root, 'photos'));
  const demo = photos.length === 0;
  if (demo) {
    await mkdir(join(root, 'demo'), { recursive: true });
    const colors = ['#e7b9b0', '#becbb9', '#c4c4de', '#e9cd9e', '#b5ced0', '#d7b3c1', '#cac4ab', '#dfbd9e'];
    for (const [i, color] of colors.entries()) {
      const filename = `memory-${i + 1}.svg`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480"><rect width="400" height="480" fill="${color}"/><circle cx="${80 + i * 28}" cy="110" r="48" fill="#fff1cf"/><path d="M0 330Q100 200 220 310T400 270V480H0" fill="#7d9887"/><path d="M0 400Q180 280 400 390V480H0" fill="#536f64"/><path d="M165 240C120 195 100 258 165 292C230 258 210 195 165 240" fill="#f9e1da"/><path d="M235 265C200 227 182 280 235 308C288 280 270 227 235 265" fill="#f7d6a9"/><path d="M159 287l-13 75m26-75 18 75m40-57-5 61m15-61 13 61" stroke="#f9e1da" stroke-width="14" stroke-linecap="round"/><text x="200" y="445" text-anchor="middle" fill="#fff9ed" font-size="20" font-family="Georgia">kỷ niệm nhỏ · ${String(i + 1).padStart(2, '0')}</text></svg>`;
      try { await writeFile(join(root, 'demo', filename), svg, { flag: 'wx' }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    photos = colors.map((_, i) => `demo/memory-${i + 1}.svg`);
  }
  try { await access(join(root, 'letter.txt')); } catch { await writeFile(join(root, 'letter.txt'), sample, { flag: 'wx' }); }
  const manifest = { demo, photos };
  await writeFile(join(root, 'photos-manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await prepareAssets();
  console.log(`Đã chuẩn bị ${result.photos.length} ảnh ${result.demo ? 'minh họa' : 'cá nhân'}.`);
}
