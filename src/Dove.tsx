/** Flat, outlined cartoon dove. The wing groups animate independently. */
export function Dove() {
  return <svg className="delivery-dove cartoon-dove" viewBox="0 0 180 145" fill="none" stroke="#806f70" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M52 84 19 80 30 94 17 104 55 110 78 93" fill="#e8eef1" />
    <path className="dove-wing dove-far-wing" d="M86 81C72 62 80 31 103 17C105 37 120 50 116 75L103 91Z" fill="#dce9ee" />
    <path d="M43 88C51 69 77 66 98 72C108 75 106 55 123 51C141 46 154 59 150 75C147 88 134 88 125 96C109 115 68 119 48 103C43 99 40 94 43 88Z" fill="#fffdf4" />
    <path d="m150 65 14 8-15 4" fill="#f2bc74" />
    <ellipse cx="138" cy="63" rx="3.4" ry="4.4" fill="#695d65" stroke="none" />
    <circle cx="139" cy="61.5" r="1.2" fill="#fff" stroke="none" />
    <ellipse cx="135" cy="78" rx="6.3" ry="3.2" fill="#efb6c0" stroke="none" />
    <g className="dove-wing dove-near-wing">
      <path d="M88 94C65 94 35 72 29 46C40 48 47 55 52 57L46 29C57 34 65 44 70 49L70 25C84 34 105 59 106 77C108 90 99 97 88 94Z" fill="#fffef7" />
      <path d="M49 62Q62 80 83 85M66 57Q73 72 91 81" stroke="#b7c7cc" strokeWidth="2.2" />
    </g>
    <path d="m87 111 1 10q-7 0-5 5m5-5q2 7 6 3m7-15-2 12q-6 0-5 4m5-4q4 6 7 1" stroke="#cd956e" strokeWidth="2.8" />
  </svg>;
}
