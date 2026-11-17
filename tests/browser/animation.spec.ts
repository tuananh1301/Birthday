import { test, expect } from '@playwright/test';

test('mobile letter keeps native wrapping when text size changes during unrolling', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('.gift-button').click();
    await page.locator('.heart-hit').waitFor();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.heart-hit').click();
    await page.locator('.letter-scene.is-unfolding').waitFor({ timeout: 15000 });
    await expect(page.locator('.flying-letter').first()).toBeAttached();
    await page.locator('.letter-paper').evaluate(node => {
      const animation = node.getAnimations().find(a => a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some(f => f.clipPath))!;
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) * .6;
    });
    await page.addStyleTag({ content: '.letter-text { font-size: 22px !important; line-height: 1.8 !important; }' });
    const typography = await page.locator('.flying-letter').first().evaluate(node => ({
      fontSize: getComputedStyle(node).fontSize,
      lineHeight: getComputedStyle(node).lineHeight,
      textFontSize: getComputedStyle(document.querySelector('.letter-text')!).fontSize,
      textLineHeight: getComputedStyle(document.querySelector('.letter-text')!).lineHeight,
    }));
    expect(typography.fontSize).toBe(typography.textFontSize);
    expect(typography.lineHeight).toBe(typography.textLineHeight);
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(page.locator('.letter-delivery-layer')).toHaveCount(0);
    await expect(page.locator('.flying-letter')).toHaveCount(0);
    const fits = await page.locator('.letter-text').evaluate(node => {
      const bounds = node.getBoundingClientRect();
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let textNode;
      while ((textNode = walker.nextNode())) {
        const text = textNode.textContent!;
        for (let i = 0; i < text.length; i++) {
          // pre-wrap permits invisible trailing spaces to hang past the line edge.
          if (!text[i].trim()) continue;
          range.setStart(textNode, i);
          range.setEnd(textNode, i + 1);
          const rect = range.getBoundingClientRect();
          if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) return false;
        }
      }
      return true;
    });
    expect(fits).toBe(true);
    expect(await page.locator('.letter-text').textContent()).toBe(await (await page.request.get('http://127.0.0.1:5173/letter.txt')).text());
  } finally { await page.close(); }
});

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
