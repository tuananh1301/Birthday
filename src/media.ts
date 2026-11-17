import { config } from './config';

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = window.setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}
export async function fetchText(path: string, signal: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) controller.abort();
  const timeout = setTimeout(abort, config.timing.imageTimeout);
  try {
    const response = await fetch(assetUrl(path), { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error(`Không đọc được ${path}`);
    return await response.text();
  } finally { clearTimeout(timeout); signal.removeEventListener('abort', abort); }
}
function loadImage(url: string, signal: AbortSignal): Promise<boolean> {
  return new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const finish = (valid: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      image.onload = image.onerror = null;
      if (!valid) image.src = '';
      resolve(valid);
    };
    const abort = () => finish(false);
    const timer = setTimeout(abort, config.timing.imageTimeout);
    signal.addEventListener('abort', abort, { once: true });
    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = abort;
    if (signal.aborted) return abort();
    image.src = url;
  });
}
export async function loadPhotos(urls: string[], signal: AbortSignal, progress: (done: number) => void) {
  let cursor = 0;
  let done = 0;
  const valid = new Array<boolean>(urls.length).fill(false);
  await Promise.all(Array.from({ length: Math.min(config.loadingConcurrency, urls.length) }, async () => {
    while (cursor < urls.length && !signal.aborted) {
      const index = cursor++;
      valid[index] = await loadImage(assetUrl(urls[index]), signal);
      if (!signal.aborted) progress(++done);
    }
  }));
  return urls.filter((_, i) => valid[i]);
}
