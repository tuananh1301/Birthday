import { test, expect } from '@playwright/test';

for (const width of [360, 390, 430, 1440]) {
  test(`nhạc cục bộ chỉ phát sau thao tác, tiếp tục qua các màn và giữ lựa chọn tắt ở ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let requests = 0;
    page.on('request', request => { if (request.url().endsWith('.mp3')) requests++; });
    await page.goto('/');
    const audio = page.locator('audio');
    await expect(audio).toHaveCount(1);
    expect(await audio.evaluate(node => (node as HTMLAudioElement).paused)).toBe(true);
    expect(requests).toBe(0);
    await page.locator('.gift-button').click();
    await expect(page.getByRole('button', { name: 'Tắt nhạc nền' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => audio.evaluate(node => (node as HTMLAudioElement).currentTime)).toBeGreaterThan(0.1);
    const first = await audio.evaluate(node => {
      const media = node as HTMLAudioElement;
      return { time: media.currentTime, loop: media.loop, volume: media.volume, source: media.currentSrc };
    });
    expect(first.loop).toBe(true);
    expect(first.volume).toBeGreaterThan(0);
    expect(first.volume).toBeLessThanOrEqual(0.35);
    expect(first.source).toContain('/music/NgayDauTien.mp3');
    await expect(page.locator('.heart-hit')).toBeVisible({ timeout: 15000 });
    await page.locator('.heart-hit').click();
    await expect(page.locator('.letter-text')).toBeVisible();
    expect(await audio.evaluate(node => (node as HTMLAudioElement).currentTime)).toBeGreaterThan(first.time);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const header = await page.locator('.site-header').boundingBox();
    const control = await page.locator('.music-toggle').boundingBox();
    expect(header!.y).toBeGreaterThanOrEqual(0);
    expect(control!.y + control!.height).toBeLessThanOrEqual(header!.y + header!.height);
    await page.getByRole('button', { name: 'Tắt nhạc nền' }).click();
    expect(await audio.evaluate(node => (node as HTMLAudioElement).paused)).toBe(true);
    const pausedAt = await audio.evaluate(node => (node as HTMLAudioElement).currentTime);
    await page.locator('.replay-button').click();
    await page.locator('.gift-button').click();
    await expect(page.locator('.heart-hit')).toBeVisible({ timeout: 15000 });
    expect(await audio.evaluate(node => (node as HTMLAudioElement).paused)).toBe(true);
    expect(await audio.evaluate(node => (node as HTMLAudioElement).currentTime)).toBeCloseTo(pausedAt, 1);
    await page.getByRole('button', { name: 'Bật nhạc nền' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => audio.evaluate(node => (node as HTMLAudioElement).currentTime)).toBeGreaterThan(pausedAt + 0.1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/music-control-${width}.png` });
  });
}

test('trình duyệt chặn phát vẫn mở quà và cho phép bật nhạc lại', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let blocked = true;
    HTMLMediaElement.prototype.play = function () {
      if (blocked) { blocked = false; return Promise.reject(new DOMException('Blocked', 'NotAllowedError')); }
      return original.call(this);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.gift-button').click();
  await expect(page.getByRole('button', { name: 'Bật nhạc nền' })).toBeVisible();
  await expect(page.locator('.music-status')).toContainText('Chạm');
  await expect(page.locator('.heart-hit')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Bật nhạc nền' }).click();
  await expect.poll(() => page.locator('audio').evaluate(node => (node as HTMLAudioElement).currentTime)).toBeGreaterThan(0.1);
  expect(errors).toEqual([]);
});

test('nhạc lỗi không chặn thư và có thể thử lại khi file tải được', async ({ page }) => {
  await page.route('**/music/*.mp3', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.gift-button').click();
  await expect(page.locator('.music-status')).toContainText('chưa tải được');
  await expect(page.locator('.heart-hit')).toBeVisible({ timeout: 15000 });
  await page.locator('.heart-hit').click();
  await expect(page.locator('.letter-text')).toBeVisible();
  await page.unroute('**/music/*.mp3');
  await page.getByRole('button', { name: 'Bật nhạc nền' }).click();
  await expect.poll(() => page.locator('audio').evaluate(node => (node as HTMLAudioElement).currentTime)).toBeGreaterThan(0.1);
});

test('tắt khi nhạc đang tải không phát muộn sau khi tải xong', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/music/*.mp3', async route => { await gate; await route.continue(); });
  await page.goto('/');
  await page.locator('.gift-button').click();
  await page.getByRole('button', { name: 'Tắt nhạc nền' }).click();
  release();
  await expect(page.getByRole('button', { name: 'Bật nhạc nền' })).toBeVisible();
  await page.waitForTimeout(500);
  expect(await page.locator('audio').evaluate(node => (node as HTMLAudioElement).paused)).toBe(true);
  await page.getByRole('button', { name: 'Bật nhạc nền' }).click();
  await expect.poll(() => page.locator('audio').evaluate(node => (node as HTMLAudioElement).currentTime)).toBeGreaterThan(0.1);
  await page.locator('.music-toggle').evaluate(node => { for (let i = 0; i < 7; i++) (node as HTMLButtonElement).click(); });
  await expect(page.getByRole('button', { name: 'Bật nhạc nền' })).toBeVisible();
  expect(await page.locator('audio').evaluate(node => (node as HTMLAudioElement).paused)).toBe(true);
});
