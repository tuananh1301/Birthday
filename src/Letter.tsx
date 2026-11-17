import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from './config';
import { LetterArrival } from './LetterArrival';

type Props = { text: string; reduced: boolean; onReplay: () => void };
export function Letter({ text, reduced, onReplay }: Props) {
  const content = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLElement>(null);
  const [done, setDone] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [unfolding, setUnfolding] = useState(false);
  const unroll = useRef<Animation | null>(null);
  const beginUnfold = useCallback((animation?: Animation) => {
    if (animation) unroll.current = animation;
    setUnfolding(true);
  }, []);
  const finishDelivery = useCallback(() => setDelivered(true), []);
  useEffect(() => {
    const element = content.current!;
    if (!unfolding) { element.style.visibility = 'hidden'; return; }
    const article = paper.current!;
    const animations = new Set<Animation>();
    const overlays = new Set<HTMLElement>();
    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      element.style.visibility = 'visible';
      animations.forEach(a => a.cancel());
      overlays.forEach(node => node.remove());
      setDone(true);
    };
    // Measure the real text, then animate whole lines as the rolling edge reaches them.
    element.style.visibility = 'hidden';
    let frame = 0;
    const begin = async () => {
      await document.fonts.ready;
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        if (reduced || !unroll.current || !('Segmenter' in Intl)) { reveal(); return; }
        const node = element.firstChild;
        if (!node) { reveal(); return; }
        const segmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' });
        const range = document.createRange();
        const base = article.getBoundingClientRect();
        const computed = getComputedStyle(element);
        const lines = new Map<number, { start: number; end: number }>();
        for (const part of segmenter.segment(text)) {
          if (!part.segment.trim()) continue;
          range.setStart(node, part.index);
          range.setEnd(node, part.index + part.segment.length);
          const rect = range.getBoundingClientRect();
          if (rect.top > window.innerHeight + 40) break;
          if (rect.bottom < 0) continue;
          const top = Math.round(rect.top);
          const line = lines.get(top);
          if (line) line.end = part.index + part.segment.length;
          else if (lines.size < config.letterParticleLimit) lines.set(top, { start: part.index, end: part.index + part.segment.length });
        }
        const pending: { span: HTMLElement; top: number; index: number; started: boolean }[] = [];
        for (const [index, line] of [...lines.values()].entries()) {
          range.setStart(node, line.start);
          range.setEnd(node, line.end);
          const rect = range.getBoundingClientRect();
          const span = document.createElement('span');
          span.className = 'flying-letter';
          span.setAttribute('aria-hidden', 'true');
          span.textContent = text.slice(line.start, line.end);
          Object.assign(span.style, { left: `${rect.left - base.left - article.clientLeft}px`, top: `${rect.top - base.top - article.clientTop}px`, font: computed.font, lineHeight: `${rect.height}px`, letterSpacing: computed.letterSpacing, color: computed.color, opacity: '0' });
          article.appendChild(span);
          overlays.add(span);
          pending.push({ span, top: rect.top - base.top, index, started: false });
        }
        const followPaper = () => {
          if (cancelled) return;
          const rolling = unroll.current!;
          if (rolling.playState === 'finished' || rolling.playState === 'idle') { reveal(); return; }
          const insets = getComputedStyle(article).clipPath.split('round')[0].match(/[\d.]+px/g)?.map(Number.parseFloat) ?? [0];
          const edge = article.getBoundingClientRect().height - (insets.length >= 3 ? insets[2] : insets[0]);
          for (const line of pending) {
            if (line.started || line.top > edge) continue;
            line.started = true;
            const animation = line.span.animate([
              { opacity: 0, transform: `translate(${line.index % 2 ? 24 : -24}px, 14px)` },
              { opacity: 1, transform: 'translate(0, 0)' },
            ], { duration: Math.min(config.timing.letterFlight, 650), easing: 'cubic-bezier(.25,.5,.3,1)', fill: 'forwards' });
            animations.add(animation);
          }
          frame = requestAnimationFrame(followPaper);
        };
        followPaper();
      });
    };
    void begin();
    // Resize/scroll during assembly reveals the real text immediately: no stale coordinates.
    let measuredWidth = element.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      if (width !== measuredWidth && overlays.size) reveal();
      measuredWidth = width;
    });
    observer.observe(element);
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
      animations.forEach(a => a.cancel());
      overlays.forEach(node => node.remove());
    };
  }, [text, reduced, unfolding]);

  return <section className={`letter-scene has-delivery ${!delivered ? unfolding ? 'is-unfolding' : 'is-arriving' : 'is-delivered'}`}>
    <article ref={paper} className="letter-paper" aria-label="Bức thư sinh nhật" aria-busy={!done} style={{ visibility: unfolding || delivered ? 'visible' : 'hidden' }}>
      <svg className="pressed-flower" viewBox="0 0 90 140" fill="none" aria-hidden="true">
        <path d="M41 136C35 111 33 78 49 38M37 109C44 96 56 86 67 81M37 89C28 79 23 67 23 56" stroke="#87977a" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M39 107C45 87 62 86 70 80C67 95 52 108 39 107ZM37 90C19 87 17 71 20 62C33 67 39 77 37 90Z" fill="#a6b096" fillOpacity=".65" />
        <ellipse cx="38" cy="29" rx="12" ry="18" transform="rotate(-39 38 29)" fill="#d8a0ab" />
        <ellipse cx="56" cy="26" rx="12" ry="18" transform="rotate(31 56 26)" fill="#e7b4bd" />
        <ellipse cx="60" cy="41" rx="12" ry="16" transform="rotate(67 60 41)" fill="#d9a2b1" />
        <ellipse cx="39" cy="42" rx="13" ry="16" transform="rotate(-62 39 42)" fill="#ebc0c5" />
        <ellipse cx="48" cy="35" rx="11" ry="15" fill="#efc9ce" />
        <path d="M43 38Q45 26 52 31Q58 38 47 43Q40 44 40 35" stroke="#bc7d8d" strokeWidth="1.3" strokeLinecap="round" />
        <path d="m34 124 15-4m-16 8 15-4" stroke="#c9a684" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="paper-tape" aria-hidden="true" />
      <div ref={content} className="letter-text">{text}</div>
      <div className="letter-end" aria-hidden="true"><span /><div className="letter-wax-seal"><span>♡</span></div><span /></div>
    </article>
    <button className="replay-button" onClick={onReplay} disabled={!delivered}><span aria-hidden="true">↺</span> Xem lại món quà</button>
    <p className="letter-footer">Một món quà nhỏ. Một tình yêu thật lớn.</p>
    {!delivered && <LetterArrival paper={paper} reduced={reduced} onUnfold={beginUnfold} onComplete={finishDelivery} />}
  </section>;
}
