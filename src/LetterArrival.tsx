import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { config } from './config';
import { Dove } from './Dove';

type Props = {
  paper: RefObject<HTMLElement | null>;
  reduced: boolean;
  onUnfold: () => void;
  onComplete: () => void;
};

function RolledLetter() {
  return <><span className="roll-cylinder" /><span className="roll-end roll-end-left" /><span className="roll-end roll-end-right" /><span className="roll-ribbon"><i /><b /></span></>;
}

export function LetterArrival({ paper, reduced, onUnfold, onComplete }: Props) {
  const bird = useRef<HTMLDivElement>(null);
  const carried = useRef<HTMLDivElement>(null);
  const dropped = useRef<HTMLDivElement>(null);
  const roller = useRef<HTMLDivElement>(null);
  const motion = useRef(reduced);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    motion.current = reduced;
    if (reduced) finishRef.current();
  }, [reduced]);

  useEffect(() => {
    const animations = new Set<Animation>();
    let cancelled = false;
    let completed = false;
    let frame = 0;
    let edgeFrame = 0;
    const article = paper.current!;
    const finish = () => {
      if (cancelled || completed) return;
      completed = true;
      animations.forEach(animation => animation.cancel());
      article.style.visibility = 'visible';
      onUnfold();
      onComplete();
    };
    finishRef.current = finish;
    function play(element: HTMLElement, frames: Keyframe[], duration: number, easing = 'cubic-bezier(.3,.45,.3,1)') {
      const animation = element.animate(frames, { duration, easing, fill: 'forwards' });
      animations.add(animation);
      return animation;
    }
    const run = async () => {
      await document.fonts.ready;
      if (cancelled || completed) return;
      if (motion.current) {
        onUnfold();
        article.style.visibility = 'visible';
        await play(article, [{ opacity: 0 }, { opacity: 1 }], 250).finished;
        finish();
        return;
      }
      const rect = article.getBoundingClientRect();
      const birdWidth = bird.current!.offsetWidth;
      const flyTop = Math.max(30, Math.min(window.innerHeight * .085, 80));
      const centerX = window.innerWidth / 2;
      const birdLeft = centerX - birdWidth / 2;
      await play(bird.current!, [
        { transform: `translate(${-birdWidth - 30}px,${flyTop + 8}px) rotate(-4deg)` },
        { offset: .5, transform: `translate(${birdLeft * .35}px,${flyTop - 6}px) rotate(1deg)` },
        { transform: `translate(${birdLeft}px,${flyTop}px) rotate(0deg)` },
      ], config.delivery.flyIn).finished;
      if (cancelled || completed) return;
      // The free scroll starts at the actual scroll held by the claws.
      const release = carried.current!.getBoundingClientRect();
      bird.current!.classList.add('is-released');
      const exit = play(bird.current!, [
        { transform: `translate(${birdLeft}px,${flyTop}px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${window.innerWidth + birdWidth}px,${flyTop - 45}px) rotate(-5deg)`, opacity: 0 },
      ], config.delivery.flyOut, 'cubic-bezier(.4,0,.65,1)');
      void exit.finished.catch(() => {});

      const packet = dropped.current!;
      packet.style.visibility = 'visible';
      const dropTop = rect.top + Math.min(75, Math.max(25, (window.innerHeight - rect.top) * .18));
      const packetX = centerX - 44;
      await play(packet, [
        { transform: `translate(${release.left}px,${release.top}px) scale(${release.width / 88}) rotate(-6deg)` },
        { offset: .55, transform: `translate(${packetX + 7}px,${release.top + (dropTop - release.top) * .52}px) scale(.83) rotate(5deg)` },
        { transform: `translate(${packetX}px,${dropTop}px) scale(1) rotate(0deg)` },
      ], config.delivery.drop, 'cubic-bezier(.35,.1,.35,1)').finished;
      if (cancelled || completed) return;

      // First untie and widen the cylinder. The sheet stays hidden until this ends.
      const ribbon = packet.querySelector<HTMLElement>('.roll-ribbon')!;
      play(ribbon, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(10px)' }], 650);
      await play(packet, [
        { width: '88px', transform: `translate(${packetX}px,${dropTop}px) scale(1)` },
        { width: `${rect.width}px`, transform: `translate(${rect.left}px,${rect.top - 8}px) scale(1)` },
      ], config.delivery.spread).finished;
      if (cancelled || completed) return;
      onUnfold();
      article.style.visibility = 'visible';
      const initialHeight = 26;
      const visibleHeight = Math.min(rect.height, Math.max(240, window.innerHeight - rect.top + 70));
      const crop = (height: number) => `inset(0px 0px ${Math.max(0, rect.height - height)}px 0px round 5px)`;
      // Real unrolling: fixed width and scale, revealing paper only behind the rolling edge.
      const paperAnimation = play(article, [
        { offset: 0, transform: 'none', clipPath: crop(initialHeight) },
        { offset: .2, transform: 'none', clipPath: crop(initialHeight + (visibleHeight - initialHeight) * .12) },
        { offset: .5, transform: 'none', clipPath: crop(initialHeight + (visibleHeight - initialHeight) * .45) },
        { offset: .8, transform: 'none', clipPath: crop(initialHeight + (visibleHeight - initialHeight) * .82) },
        { offset: 1, transform: 'none', clipPath: crop(visibleHeight) },
      ], config.delivery.unfold, 'linear');
      play(packet, [{ opacity: 1 }, { opacity: 0 }], 1200);
      roller.current!.style.visibility = 'visible';
      const followEdge = () => {
        if (cancelled || completed) return;
        const box = article.getBoundingClientRect();
        const style = getComputedStyle(article);
        const insets = style.clipPath.split('round')[0].match(/[\d.]+px/g)?.map(Number.parseFloat) ?? [0];
        const bottomInset = insets.length >= 3 ? insets[2] : insets[0];
        const scaleY = box.height / article.offsetHeight;
        const bottom = box.bottom - bottomInset * scaleY;
        roller.current!.style.width = `${box.width}px`;
        roller.current!.style.transform = `translate(${box.left}px,${bottom - 12}px)`;
        edgeFrame = requestAnimationFrame(followEdge);
      };
      followEdge();
      await paperAnimation.finished;
      finish();
    };
    frame = requestAnimationFrame(() => { void run().catch(() => { if (!cancelled) finish(); }); });
    // Never keep a stale landing target after scrolling or rotating the phone.
    window.addEventListener('resize', finish, { passive: true });
    window.addEventListener('scroll', finish, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(edgeFrame);
      window.removeEventListener('resize', finish);
      window.removeEventListener('scroll', finish);
      animations.forEach(animation => animation.cancel());
      finishRef.current = () => {};
    };
  }, [paper, onUnfold, onComplete]);

  return <>
    <span className="sr-only" role="status">Một chú bồ câu đang mang lời thương đến em.</span>
    <div className="letter-delivery-layer" aria-hidden="true" style={{ '--wingbeat': `${config.delivery.wingbeat}ms` } as CSSProperties}>
      <div ref={bird} className="dove-flight">
        <Dove />
        <div ref={carried} className="carried-scroll scroll-packet"><RolledLetter /></div>
      </div>
      <div ref={dropped} className="dropped-scroll scroll-packet"><RolledLetter /></div>
      <div ref={roller} className="unroll-roller" />
    </div>
  </>;
}
