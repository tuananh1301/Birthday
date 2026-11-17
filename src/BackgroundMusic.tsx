import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { config } from './config';
import { assetUrl } from './media';

export type MusicHandle = { start: () => void };
type Status = 'off' | 'loading' | 'playing' | 'error';

export const BackgroundMusic = forwardRef<MusicHandle>(function BackgroundMusic(_, ref) {
  const audio = useRef<HTMLAudioElement>(null);
  const playback = useRef({ chosen: false, wanted: false, request: 0 });
  const [status, setStatus] = useState<Status>('off');
  const [message, setMessage] = useState('');

  const fail = useCallback((blocked = false) => {
    playback.current.wanted = false;
    playback.current.request++;
    audio.current?.pause();
    setStatus('error');
    setMessage(blocked ? 'Chạm nốt nhạc để bật nhạc nhé.' : 'Nhạc chưa tải được. Chạm nốt nhạc để thử lại nhé.');
  }, []);

  const play = useCallback(() => {
    const element = audio.current;
    if (!element) return;
    playback.current.wanted = true;
    const id = ++playback.current.request;
    setMessage('');
    setStatus('loading');
    element.volume = config.music.volume;
    if (element.error) element.load();
    // Call synchronously inside the user's gesture, before any fetch/await.
    void element.play().then(() => {
      if (!playback.current.wanted) element.pause();
    }).catch((error: unknown) => {
      if (id !== playback.current.request || !playback.current.wanted) return;
      fail(error instanceof DOMException && error.name === 'NotAllowedError');
    });
  }, [fail]);

  useImperativeHandle(ref, () => ({ start: () => {
    // Replaying the gift must preserve a deliberate choice to turn music off.
    if (playback.current.chosen) return;
    playback.current.chosen = true;
    play();
  } }), [play]);

  useEffect(() => {
    const element = audio.current;
    const state = playback.current;
    return () => {
      state.request++;
      state.wanted = false;
      element?.pause();
    };
  }, []);

  const toggle = () => {
    playback.current.chosen = true;
    if (!playback.current.wanted) { play(); return; }
    playback.current.wanted = false;
    playback.current.request++;
    audio.current?.pause();
    setStatus('off');
    setMessage('');
  };
  const enabled = status === 'playing' || status === 'loading';
  const label = enabled ? 'Tắt nhạc nền' : 'Bật nhạc nền';
  const source = assetUrl(config.music.source.split('/').map(encodeURIComponent).join('/'));

  return <div className={`music-control music-${status}`}>
    <audio ref={audio} src={source} preload="none" loop aria-hidden="true"
      onPlaying={() => {
        if (playback.current.wanted) setStatus('playing');
        else audio.current?.pause();
      }}
      onPause={() => {
        if (!audio.current?.paused) return;
        playback.current.wanted = false;
        playback.current.request++;
        setStatus(current => current === 'error' ? current : 'off');
      }}
      onError={() => { if (playback.current.wanted) fail(); }}
    />
    <button className="music-toggle" type="button" onClick={toggle} aria-label={label} aria-pressed={enabled} title={label}>
      <span className="music-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17V6l10-2v11M10 9l10-2"/><ellipse cx="7" cy="17.5" rx="3" ry="2.5"/><ellipse cx="17" cy="15.5" rx="3" ry="2.5"/>
          {!enabled && <path className="music-slash" d="m3 3 18 18"/>}
        </svg>
        <span className="music-indicator"/>
      </span>
      <span>Nhạc nền</span>
    </button>
    <span className="music-status" role="status" aria-live="polite">{message}</span>
  </div>;
});
