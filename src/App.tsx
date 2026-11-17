import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from './config';
import { assetUrl, fetchText, loadPhotos, pause, shuffle } from './media';
import { PhotoStage } from './PhotoStage';
import { Letter } from './Letter';
import { Atmosphere } from './Atmosphere';
import { BackgroundMusic, type MusicHandle } from './BackgroundMusic';

type Phase = 'gift' | 'opening' | 'loading' | 'flying' | 'heart' | 'fading' | 'letter';
type Manifest = { demo: boolean; photos: string[] };
export function App() {
  const [phase, setPhase] = useState<Phase>('gift');
  const [photos, setPhotos] = useState<string[]>([]);
  const [letter, setLetter] = useState('');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [run, setRun] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const main = useRef<HTMLElement>(null);
  const music = useRef<MusicHandle>(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => { media.removeEventListener('change', update); controller.current?.abort(); };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(config.colors)) root.style.setProperty(`--${name}`, value);
    root.style.setProperty('--fade-duration', `${reduced ? 250 : config.timing.fade}ms`);
    root.style.setProperty('--lid-duration', `${reduced ? 250 : config.timing.lid}ms`);
  }, [reduced]);
  const start = async () => {
    if (busy.current) return;
    busy.current = true;
    music.current?.start();
    controller.current?.abort();
    const control = new AbortController();
    controller.current = control;
    setError(''); setNotice(''); setProgress(0);
    setPhase('opening');
    const data = Promise.all([fetchText('photos-manifest.json', control.signal), fetchText('letter.txt', control.signal)]);
    // Attach rejection immediately while the gift lid is opening.
    const resources = data.then(value => ({ value, error: null }), error => ({ value: null, error }));
    try {
      await pause(reduced ? 250 : config.timing.lid, control.signal);
      setPhase('loading');
      const result = await resources;
      if (result.error || !result.value) throw new Error('resources');
      if (control.signal.aborted) return;
      const manifest = JSON.parse(result.value[0]) as Manifest;
      if (!Array.isArray(manifest.photos) || !manifest.photos.every(url => typeof url === 'string' && /^(photos|demo)\//.test(url))) throw new Error('manifest');
      setLetter(result.value[1]);
      const shuffled = shuffle(manifest.photos);
      setTotal(shuffled.length);
      const valid = await loadPhotos(shuffled, control.signal, setProgress);
      if (control.signal.aborted) return;
      if (!valid.length) {
        setNotice('Ảnh chưa mở được, nhưng lời thương vẫn ở đây dành cho em.');
        setPhotos(['favicon.svg']);
      } else {
        setPhotos(valid);
        if (valid.length < shuffled.length) setNotice('Một vài ảnh chưa mở được. Mình cùng giữ lại những khoảnh khắc còn lại nhé.');
      }
      setPhase('flying');
    } catch {
      if (control.signal.aborted) return;
      setError('Món quà chưa tải được. Em chạm vào hộp quà để thử lại nhé.');
      setPhase('gift'); busy.current = false;
    }
  };
  const onComplete = useCallback(() => setPhase(current => current === 'flying' ? 'heart' : current), []);
  const openLetter = () => setPhase(current => current === 'heart' ? 'fading' : current);
  useEffect(() => {
    if (phase !== 'fading') return;
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setPhase('letter');
      main.current?.focus({ preventScroll: true });
    }, reduced ? 250 : config.timing.fade);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  const replay = () => {
    controller.current?.abort();
    busy.current = false;
    setPhotos([]); setNotice(''); setError(''); setPhase('gift'); setRun(previous => previous + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.gift-button')?.focus({ preventScroll: true }));
  };
  const showGift = ['gift', 'opening', 'loading'].includes(phase);
  return <div className={`app phase-${phase}`}>
    <Atmosphere />
    <header className="site-header"><a href={assetUrl('')} onClick={event => event.preventDefault()} aria-label="Một món quà dành riêng cho em"><span className="brand-heart">♡</span><span>thương em</span><span className="brand-dot">.</span></a><span className="header-note">một chút yêu thương, dành riêng cho em</span><BackgroundMusic ref={music}/></header>
    <main ref={main} tabIndex={-1}>
      {showGift && <section className={`gift-scene ${phase === 'opening' || phase === 'loading' ? 'is-opening' : ''}`}>
        <div className="occasion"><span /> MỘT NGÀY THẬT ĐẶC BIỆT <span /></div>
        <h1>Hôm nay là<br className="mobile-break" /> ngày của <em>em</em> <span className="heading-heart">♡</span></h1>
        <p className="gift-subtitle">Anh có một món quà nhỏ dành cho em</p>
        <div className="gift-area">
          <span className="gift-spark spark-left" aria-hidden="true">✧</span><span className="gift-spark spark-right" aria-hidden="true">✧</span><span className="gift-mini-heart" aria-hidden="true">♡</span>
          <span className="for-you" aria-hidden="true">cho em, với tất cả yêu thương<svg viewBox="0 0 60 50"><path d="M5 5Q5 35 48 37m-10-9 12 9-13 5" /></svg></span>
          <button className="gift-button" onClick={() => void start()} disabled={phase !== 'gift'} aria-label="Chạm để mở quà">
            <span className="gift-object" aria-hidden="true"><span className="gift-shadow"/><span className="gift-body"><span className="gift-ribbon"/><span className="gift-tag">gửi vợ yêu <b>♡</b></span></span><span className="gift-lid"><span className="bow bow-left"/><span className="bow bow-right"/><span className="bow-knot"/><span className="lid-ribbon"/></span></span>
          </button>
        </div>
        <div className="gift-prompt" aria-live="polite">{phase === 'loading' ? <><span className="loading-dot"/> Đang gói ghém kỷ niệm{total > 0 ? ` · ${progress}/${total}` : '…'}</> : phase === 'opening' ? 'Một chút bất ngờ đang mở ra…' : <><svg width="19" height="24" viewBox="0 0 24 28" aria-hidden="true"><path d="M8 16V5a3 3 0 0 1 6 0v8c7-4 9 0 8 6l-1 5H10L3 16c-2-3 1-5 3-2l2 2Z" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg> Chạm nhẹ để mở quà</>}</div>
        {error && <p className="error-note" role="alert">{error}</p>}
        <div className="gift-bottom"><span /> một món quà nhỏ, thật nhiều thương yêu <span /></div>
      </section>}
      {['flying', 'heart', 'fading'].includes(phase) && <PhotoStage key={run} photos={photos} phase={phase as 'flying' | 'heart' | 'fading'} reduced={reduced} onComplete={onComplete} onOpen={openLetter} />}
      {notice && phase !== 'letter' && <p className="asset-notice" role="status">{notice}</p>}
      {phase === 'letter' && <Letter key={run} text={letter} reduced={reduced} onReplay={replay}/>}
    </main>
    {phase !== 'letter' && <footer className="site-footer"><span>Được gói bằng yêu thương</span><span className="footer-heart">♡</span><span>Và dành riêng cho em</span></footer>}
  </div>;
}
