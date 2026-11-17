import { config } from './config';

export function BirthdayCake() {
  return <svg className="birthday-illustration cake-art" viewBox="0 0 160 180" fill="none" stroke="#a78074" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="80" cy="161" rx="67" ry="9" fill="#f7e7da" />
    <path d="M27 101Q80 85 133 101V151Q81 169 27 151Z" fill="#edb7c2" />
    <path d="M27 126Q80 141 133 126" stroke="#fff4dc" strokeWidth="7" />
    <path d="M27 101Q80 84 133 101V117Q125 125 119 116Q113 110 108 121Q102 132 96 121Q90 110 83 121Q76 133 69 121Q63 109 56 119Q48 131 43 119Q35 125 27 117Z" fill="#fff7e5" />
    <ellipse cx="80" cy="98" rx="53" ry="13" fill="#fff8e8" />
    <path d="M47 94V66h9v28m20-5V56h9v33m19 5V66h9v28" fill="#bad1c3" />
    <path d="m49 74 5 4m-5 5 5 4m24-22 5 4m-5 5 5 4m23-4 5 4m-5 5 5 4" stroke="#fff8ed" strokeWidth="3" />
    <g className="cake-flame" stroke="#d5a266" strokeWidth="1.5"><path d="M51 61C36 54 51 41 52 36C53 45 64 54 51 61Z" fill="#f2cc82" /><path d="M80 51C66 44 80 30 81 24C82 34 94 44 80 51Z" fill="#f2cc82" /><path d="M109 61C96 54 109 41 110 36C111 46 122 54 109 61Z" fill="#f2cc82" /></g>
    <path d="M44 146h5m62 0h5" stroke="#e18eaa" strokeWidth="4" />
    <circle cx="66" cy="146" r="2.5" fill="#8a6d64" stroke="none" /><circle cx="94" cy="146" r="2.5" fill="#8a6d64" stroke="none" />
    <path d="M76 148q4 5 8 0" strokeWidth="2" />
    <path d="M37 104 42 106m18-9 3 3m27-4 2 3m21 3 4-1" stroke="#d89baf" strokeWidth="2" />
  </svg>;
}

export function BirthdayChick() {
  return <svg className="birthday-illustration chick-art" viewBox="0 0 145 180" fill="none" stroke="#a58560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M104 96C122 76 137 88 124 103C142 100 140 117 116 117" fill="#e9be80" />
    <path d="m54 132-3 10m-5 0h12m25-10 3 10m-6 0h13" stroke="#d5a064" strokeWidth="3" />
    <path d="M32 99C30 77 38 50 64 48C94 44 112 73 109 104C108 127 92 138 68 137C42 137 28 124 32 99Z" fill="#f6dda2" />
    <path className="chick-wing" d="M37 96C17 90 17 114 38 117M101 95C120 91 121 113 102 117" fill="#efcb86" />
    <path d="M43 53C33 43 40 35 48 42C45 27 59 25 62 43" fill="#e9a1a8" stroke="#b8847d" />
    <path d="m52 49 12-34 27 37Z" fill="#dca7bc" stroke="#b6859e" />
    <path d="m59 35 20 4m-24 5 30 4" stroke="#f8e5db" strokeWidth="4" />
    <circle cx="64" cy="14" r="6" fill="#f6d9a2" />
    <ellipse cx="67" cy="107" rx="24" ry="22" fill="#fff0c7" stroke="none" />
    <ellipse cx="52" cy="79" rx="3" ry="4" fill="#735b54" stroke="none" /><ellipse cx="81" cy="79" rx="3" ry="4" fill="#735b54" stroke="none" />
    <circle cx="53" cy="77.5" r="1" fill="#fff" stroke="none" /><circle cx="82" cy="77.5" r="1" fill="#fff" stroke="none" />
    <ellipse cx="43" cy="88" rx="7" ry="4" fill="#edb2af" stroke="none" /><ellipse cx="91" cy="88" rx="7" ry="4" fill="#edb2af" stroke="none" />
    <path d="m60 88 7-4 7 4-7 7Z" fill="#e4aa68" stroke="#ca945b" strokeWidth="1.7" />
    <path d="m25 152 8-9 70 2 10 10-9 8-71-1Z" fill="#f4e1dc" stroke="#c59a95" strokeWidth="1.6" />
    <text x="68" y="158" textAnchor="middle" fill="#a77c7f" stroke="none" fontFamily="Lora,Georgia,serif" fontSize="13">{config.birthday.birthYear} ♡</text>
  </svg>;
}

export function BirthdayBalloons() {
  return <svg className="birthday-illustration balloon-art" viewBox="0 0 115 180" fill="none" stroke="#b69c8d" strokeWidth="1.8" strokeLinecap="round">
    <path d="M31 77C18 112 77 127 61 171M83 85C106 119 48 131 61 171M55 63C74 109 46 133 61 171" />
    <path d="m26 79 9 1-4-8m48 13 9-1-6-7m-32-15 10 1-4-8" fill="#dac3b2" />
    <ellipse cx="30" cy="48" rx="24" ry="31" fill="#e6b4c4" stroke="#c498aa" />
    <ellipse cx="83" cy="54" rx="24" ry="31" fill="#c6d7bd" stroke="#a6b99e" />
    <ellipse cx="56" cy="31" rx="24" ry="30" fill="#f2dbac" stroke="#d1b88b" />
    <path d="M43 17q-6 6-5 13M18 34q-6 6-4 13m57-9q-6 7-4 13" stroke="#fff8ed" strokeWidth="4" />
    <path d="m52 171 10-4 8 5m-10-4-3 10" stroke="#c79ca5" strokeWidth="2.4" />
  </svg>;
}

export function BirthdayBunting() {
  const colors = ['#e7bac6', '#d8dcb9', '#eed4a8', '#c7d8d3'];
  return <svg viewBox="0 0 480 80" fill="none" className="birthday-illustration bunting-art">
    <path d="M0 8Q240 76 480 8" stroke="#c5a58e" strokeWidth="1.8" />
    {Array.from({ length: 10 }, (_, i) => {
      const x = 25 + i * 48;
      const y = 8 + 34 * (1 - ((x - 240) / 240) ** 2);
      return <path key={i} d={`M${x - 13} ${y - 3}l26 1-13 24Z`} fill={colors[i % colors.length]} stroke="#c6a799" strokeWidth="1" />;
    })}
  </svg>;
}
