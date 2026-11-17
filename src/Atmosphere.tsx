import type { CSSProperties } from 'react';
import { config } from './config';
import { BirthdayBalloons, BirthdayBunting, BirthdayCake, BirthdayChick } from './BirthdayArt';

export function Atmosphere() {
  const style = {
    '--mist-drift': `${config.atmosphere.drift}ms`,
    '--petal-fall': `${config.atmosphere.petalFall}ms`,
    '--mote-glow': `${config.atmosphere.sparkle}ms`,
    '--birthday-float': `${config.birthday.float}ms`,
    '--confetti-fall': `${config.birthday.confettiFall}ms`,
  } as CSSProperties;
  return <div className="ambient" style={style} aria-hidden="true">
    <div className="color-wash wash-rose" />
    <div className="color-wash wash-peach" />
    <div className="color-wash wash-sage" />
    <div className="birthday-bunting"><BirthdayBunting /></div>
    <div className="birthday-cake"><BirthdayCake /></div>
    <div className="birthday-chick"><BirthdayChick /></div>
    <div className="birthday-balloons"><BirthdayBalloons /></div>
    {[3, 12, 23, 78, 89, 98].map((left, i) => <i key={left} className={`birthday-confetti confetti-color-${i % 3}`} style={{ left: `${left}%`, animationDelay: `${-i * 4.3}s` }} />)}
    <span className="ambient-heart one">♡</span>
    <span className="ambient-star two">✧</span>
    <span className="ambient-star three">✧</span>
    <span className="ambient-heart four">♡</span>
    {[5, 16, 34, 69, 84, 96].map((left, i) => <span className="drifting-petal" key={left} style={{
      left: `${left}%`, '--petal-delay': `${-i * 5.7}s`, '--petal-duration': `${1 + (i % 3) * .18}`,
      '--petal-rest': `${18 + i * 12}%`,
    } as CSSProperties} />)}
    {[9, 27, 76, 92].map((left, i) => <span className="light-mote" key={left} style={{
      left: `${left}%`, top: `${22 + i * 19}%`, animationDelay: `${-i * 3.1}s`,
    }} />)}
  </div>;
}
