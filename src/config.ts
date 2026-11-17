export const config = {
  colors: {
    background: '#faf6ef', paper: '#fffcf6', pink: '#bf6b80', ink: '#503c3e', muted: '#8b7473',
    'mist-rose': '#efd3df', 'mist-peach': '#f0d9bf', 'mist-sage': '#dce2cc',
  },
  timing: {
    lid: 1300, flightMin: 4200, flightMax: 5000, staggerMin: 600, staggerMax: 900,
    fade: 1500, letterFlight: 2200, letterGroupDelay: 180, letterCharacterDelay: 38, imageTimeout: 8000,
  },
  loadingConcurrency: 4,
  mobileFlightConcurrency: 4,
  desktopFlightConcurrency: 6,
  letterParticleLimit: 160,
  music: { source: 'music/NgayDauTien.mp3', volume: 0.28 },
  atmosphere: { drift: 34000, petalFall: 29000, sparkle: 12000 },
  delivery: { flyIn: 3200, flyOut: 2400, drop: 1400, spread: 1400, unfold: 6200, wingbeat: 1100 },
  birthday: { birthYear: '2005', float: 8000, confettiFall: 26000 },
  heartStyle: {
    tileTilt: 4, entryWidth: 145,
    breathe: 4800, floating: 6200, detailReveal: 1200,
    glow: '#edbac5', outline: '#d194a2',
  },
};
