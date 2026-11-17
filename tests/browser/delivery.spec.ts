import { test, expect } from '@playwright/test';

for (const width of [360, 390, 430, 1440]) {
  test(`bồ câu thả cuộn thư, thư bung lớn dần ở ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.gift-button').click();
    await page.locator('.heart-hit').waitFor({ timeout: 15000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.heart-hit').evaluate(node => { for (let i = 0; i < 8; i++) (node as HTMLButtonElement).click(); });
    await expect(page.locator('.dove-flight')).toBeVisible();
    await expect(page.locator('.letter-text')).toBeHidden();
    await expect(page.locator('.carried-scroll')).toBeVisible();
    await expect(page.locator('.dove-flight.is-released')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.dropped-scroll')).toBeVisible();
    await expect(page.locator('.letter-scene.is-unfolding')).toBeVisible({ timeout: 5000 });
    const paper = page.locator('.letter-paper');
    const early = await paper.evaluate(node => {
      const insets = getComputedStyle(node).clipPath.split('round')[0].match(/[\d.]+px/g)?.map(Number.parseFloat) ?? [0];
      return { width: node.getBoundingClientRect().width, visibleHeight: (node as HTMLElement).offsetHeight - (insets.length >= 3 ? insets[2] : insets[0]) };
    });
    await page.waitForTimeout(700);
    const later = await paper.evaluate(node => {
      const insets = getComputedStyle(node).clipPath.split('round')[0].match(/[\d.]+px/g)?.map(Number.parseFloat) ?? [0];
      return { width: node.getBoundingClientRect().width, visibleHeight: (node as HTMLElement).offsetHeight - (insets.length >= 3 ? insets[2] : insets[0]) };
    });
    expect(Math.abs(later.width - early.width)).toBeLessThan(2);
    expect(later.visibleHeight).toBeGreaterThan(early.visibleHeight + 12);
    const duration = await paper.evaluate(node => node.getAnimations().find(animation => animation.effect instanceof KeyframeEffect && (animation.effect as KeyframeEffect).getKeyframes().some(frame => frame.clipPath))!.effect!.getTiming().duration);
    expect(Number(duration)).toBeGreaterThanOrEqual(5500);
    const edgeGap = await paper.evaluate(node => {
      const style = getComputedStyle(node);
      const insets = style.clipPath.split('round')[0].match(/[\d.]+px/g)?.map(Number.parseFloat) ?? [0];
      const bottomInset = insets.length >= 3 ? insets[2] : insets[0];
      const box = node.getBoundingClientRect();
      const paperBottom = box.bottom - bottomInset * new DOMMatrix(style.transform).d;
      const edge = document.querySelector('.unroll-roller')!.getBoundingClientRect();
      return Math.abs(edge.top + edge.height / 2 - paperBottom);
    });
    expect(edgeGap).toBeLessThan(10);
    await page.screenshot({ path: `test-results/unfolding-${width}.png` });
    await expect(page.locator('.flying-letter').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.letter-text')).toBeVisible({ timeout: 10000 });
    expect(await page.locator('.letter-text').textContent()).toBe(await (await page.request.get('/letter.txt')).text());
    await expect(page.locator('.letter-delivery-layer')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.replay-button').click();
    await expect(page.locator('.gift-button')).toBeFocused();
  });
}

test('xoay màn hình hoặc bật giảm chuyển động khi chim bay vẫn mở đủ thư', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.gift-button').click();
  await page.locator('.heart-hit').waitFor({ timeout: 15000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.heart-hit').click();
  await expect(page.locator('.dove-flight')).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.letter-text')).toBeVisible();
  await expect(page.locator('.letter-delivery-layer')).toHaveCount(0);
  await expect(page.locator('.replay-button')).toBeEnabled();
});
