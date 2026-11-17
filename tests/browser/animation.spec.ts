import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`photo flights keep scroll dimensions stable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
    await page.goto('/');
    await page.locator('.gift-button').click();
    await page.locator('.memory.is-flying').first().waitFor();
    const sizes = await page.evaluate(async () => {
      const samples: string[] = [];
      const until = performance.now() + 3500;
      while (performance.now() < until) {
        samples.push(`${document.documentElement.scrollWidth}:${document.documentElement.scrollHeight}:${document.documentElement.clientWidth}`);
        await new Promise(requestAnimationFrame);
      }
      return [...new Set(samples)];
    });
    expect(sizes).toEqual([`${width}:${width > 600 ? 1000 : 844}:${width}`]);
  });

  test(`text follows the unrolling paper at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.gift-button').click();
    await page.locator('.heart-hit').waitFor();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.heart-hit').click();
    await page.locator('.letter-scene.is-unfolding').waitFor({ timeout: 15000 });
    await expect(page.locator('.flying-letter').first()).toBeAttached({ timeout: 1000 });
    // Seek the real paper animation: text must follow its edge, not a second timer.
    await page.locator('.letter-paper').evaluate(node => {
      const animation = node.getAnimations().find(a => a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some(f => f.clipPath))!;
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) * .5;
    });
    await expect.poll(() => page.locator('.flying-letter').evaluateAll(nodes => nodes.filter(node => node.getAnimations().length > 0).length)).toBeGreaterThan(1);
    const pending = await page.locator('.flying-letter').evaluateAll(nodes => nodes.filter(node => getComputedStyle(node).opacity === '0').length);
    expect(pending).toBeGreaterThan(0);
    await page.locator('.letter-paper').evaluate(node => node.getAnimations().forEach(a => a.finish()));
    await expect(page.locator('.letter-text')).toBeVisible();
    expect(await page.locator('.letter-text').textContent()).toBe(await (await page.request.get('/letter.txt')).text());
    await expect(page.locator('.letter-delivery-layer')).toHaveCount(0);
    await expect(page.locator('.flying-letter')).toHaveCount(0);
  });
}
