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
    element.style.visibility = 'hidden';
    if (!unfolding) return;
    const article = paper.current!;
    const paragraphs = [...element.querySelectorAll<HTMLElement>('.letter-paragraph')];
    const animations = new Set<Animation>();
    const started = new Set<HTMLElement>();
    let cancelled = false;
    let revealed = false;
    let frame = 0;
    const reveal = () => {
      if (cancelled || revealed) return;
      revealed = true;
      cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      paragraphs.forEach(paragraph => {
        paragraph.style.opacity = '1';
        paragraph.style.visibility = '';
      });
      element.style.visibility = 'visible';
      setDone(true);
    };
    const followPaper = () => {
      if (cancelled || revealed) return;
      const rolling = unroll.current;
      if (reduced || !rolling || rolling.playState === 'finished' || rolling.playState === 'idle') { reveal(); return; }
      const box = article.getBoundingClientRect();
      const insets = getComputedStyle(article).clipPath.split('round')[0].match(/[\d.]+px/g)?.map(Number.parseFloat) ?? [0];
      const edge = box.bottom - (insets.length >= 3 ? insets[2] : insets[0]);
      let active = 0;
      for (const [index, paragraph] of paragraphs.entries()) {
        if (started.has(paragraph)) continue;
        // Native inline text keeps its font and wrapping even on mobile browsers.
        const firstLine = paragraph.getClientRects()[0];
        if (!firstLine || firstLine.top > window.innerHeight + 40) break;
        if (firstLine.top > edge || active >= config.letterParticleLimit) continue;
        started.add(paragraph);
        active++;
        paragraph.style.visibility = 'visible';
        const animation = paragraph.animate([
          { opacity: 0, left: index % 2 ? '8px' : '-8px', top: '10px' },
          { opacity: 1, left: '0px', top: '0px' },
        ], { duration: Math.min(config.timing.letterFlight, 650), easing: 'cubic-bezier(.25,.5,.3,1)', fill: 'forwards' });
        animations.add(animation);
      }
      frame = requestAnimationFrame(followPaper);
    };
    void document.fonts.ready.then(() => {
      if (!cancelled && !revealed) frame = requestAnimationFrame(followPaper);
    });
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
      animations.forEach(animation => animation.cancel());
      paragraphs.forEach(paragraph => {
        paragraph.style.opacity = '';
        paragraph.style.visibility = '';
      });
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
      <div ref={content} className="letter-text">{text.split(/(\n+)/).map((part, index) => part.startsWith('\n') ? part : <span key={index} className={done ? 'letter-paragraph' : 'letter-paragraph flying-letter'}>{part}</span>)}</div>
      <div className="letter-end" aria-hidden="true"><span /><div className="letter-wax-seal"><span>♡</span></div><span /></div>
    </article>
    <button className="replay-button" onClick={onReplay} disabled={!delivered}><span aria-hidden="true">↺</span> Xem lại món quà</button>
    <p className="letter-footer">Một món quà nhỏ. Một tình yêu thật lớn.</p>
    {!delivered && <LetterArrival paper={paper} reduced={reduced} onUnfold={beginUnfold} onComplete={finishDelivery} />}
  </section>;
}
