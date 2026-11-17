import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { config } from './config';
import { assetUrl, pause } from './media';
import { createHeartLayout } from './heart-layout';

type Phase = 'flying' | 'heart' | 'fading';
type Props = { photos: string[]; phase: Phase; reduced: boolean; onComplete: () => void; onOpen: () => void };
const directions = [[-1, -.6], [1, .5], [0, -1], [.3, 1], [-1, 1], [1, -1], [-1, -1], [1, 1]];

export function PhotoStage({ photos, phase, reduced, onComplete, onOpen }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [size, setSize] = useState({ width: 340, height: 430 });
  const [arrived, setArrived] = useState<Set<number>>(new Set());
  const motion = useRef(reduced);
  const activeAnimations = useRef(new Set<Animation>());
  const layout = useMemo(() => createHeartLayout(photos.length), [photos.length]);
  const complete = phase !== 'flying';

  useEffect(() => {
    motion.current = reduced;
    if (reduced) activeAnimations.current.forEach(animation => animation.updatePlaybackRate(20));
  }, [reduced]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const animations = new Set<Animation>();
    activeAnimations.current = animations;
    const limit = window.innerWidth < 600 ? config.mobileFlightConcurrency : config.desktopFlightConcurrency;
    let cursor = 0;
    let nextStart = 0;
    async function worker() {
      while (cursor < layout.cells.length && !signal.aborted) {
        const i = cursor++;
        const now = performance.now();
        const start = Math.max(now, nextStart);
        nextStart = start + (motion.current ? 65 : config.timing.staggerMin + Math.random() * (config.timing.staggerMax - config.timing.staggerMin));
        await pause(start - now, signal);
        const element = refs.current[i];
        if (!element || signal.aborted) return;
        const rect = container.current!.getBoundingClientRect();
        const [dx, dy] = directions[i % directions.length];
        const calm = motion.current;
        const duration = calm ? 180 : (config.timing.flightMin + config.timing.flightMax) / 2;
        const scale = Math.max(1.7, Math.min(config.heartStyle.entryWidth, rect.width * .4) / element.offsetWidth);
        const x = dx * (rect.width * .65 + config.heartStyle.entryWidth);
        const y = dy * (rect.height * .65 + config.heartStyle.entryWidth);
        const animation = element.animate(calm ? [
          { opacity: 0, transform: 'translateY(8px) scale(1.06)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ] : [
          { offset: 0, opacity: 0, transform: `translate(${x}px,${y}px) rotate(${dx * 15}deg) scale(${scale})` },
          { offset: .12, opacity: 1, transform: `translate(${x * .75}px,${y * .75}px) rotate(${dx * 11}deg) scale(${scale * .88})` },
          { offset: .55, opacity: 1, transform: `translate(${x * .16 + dy * 12}px,${y * .16 - dx * 12}px) rotate(${dx * 4}deg) scale(${1 + (scale - 1) * .32})` },
          { offset: 1, opacity: 1, transform: 'translate(0,0) rotate(0deg) scale(1)' },
        ], { duration, easing: 'cubic-bezier(.25,.55,.3,1)', fill: 'forwards' });
        animations.add(animation);
        element.classList.add('is-flying');
        await animation.finished;
        if (signal.aborted) return;
        element.style.opacity = '1';
        element.classList.remove('is-flying');
        animation.cancel();
        animations.delete(animation);
        setArrived(previous => new Set(previous).add(i));
      }
    }
    Promise.all(Array.from({ length: Math.min(limit, layout.cells.length) }, worker))
      .then(() => { if (!signal.aborted) onComplete(); }).catch(() => { /* cleanup cancellation */ });
    return () => { controller.abort(); animations.forEach(animation => animation.cancel()); };
  }, [photos, layout, onComplete]);

  const heartWidth = Math.min(size.width - 54, size.height * .83, 545);
  const tile = heartWidth / layout.columns;
  const heartHeight = tile * layout.rows;
  const heartLeft = (size.width - heartWidth) / 2;
  const heartTop = (size.height - heartHeight) / 2;
  const heartStyle = {
    '--heart-breathe': `${config.heartStyle.breathe}ms`,
    '--heart-float': `${config.heartStyle.floating}ms`,
    '--heart-reveal': `${config.heartStyle.detailReveal}ms`,
    '--heart-glow': config.heartStyle.glow,
    '--heart-outline': config.heartStyle.outline,
  } as CSSProperties;
  return <div className={`photo-scene ${phase}`}>
    <div className="scene-heading">
      <span className="eyebrow">NHỮNG ĐIỀU ANH TRÂN QUÝ</span>
      <h1>{complete ? 'Tất cả đều là em.' : 'Từng khoảnh khắc, một thương yêu.'}</h1>
      <p>{complete ? 'Gói ghém một chút kỷ niệm, gửi em cả trái tim.' : 'Từng chút một, em lấp đầy trái tim anh.'}</p>
    </div>
    <div ref={container} className="photo-canvas" style={heartStyle}>
      <div className="heart-aura" aria-hidden="true" style={{ left: heartLeft - 12, top: heartTop - 12, width: heartWidth + 24, height: heartHeight + 24 }}>
        <div className="heart-glow" />
        <svg className="heart-thread" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 96C43 87 3 62 3 31C3 6 32-3 50 18C68-3 97 6 97 31C97 62 57 87 50 96Z" /></svg>
        {['♡', '✧', '♡', '✦', '♡', '✧'].map((symbol, i) => <span key={i} className={`heart-confetti confetti-${i}`}>{symbol}</span>)}
      </div>
      <div className="heart-group">
        {layout.cells.map((cell, i) => {
          const width = tile * 1.015;
          return <div key={i} ref={element => { refs.current[i] = element; }} className={`memory tile direct-tile ${arrived.has(i) ? 'is-landed' : ''}`} style={{
            left: heartLeft + cell.x * tile, top: heartTop + cell.y * tile,
            width, height: width * 1.04,
            opacity: arrived.has(i) ? 1 : 0,
            rotate: `${Math.sin(i * 2.3) * config.heartStyle.tileTilt}deg`,
            zIndex: i,
          }}><img src={assetUrl(photos[i % photos.length])} alt="" draggable="false" /></div>;
        })}
      </div>
      {phase === 'heart' && <button className="heart-hit" onClick={onOpen} aria-label="Mở lời chúc" style={{ width: heartWidth, height: heartHeight }} autoFocus>
        <svg className="tap-hint" width="43" height="52" viewBox="0 0 43 52" fill="none" aria-hidden="true"><circle cx="18" cy="13" r="11" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4"/><path d="M14 31V14a4 4 0 0 1 8 0v12-3a4 4 0 0 1 7 0v3a4 4 0 0 1 7 1v11c0 8-4 11-11 11h-3c-5 0-8-2-11-7l-6-9c-3-5 2-8 5-4l4 4" fill="#fffcf6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
      </button>}
    </div>
    <div className="scene-foot" aria-live="polite">{phase === 'flying' ? <><span className="tiny-heart">♡</span><span>{arrived.size} / {layout.cells.length} mảnh ghép thương yêu</span></> : <span className="little-script">Mỗi mảnh ghép, một phần hạnh phúc</span>}</div>
  </div>;
}
