import { test, expect, type Page } from '@playwright/test';

async function openGift(page: Page) {
  await page.getByRole('button', { name: 'Chạm để mở quà' }).click();
  await expect(page.getByRole('button', { name: 'Mở lời chúc' })).toBeVisible({ timeout: 60000 });
}
for (const width of [360, 390, 430, 1440]) {
  test(`luồng đầy đủ và replay ở ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Hôm nay là ngày của em ♡' })).toBeVisible();
    await page.screenshot({ path: `test-results/gift-${width}.png` });
    await openGift(page);
    await page.screenshot({ path: `test-results/heart-${width}.png` });
    await expect(page.locator('.scene-foot')).toContainText('Mỗi mảnh ghép');
    await page.getByRole('button', { name: 'Mở lời chúc' }).press('Enter');
    await expect(page.getByRole('article')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.flying-letter').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.letter-text')).toBeVisible({ timeout: 10000 });
    const original = await (await page.request.get('/letter.txt')).text();
    expect(await page.locator('.letter-text').textContent()).toBe(original);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/letter-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Xem lại món quà' }).click();
    await expect(page.getByRole('button', { name: 'Chạm để mở quà' })).toBeFocused();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGift(page);
    expect(errors).toEqual([]);
  });
}

test('ảnh lỗi, chỉ một ảnh, thư dài, resize, chạm liên tiếp', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/photos-manifest.json', route => route.fulfill({ json: { demo: false, photos: ['demo/memory-1.svg', 'photos/broken.jpg'] } }));
  const longLetter = ('Vợ yêu ơi, ngày mới thật dịu dàng. A\u0306n mừng nhé! <b>Vẫn là văn bản</b>\n\n').repeat(120);
  await page.route('**/letter.txt', route => route.fulfill({ body: longLetter, contentType: 'text/plain; charset=utf-8' }));
  await page.route('**/photos/broken.jpg', route => route.fulfill({ status: 404 }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Chạm để mở quà' }).evaluate(el => { for (let i = 0; i < 12; i++) (el as HTMLButtonElement).click(); });
  await expect(page.getByRole('button', { name: 'Mở lời chúc' })).toBeVisible();
  await expect(page.locator('.asset-notice')).toContainText('Một vài ảnh');
  expect(await page.locator('.memory img').evaluateAll(elements => new Set(elements.map(el => (el as HTMLImageElement).src)).size)).toBe(1);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'Mở lời chúc' }).click();
  await expect(page.locator('.letter-text')).toBeVisible();
  expect(await page.locator('.letter-text').textContent()).toBe(longLetter);
  expect(await page.locator('.letter-text b').count()).toBe(0);
  await page.getByRole('button', { name: 'Xem lại món quà' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Xem lại món quà' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('40 ảnh thu nhỏ và đáp thẳng vào tim, không đổi vị trí khi ảnh cuối hoàn tất', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.route('**/photos-manifest.json', route => route.fulfill({ json: { demo: true, photos: Array.from({ length: 40 }, (_, i) => `demo/memory-${i % 8 + 1}.svg`) } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Chạm để mở quà' }).click();
  const first = page.locator('.memory').first();
  await expect.poll(() => first.evaluate(node => node.getAnimations().some(a => a instanceof Animation && a.effect?.getTiming().duration !== 'auto'))).toBe(true);
  const widths = await first.evaluate(node => {
    const animation = node.getAnimations().find(a => a.effect instanceof KeyframeEffect && (a.effect as KeyframeEffect).getKeyframes().some(frame => String(frame.transform).includes('scale')))!;
    animation.pause();
    const duration = Number(animation.effect!.getTiming().duration);
    animation.currentTime = duration * .3;
    const early = node.getBoundingClientRect().width;
    animation.currentTime = duration * .8;
    const late = node.getBoundingClientRect().width;
    animation.finish();
    return { early, late };
  });
  expect(widths.early).toBeGreaterThan(widths.late * 1.2);
  await expect(first).toHaveClass(/is-landed/);
  const landedStyle = await first.getAttribute('style');
  await expect(page.getByRole('button', { name: 'Mở lời chúc' })).toHaveCount(0);
  await expect(page.locator('.memory')).toHaveCount(40);
  await expect(page.getByRole('button', { name: 'Mở lời chúc' })).toBeVisible({ timeout: 60000 });
  expect(await first.getAttribute('style')).toBe(landedStyle);
  expect(await page.locator('.memory.is-landed').count()).toBe(40);
  await page.screenshot({ path: 'test-results/direct-heart-40.png' });
  await expect(page.locator('.photo-scene.forming')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mở lời chúc' }).click();
  await expect(page.locator('.letter-text')).toBeVisible({ timeout: 25000 });
});

test('xoay màn hình giữa lúc ảnh bay vẫn đáp vào tim và hoàn tất', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Chạm để mở quà' }).click();
  await expect(page.locator('.memory.is-landed').first()).toBeVisible({ timeout: 10000 });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Mở lời chúc' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('tất cả ảnh lỗi vẫn mở thư; thư lỗi cho phép thử lại', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/photos-manifest.json', route => route.fulfill({ json: { photos: ['photos/broken.jpg'] } }));
  await page.route('**/photos/broken.jpg', route => route.abort());
  await page.route('**/letter.txt', route => route.fulfill({ status: 503 }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Chạm để mở quà' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.unroute('**/letter.txt');
  await openGift(page);
  await expect(page.locator('.asset-notice')).toContainText('Ảnh chưa mở được');
  await page.getByRole('button', { name: 'Mở lời chúc' }).click();
  await expect(page.locator('.letter-text')).toBeVisible();
});

test('đổi chế độ chuyển động không khởi chạy lại ảnh đã ghép tim', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await openGift(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(900); // wait past first scheduler delays to detect a restarted flight
  expect(await page.locator('.memory').evaluateAll(nodes => nodes.flatMap(node => node.getAnimations()).length)).toBe(0);
  await expect(page.getByRole('button', { name: 'Mở lời chúc' })).toBeVisible();
});

test('ảnh tải treo có timeout và vẫn đọc được thư', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/photos-manifest.json', route => route.fulfill({ json: { photos: ['photos/slow.jpg'] } }));
  await page.route('**/photos/slow.jpg', () => new Promise(() => {}));
  await page.goto('/');
  await openGift(page);
  await expect(page.locator('.asset-notice')).toContainText('Ảnh chưa mở được');
  await page.getByRole('button', { name: 'Mở lời chúc' }).click();
  await expect(page.locator('.letter-text')).toBeVisible();
});

test('hàng đợi tải có giới hạn; grapheme có dấu bay thực sự', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let pending = 0;
  let peak = 0;
  let loaded = 0;
  await page.route('**/demo/*.svg', async route => {
    pending++;
    peak = Math.max(peak, pending);
    const response = await route.fetch();
    await new Promise(resolve => setTimeout(resolve, 180));
    pending--; loaded++;
    await route.fulfill({ response });
  });
  const text = 'A\u0306n mừng sinh nhật vợ yêu ♡\n\nThương em,\nChồng.';
  await page.route('**/letter.txt', route => route.fulfill({ body: text, contentType: 'text/plain; charset=utf-8' }));
  await page.goto('/');
  await openGift(page);
  expect(peak).toBeLessThanOrEqual(4);
  expect(loaded).toBe(8);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Mở lời chúc' }).click();
  const particle = page.locator('.flying-letter').filter({ hasText: 'A\u0306' });
  await expect(particle).toHaveCount(1, { timeout: 20000 });
  const before = await particle.evaluate(node => getComputedStyle(node).transform);
  await page.waitForTimeout(250);
  const after = await particle.evaluate(node => getComputedStyle(node).transform);
  expect(after).not.toBe(before);
  await expect(page.locator('.letter-text')).toBeVisible({ timeout: 10000 });
  expect(await page.locator('.letter-text').textContent()).toBe(text);
});
