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
  const beginUnfold = useCallback(() => setUnfolding(true), []);
  const finishDelivery = useCallback(() => setDelivered(true), []);
  useEffect(() => {
    const element = content.current!;
    if (!delivered) { element.style.visibility = 'hidden'; return; }
    const article = paper.current!;
    const animations = new Set<Animation>();
    const overlays = new Set<HTMLElement>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      element.style.visibility = 'visible';
      animations.forEach(a => a.cancel());
      overlays.forEach(node => node.remove());
      setDone(true);
    };
    // Layout is the final, selectable plain text. Only visible graphemes get particles.
    element.style.visibility = 'hidden';
    let frame = 0;
    const begin = async () => {
      await document.fonts.ready;
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        if (reduced || !('Segmenter' in Intl)) { reveal(); return; }
        const node = element.firstChild;
        if (!node) { reveal(); return; }
        const segmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' });
        const range = document.createRange();
        const base = article.getBoundingClientRect();
        const computed = getComputedStyle(element);
        let index = 0;
        const lines = new Map<number, number>();
        for (const part of segmenter.segment(text)) {
          if (!part.segment.trim()) continue;
          range.setStart(node, part.index);
          range.setEnd(node, part.index + part.segment.length);
          const rect = range.getBoundingClientRect();
          if (rect.top > window.innerHeight + 40 || rect.bottom < 0) continue;
          if (index >= config.letterParticleLimit) break;
          const top = Math.round(rect.top);
          if (!lines.has(top)) lines.set(top, lines.size);
          const span = document.createElement('span');
          span.className = 'flying-letter';
          span.setAttribute('aria-hidden', 'true');
          span.textContent = part.segment;
          Object.assign(span.style, { left: `${rect.left - base.left}px`, top: `${rect.top - base.top}px`, font: computed.font, lineHeight: `${rect.height}px`, color: computed.color });
          article.appendChild(span);
          overlays.add(span);
          const angle = (index * 137.5) * Math.PI / 180;
          const distance = Math.min(window.innerWidth, 650) * (.6 + (index % 4) * .12);
          const animation = span.animate([
            { opacity: 0, transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${(index % 2 ? 1 : -1) * 30}deg)` },
            { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' },
          ], { duration: config.timing.letterFlight, delay: lines.get(top)! * config.timing.letterGroupDelay + (index % 7) * config.timing.letterCharacterDelay, easing: 'cubic-bezier(.25,.5,.3,1)', fill: 'both' });
          animations.add(animation);
          index++;
        }
        const timer = setTimeout(reveal, config.timing.letterFlight + lines.size * config.timing.letterGroupDelay + 200);
        timers.add(timer);
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
      timers.forEach(clearTimeout);
      animations.forEach(a => a.cancel());
      overlays.forEach(node => node.remove());
    };
  }, [text, reduced, delivered]);

  return <section className={`letter-scene has-delivery ${!delivered ? unfolding ? 'is-unfolding' : 'is-arriving' : 'is-delivered'}`}>
    <div className="letter-intro"><span className="eyebrow">DÀNH RIÊNG CHO NGƯỜI ANH THƯƠNG</span><h1>Đôi lời gửi em</h1><span className="ink-heart">♡</span></div>
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
      <div className="letter-mark" aria-hidden="true">
        <div className="letter-dedication"><span>MỘT LÁ THƯ NHỎ</span><em>gửi em, bằng cả trái tim</em></div>
        <div className="love-postage">
          <svg className="postmark" viewBox="0 0 68 34"><path d="M1 8Q9 1 17 8T33 8T49 8T65 8M1 17Q9 10 17 17T33 17T49 17T65 17M1 26Q9 19 17 26T33 26T49 26T65 26" /></svg>
          <svg className="love-stamp" viewBox="0 0 52 64"><rect x="2" y="2" width="48" height="60" rx="2" /><rect x="7" y="7" width="38" height="50" rx="1" /><path d="M26 38C7 28 14 15 26 24C38 15 45 28 26 38Z" /><text x="26" y="50" textAnchor="middle">GỬI EM</text></svg>
        </div>
      </div>
      <div ref={content} className="letter-text">{text}</div>
      <div className="letter-end" aria-hidden="true"><span /><div className="letter-wax-seal"><span>♡</span></div><span /></div>
    </article>
    <button className="replay-button" onClick={onReplay} disabled={!delivered}><span aria-hidden="true">↺</span> Xem lại món quà</button>
    <p className="letter-footer">Một món quà nhỏ. Một tình yêu thật lớn.</p>
    {!delivered && <LetterArrival paper={paper} reduced={reduced} onUnfold={beginUnfold} onComplete={finishDelivery} />}
  </section>;
}
