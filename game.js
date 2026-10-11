'use strict';
// Victoria's Quest: one canvas, one loop, plain JS.
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const W = 640, H = 480, T = 32;

// ---------- input ----------
const held = new Set(), hit = new Set();
let click = null;
const keyOf = e => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
addEventListener('keydown', e => {
  const k = keyOf(e);
  if (!held.has(k)) hit.add(k);
  held.add(k);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});
addEventListener('keyup', e => held.delete(keyOf(e)));
cv.addEventListener('pointerdown', e => {
  click = { x: e.offsetX * W / cv.clientWidth, y: e.offsetY * H / cv.clientHeight };
});
for (const b of document.querySelectorAll('#pad button')) {
  const k = b.dataset.key;
  b.addEventListener('pointerdown', e => { e.preventDefault(); held.add(k); hit.add(k); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => held.delete(k));
}
const ok = () => hit.has(' ') || hit.has('Enter') || hit.has('e');
const okOrTap = () => ok() || !!click;
const up = () => hit.has('ArrowUp') || hit.has('w');
const down = () => hit.has('ArrowDown') || hit.has('s');
const inRect = (p, r) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

// ---------- helpers ----------
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const L = (w, t) => ({ w, t });
const N = t => ({ w: '', t });
const FONT = s => `bold ${s}px "Trebuchet MS", Verdana, sans-serif`;
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function circ(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function ell(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function text(s, x, y, size, c, align = 'left') {
  ctx.font = FONT(size); ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
function outlined(s, x, y, size, c, align = 'center') {
  ctx.font = FONT(size); ctx.textAlign = align; ctx.lineWidth = 5; ctx.strokeStyle = '#1a0f26';
  ctx.strokeText(s, x, y); ctx.fillStyle = c; ctx.fillText(s, x, y);
}
function wrap(s, maxW, size) {
  ctx.font = FONT(size);
  const out = []; let cur = '';
  for (const word of s.split(' ')) {
    const t = cur ? cur + ' ' + word : word;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = word; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}
function panel(x, y, w, h, bd = '#f6d365') {
  ctx.fillStyle = 'rgba(22,14,34,0.93)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = bd; ctx.lineWidth = 3; ctx.stroke();
}
function bar(x, y, w, h, f, c) {
  rect(x, y, w, h, '#000a'); rect(x, y, Math.max(0, Math.min(1, f)) * w, h, c);
  ctx.strokeStyle = '#fff8'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
}
const annoyColor = a => (a > 60 ? '#ff4d6d' : a > 25 ? '#ffb703' : '#06d6a0');

// ---------- sprites (drawn in code, feet at x,y) ----------
const SKIN = '#f1c27d';
const LOOKS = {
  victoria: { hair: '#7a3b1e', top: '#9b5de5', legs: '#3a3a5a', style: 'long' },
  lina: { hair: '#1b1b1b', top: '#3d4451', legs: '#222', style: 'short', phones: true },
  grace: { hair: '#f2c14e', top: '#ff70a6', legs: '#5a3a5a', style: 'bun', camera: true },
};
function person(k, x, y, s, face = 1, b = 0, cool = false) {
  const o = LOOKS[k];
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  ell(0, 0, 9, 3, 'rgba(0,0,0,0.25)');
  rect(-5, -9, 4, 9, o.legs); rect(1, -9, 4, 9, o.legs);
  if (o.style === 'long') rect(-8, -30 + b, 16, 19, o.hair);
  rect(-7, -21 + b, 14, 13, cool ? '#1d1d1d' : o.top);
  if (cool) { rect(-2, -21 + b, 4, 13, o.top); }
  rect(-9, -20 + b, 3, 10, SKIN); rect(6, -20 + b, 3, 10, SKIN);
  circ(0, -27 + b, 7, SKIN);
  ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(0, -28 + b, 7.5, Math.PI, 0); ctx.fill();
  if (o.style === 'bun') circ(0, -36 + b, 4, o.hair);
  if (o.style === 'short') rect(-7.5, -29 + b, 3, 7, o.hair);
  if (cool) { rect(-6, -29 + b, 12, 3, '#111'); rect(-6, -28 + b, 5, 3, '#111'); rect(1, -28 + b, 5, 3, '#111'); }
  else { rect(-3, -28 + b, 2, 2, '#222'); rect(2, -28 + b, 2, 2, '#222'); }
  rect(-2, -23 + b, 4, 1, '#a33');
  if (o.phones) {
    ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -28 + b, 8.5, Math.PI, 0); ctx.stroke();
    rect(-10, -30 + b, 3, 6, '#e63946'); rect(7, -30 + b, 3, 6, '#e63946');
  }
  if (o.camera) { rect(7, -18 + b, 7, 5, '#333'); circ(11, -15.5 + b, 1.5, '#9ef'); }
  ctx.restore();
}
function dog(x, y, s, face = 1, b = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  ell(0, 0, 13, 3, 'rgba(0,0,0,0.25)');
  for (const lx of [-9, -4, 4, 8]) rect(lx, -8, 3, 8, '#8b5a2b');
  ell(0, -11 + b, 12, 6, '#a0672f');
  ctx.strokeStyle = '#a0672f'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(-11, -13 + b); ctx.lineTo(-16, -20 + b + Math.sin(G.t * 0.4) * 3); ctx.stroke();
  circ(11, -18 + b, 6, '#a0672f'); ell(8, -16 + b, 2.5, 5, '#5c3a1a');
  ell(16, -17 + b, 3.5, 2.5, '#c58a4f'); circ(19, -17.5 + b, 1.4, '#111'); circ(12, -20 + b, 1.2, '#111');
  rect(4, -14 + b, 6, 2, '#e63946');
  ctx.restore();
}
function cat(x, y, s, face = 1, b = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  ell(0, 0, 11, 3, 'rgba(0,0,0,0.25)');
  for (const lx of [-7, -3, 3, 6]) rect(lx, -7, 2.5, 7, '#7d7d8a');
  ell(0, -10 + b, 10, 5, '#8d8d99');
  ctx.strokeStyle = '#8d8d99'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(-9, -11 + b); ctx.quadraticCurveTo(-18, -14 + b, -14 + Math.sin(G.t * 0.1) * 2, -24 + b); ctx.stroke();
  circ(9, -16 + b, 5.5, '#8d8d99');
  ctx.fillStyle = '#8d8d99'; ctx.beginPath();
  ctx.moveTo(4.5, -19 + b); ctx.lineTo(5.5, -25 + b); ctx.lineTo(9, -20.5 + b);
  ctx.moveTo(9.5, -20.5 + b); ctx.lineTo(13, -25 + b); ctx.lineTo(14, -18.5 + b); ctx.fill();
  rect(7.5, -17.5 + b, 2, 2, '#7CFC00'); rect(11.5, -17.5 + b, 2, 2, '#7CFC00');
  ctx.restore();
}
function turtle(x, y, s, face = 1, b = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  ell(0, 0, 14, 3, 'rgba(0,0,0,0.25)');
  for (const lx of [-9, 7]) ell(lx, -2, 4, 3, '#8fbf5a');
  ell(15, -7 + b * 0.3, 5, 4, '#8fbf5a'); circ(17, -8 + b * 0.3, 1, '#111');
  ctx.strokeStyle = '#333'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(17, -8 + b * 0.3, 2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#2d6a4f'; ctx.beginPath(); ctx.ellipse(0, -5, 13, 10, 0, Math.PI, 0); ctx.fill();
  for (const [hx, hy] of [[-6, -9], [0, -11], [6, -9], [-3, -5], [4, -5]]) circ(hx, hy, 2.4, '#52b788');
  rect(-13, -6, 26, 2, '#1b4332');
  ctx.restore();
}
function drawChar(k, x, y, s, face, b, cool) {
  if (LOOKS[k]) person(k, x, y, s, face, b, cool);
  else if (k === 'thomas') dog(x, y, s, face, b);
  else if (k === 'jody') cat(x, y, s, face, b);
  else if (k === 'sharon') turtle(x, y, s, face, b);
}
function thing(k, x, y) {
  switch (k) {
    case 'phone': rect(x - 6, y - 14, 12, 18, '#222'); rect(x - 5, y - 13, 10, 13, '#6cf'); circ(x, y + 2, 1, '#555');
      if (G.t % 40 < 20) circ(x + 6, y - 14, 3, '#ff4d6d'); break;
    case 'tramp': rect(x - 18, y - 8, 3, 8, '#222'); rect(x + 15, y - 8, 3, 8, '#222');
      ell(x, y - 9, 22, 8, '#222'); ell(x, y - 10, 18, 6, '#3b3b6b'); break;
    case 'mirror': rect(x - 10, y - 38, 20, 38, '#c9a227'); rect(x - 8, y - 36, 16, 34, '#bfe6ff');
      rect(x - 4, y - 32, 3, 18, '#fff9'); break;
    case 'laptop': rect(x - 14, y - 12, 28, 12, '#7a4b2a'); rect(x - 10, y - 28, 20, 14, '#333');
      rect(x - 8, y - 26, 16, 10, '#9b5de5'); rect(x - 12, y - 14, 24, 2, '#555'); break;
    case 'bench': rect(x - 16, y - 8, 3, 8, '#5c3a1a'); rect(x + 13, y - 8, 3, 8, '#5c3a1a');
      rect(x - 18, y - 12, 36, 5, '#8b5a2b'); rect(x - 18, y - 20, 36, 4, '#8b5a2b'); break;
    case 'rock': ell(x, y - 4, 9, 5, '#8d8d8d'); ell(x - 2, y - 6, 4, 2, '#bbb'); break;
  }
}

// ---------- game state ----------
const G = { mode: 'title', lv: 0, annoy: 100, hp: 100, maxHp: 100, items: [], flags: {}, x: 0, y: 0, face: 1, step: 0, t: 0 };
let dlg = null, B = null;
const pops = [];
function annoy(n) {
  G.annoy = Math.max(0, Math.min(100, G.annoy + n));
  pops.push({ t: (n > 0 ? '+' : '') + n + '% annoying', c: n > 0 ? '#ff6b6b' : '#7CFC9a', life: 80 });
}
function give(item) {
  return { fx: () => G.items.push(item) , t: `Got: ${item.n}! (heals ${item.heal} confidence in a fight)`, w: '' };
}

// ---------- dialog ----------
const COLORS = { Victoria: '#c77dff', Lina: '#ced4da', Grace: '#ff70a6', Thomas: '#e0a96d', Jody: '#b8c0ff', Sharon: '#80ed99', '': '#f6d365' };
const PORTRAIT = { Victoria: 'victoria', Lina: 'lina', Grace: 'grace', Thomas: 'thomas', Jody: 'jody', Sharon: 'sharon' };
function say(lines, then) {
  dlg = { lines: lines.slice(), i: 0, chars: 0, sel: 0, then };
  G.mode = 'dialog';
}
function endDialog() {
  const th = dlg.then; dlg = null;
  if (G.mode === 'dialog') G.mode = 'explore';
  if (th) th();
}
const choiceRect = (i, n) => ({ x: 70, y: H - 150 - (n - i) * 38, w: 500, h: 32 });
function updDialog() {
  const d = dlg, ln = d.lines[d.i];
  if (!ln) return endDialog();
  if (ln.fx && !ln.done) { ln.done = true; ln.fx(); }
  const speed = ln.w === 'Sharon' ? 0.3 : 1.5;
  d.chars = Math.min(ln.t.length, d.chars + speed);
  const full = d.chars >= ln.t.length;
  if (ln.c && full) {
    const n = ln.c.length;
    if (up()) d.sel = (d.sel + n - 1) % n;
    if (down()) d.sel = (d.sel + 1) % n;
    let chosen = ok() ? d.sel : -1;
    for (let i = 0; i < n; i++) if (inRect(click, choiceRect(i, n))) chosen = i;
    if (chosen >= 0) {
      const c = ln.c[chosen];
      if (c.a) annoy(c.a);
      d.lines.splice(d.i + 1, 0, ...(c.r || []));
      d.i++; d.chars = 0; d.sel = 0;
    }
  } else if (okOrTap()) {
    if (!full) d.chars = ln.t.length; else { d.i++; d.chars = 0; }
  }
}
function drawDialog() {
  if (!dlg) return;
  const ln = dlg.lines[dlg.i];
  if (!ln) return;
  const bx = 16, by = H - 128, bw = W - 32, bh = 116;
  panel(bx, by, bw, bh, COLORS[ln.w] || '#f6d365');
  let tx = bx + 18;
  if (PORTRAIT[ln.w]) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(bx + 10, by + 10, 84, 96, 8); ctx.fillStyle = '#ffffff14'; ctx.fill(); ctx.clip();
    const k = PORTRAIT[ln.w];
    const tur = k === 'sharon';
    drawChar(k, bx + (tur ? 40 : 52), by + (LOOKS[k] ? 150 : tur ? 88 : 110), LOOKS[k] ? 3.2 : tur ? 2.4 : 2.6, 1, 0, k === 'victoria' && isCool());
    ctx.restore();
    tx = bx + 106;
  }
  if (ln.w) text(ln.w, tx, by + 26, 16, COLORS[ln.w]);
  const shown = ln.t.slice(0, Math.floor(dlg.chars));
  wrap(shown, bw - (tx - bx) - 18, 16).forEach((s, i) => text(s, tx, by + (ln.w ? 50 : 32) + i * 21, 16, '#fff'));
  if (ln.c && dlg.chars >= ln.t.length) {
    ln.c.forEach((c, i) => {
      const r = choiceRect(i, ln.c.length), on = i === dlg.sel;
      panel(r.x, r.y, r.w, r.h, on ? '#f6d365' : '#6c5a8a');
      text((on ? '▶ ' : '   ') + c.t, r.x + 12, r.y + 22, 15, on ? '#f6d365' : '#ddd');
    });
  } else if (dlg.chars >= ln.t.length && G.t % 50 < 30) text('▼', bx + bw - 26, by + bh - 12, 14, '#f6d365');
}

// ---------- levels ----------
function choiceThing(id, intro, opts, after) {
  return () => {
    if (G.flags[id]) return say([N(after)]);
    G.flags[id] = 1;
    say([{ ...N(intro), c: opts }]);
  };
}
function bossTalk(lv) {
  return () => {
    if (G.flags['clear' + lv]) return say(LEVELS[lv].after);
    say(LEVELS[lv].boss.pre, () => startBattle(LEVELS[lv].boss));
  };
}

const LEVELS = [
  {
    name: 'Level 1: The Backyard',
    sub: "Victoria's annoying meter is maxed out. Her sisters have had it.",
    lesson: 'Listen first. Talk second.',
    pal: { g1: '#6dbb52', g2: '#64b04a', wall: '#2f6b2a', wall2: '#3d8a36', path: '#d9c38c', water: '#3b82c4' },
    start: [2, 2],
    map: [
      '####################',
      '#.....*......#.....#',
      '#............#.....#',
      '#..~~~.......#.....#',
      '#..~~~.......#..X..#',
      '#............G..X..#',
      '#....*.......G..X..#',
      '#............#..X..#',
      '#...,,,,,,,,,#.....#',
      '#...,..*.....#.....#',
      '#...,........#.....#',
      '#...,....*...#.....#',
      '#...,........#.....#',
      '#............#..*..#',
      '####################',
    ],
    open: [
      N('Saturday. The backyard. Victoria has been awake for two hours and has already annoyed four people and one dog.'),
      L('Victoria', "HELLOOOO? Why is everyone ignoring me? I'm literally RIGHT HERE."),
      N('Move: arrow keys or WASD. Talk / pick: SPACE (or tap). Find Thomas the dog... or go straight for Lina by the gate if you think you can handle her.'),
    ],
    after: [L('Lina', "Gate's open. Go bug Grace. Before I change my mind.")],
    ents: [
      { id: 'thomas', k: 'thomas', n: 'Thomas', x: 6, y: 10, helper: true, talk: () => {
        if (G.flags.thomas) return say([L('Thomas', "I'm busy. There's a smell over here that needs my full attention."),
          L('Thomas', 'Remember: SPACE when the marker hits the green. That\'s how I catch frisbees. Mostly.')]);
        G.flags.thomas = 1;
        say([
          L('Thomas', 'Woof. Victoria. Buddy. Pal. I say this with love: you have been yelling "LOOK AT ME" for forty-five minutes.'),
          L('Victoria', 'Because nobody is LOOKING at me, Thomas.'),
          { ...L('Thomas', "Lina's by the gate. She said if you interrupt her one more time she's gonna lose her damn mind."), c: [
            { t: "Lina's just jealous of my energy.", a: 5, r: [L('Thomas', '...Sure. That is definitely it. *sniffs grass aggressively*')] },
            { t: '...Wait. Do I really interrupt that much?', a: -5, r: [L('Thomas', 'Yeah. Like, a lot. But you asked, which is a start. Good girl. Wait, that\'s MY line.')] },
          ] },
          L('Thomas', 'Here. Take my Slobbery Tennis Ball. It is the most precious thing I own. Use it in a fight when you feel like crap.'),
          give({ n: 'Slobbery Tennis Ball', heal: 40 }),
          L('Thomas', "Pro tip from a dog: in a fight, the cool moves hit harder if you time them. Press SPACE when the marker is in the green. That's how I catch frisbees. Mostly."),
        ]);
      } },
      { id: 'phone', k: 'phone', n: 'your phone', x: 9, y: 3, talk: choiceThing('phone',
        'Your phone, face down in the grass. 14 notifications. You posted 9 stories in the last hour.', [
          { t: "Post a 10th: 'everyone at my house is SO boring 🙄'", a: 5, r: [N('Lina liked it. Sarcastically. You can FEEL it.')] },
          { t: 'Leave it. Touch grass. Literally.', a: -4, r: [N('You touch the grass. It is... actually kind of nice? Weird.')] },
        ], "It's your phone. It will survive five minutes without you.") },
      { id: 'tramp', k: 'tramp', n: 'the trampoline', x: 8, y: 12, talk: choiceThing('tramp',
        'The trampoline. Lina is trying to read about ten metres away.', [
          { t: 'Bounce while screaming the Gummy Bear song', a: 5, r: [L('Lina', '(from across the yard) I WILL END YOU.')] },
          { t: 'Lie on it and just vibe for a sec', a: -3, r: [N('You stare at the clouds. One of them looks like Thomas. Peaceful.')] },
        ], 'A trampoline. It has seen things.') },
      { id: 'lina', k: 'lina', n: 'Lina', x: 11, y: 6, boss: true, talk: bossTalk(0) },
    ],
    boss: {
      title: 'SISTER SHOWDOWN: LINA',
      foes: [{ k: 'lina', n: 'Lina' }], hp: 100, atk: [11, 17], speed: 0.018,
      pre: [
        L('Lina', 'Oh look. It\'s the human air horn.'),
        L('Victoria', 'Lina! Lina. Lina. Guess what. Guess what. Guess wh—'),
        L('Lina', 'No. You know what? We are settling this. Right now.'),
      ],
      open: 'Lina takes off her headphones. This is serious.',
      moves: [
        { n: 'Interrupt her', say: "'Okay but SPEAKING OF ME—'", res: 'Lina rolls her eyes so hard they almost fall out of her head.' },
        { n: "Say 'um, actually...'", say: "'Um, actually, technically—'", res: 'Lina puts one headphone back on. Brutal.' },
        { n: 'Actually listen', cool: true, pow: 26, say: 'Victoria shuts up and lets Lina finish her whole sentence.', res: 'Lina is stunned. Nobody has let her finish a sentence in this house since 2019.' },
        { n: 'Ask about her day', cool: true, pow: 22, say: "'So... how was your day? Like, for real.'", res: "Lina: '...It was fine? Why are you being weird?' (It worked.)" },
      ],
      roasts: { lina: [
        'You talk like a group chat with no mute button.',
        'I have noise-cancelling headphones and I can STILL hear you.',
        "You're not the main character. You're the loading screen.",
        'Even Thomas walks away when you start talking, and he eats socks.',
        "Shut up for ten seconds. I'll time it. I'll PAY you.",
        'Your voice has one setting and it is "fire alarm".',
      ] },
      win: [
        L('Lina', 'Okay. Okay! Truce.'),
        L('Lina', "Look, I don't hate you. I just can't hear myself think when you talk over everyone."),
        L('Lina', 'People actually like you MORE when you let them talk. Wild, right?'),
        L('Victoria', 'So... listening is like a cheat code?'),
        L('Lina', 'Yes, dumbass. Listening is the cheat code. ...Love you. Gate\'s open. Go bug Grace.'),
        N('LESSON LEARNED: Listen first. Talk second.'),
      ],
      lose: [L('Lina', 'That was painful for both of us. Go talk to the dog, then try again. And maybe press the NOT annoying buttons.')],
    },
  },
  {
    name: 'Level 2: The House',
    sub: 'Grace is home. Grace is always home. Grace is always filming.',
    lesson: 'Hype other people up. The spotlight is big enough.',
    pal: { g1: '#c99a6b', g2: '#bf8f60', wall: '#5b3a5e', wall2: '#7a4f7e', path: '#c99a6b', water: '#3b82c4' },
    start: [3, 4],
    map: [
      '####################',
      '#......#...........#',
      '#......#...........#',
      '#......#...####....#',
      '#..........#..#....#',
      '#......#...#..#....#',
      '####.###...#..#....#',
      '#......#...##.#....#',
      '#......#...........#',
      '#......#####.#######',
      '#..................#',
      '#..................#',
      '########G###########',
      '#......XXXX........#',
      '####################',
    ],
    open: [
      N('Inside. Somewhere in the house, Grace is filming her 600th dance video.'),
      L('Victoria', "Okay. Lina said listen first. I can do that. I'm basically a professional listener now."),
      N("Jody the cat is hiding somewhere. Cats always know stuff."),
    ],
    after: [L('Grace', 'The door is open, babe. Go. You are officially less cringe. Slightly.')],
    ents: [
      { id: 'jody', k: 'jody', n: 'Jody', x: 12, y: 5, helper: true, talk: () => {
        if (G.flags.jody) return say([L('Jody', 'I have given you my wisdom. Now leave. I am busy staring at a wall.')]);
        G.flags.jody = 1;
        say([
          L('Jody', 'Mrrp. Oh. It\'s you. The loud one.'),
          L('Victoria', 'JODY! Come here! Come here come here come here kiss kiss kiss—'),
          L('Jody', 'No. This is literally why I live in a closet.'),
          { ...L('Jody', 'Here is the whole cat philosophy: the less you chase people, the more they come to you.'), c: [
            { t: "That's dumb. I'm gonna chase you anyway.", a: 5, r: [N('Jody vanishes. You hear her judging you from another room. ...She\'s back. Still judging.')] },
            { t: 'So... be chill and let people come to me?', a: -5, r: [L('Jody', 'Exactly. You may now pet me. Once. Do not make it weird.')] },
          ] },
          N('Jody coughs up a gift. It is a Hairball of Wisdom. Gross. Also magical.'),
          give({ n: 'Hairball of Wisdom', heal: 50 }),
          L('Jody', "Grace will try to steal the spotlight. Don't fight her for it. Give it to her. Trust me, it confuses people."),
        ]);
      } },
      { id: 'mirror', k: 'mirror', n: 'the mirror', x: 3, y: 8, talk: choiceThing('mirror',
        'A mirror. You look great. Obviously.', [
          { t: 'Take 47 selfies', a: 5, r: [L('Grace', '(from upstairs) ARE YOU USING MY RING LIGHT??')] },
          { t: 'Look once and move on', a: -3, r: [N('Growth.')] },
        ], 'Still you. Still great. Keep moving.') },
      { id: 'laptop', k: 'laptop', n: 'the family group chat', x: 17, y: 6, talk: choiceThing('laptop',
        'The family group chat. Grace just posted her new dance video.', [
          { t: "Reply 'mine's better' and post your own", a: 5, r: [N('Mom reacted with 👍. Ouch. That is the worst emoji.')] },
          { t: "Reply 'ok this actually slaps 🔥'", a: -5, r: [N('Grace reacted with 😳. She is not used to compliments from you.')] },
        ], "The group chat. Dad is typing. Dad has been typing for nine minutes.") },
      { id: 'grace', k: 'grace', n: 'Grace', x: 8, y: 10, boss: true, talk: bossTalk(1) },
    ],
    boss: {
      title: 'SISTER SHOWDOWN: GRACE',
      foes: [{ k: 'grace', n: 'Grace' }], hp: 110, atk: [12, 18], speed: 0.024,
      pre: [
        L('Grace', "Ugh, Victoria, you're in my shot. AGAIN."),
        L('Victoria', 'Your shot? This is MY hallway.'),
        L('Grace', "It's literally everyone's hallway. Okay, you know what? This is content now. Let's go."),
      ],
      open: 'Grace hits record. The ring light turns on. Things are about to get dramatic.',
      moves: [
        { n: 'Make it about you', say: "'Cool story. Anyway, back to ME—'", res: "Grace's camera cuts you out of the frame. Brutal." },
        { n: 'Play a loud TikTok sound', say: "'OH NO, OH NO, OH NO NO NO NO NO—'", res: 'The sound is so annoying it hurts you too. Nobody wins.' },
        { n: 'Hype her up', cool: true, pow: 26, say: "'Okay, that outfit actually goes SO hard.'", res: "Grace's guard drops. 'Wait... really??'" },
        { n: 'Let her have the spotlight', cool: true, pow: 24, say: 'Victoria steps out of the shot. On purpose.', res: "Grace doesn't know how to handle this. Her whole vibe is crumbling." },
      ],
      roasts: { grace: [
        "You're giving... desperate for attention. And not in a cute way.",
        'Your personality has a laugh track and nobody is laughing.',
        'Babe. Nobody asked. Like, literally, I checked.',
        "You're the human version of a notification at 3 a.m.",
        'You try so hard it gives me secondhand embarrassment.',
        "If being extra was a sport you'd still lose, because you'd talk through the whole game.",
      ] },
      win: [
        L('Grace', 'Ugh. Fine. You won. That was actually... nice?'),
        L('Grace', 'Here\'s the thing. I do all this extra stuff because I want people to notice me. Same as you.'),
        L('Grace', 'But the people who are actually cool? They make OTHER people feel seen. That is the flex.'),
        L('Victoria', 'So hyping people up... makes ME cooler?'),
        L('Grace', "Yeah. It's like, the hack. Don't tell anyone I said something wise. Delete this. DELETE IT."),
        N('LESSON LEARNED: Hype other people up. The spotlight is big enough.'),
      ],
      lose: [L('Grace', "CUT! That take was horrible. Go find the cat or something, then we'll go again from the top.")],
    },
  },
  {
    name: 'Level 3: The Pond',
    sub: 'Sharon the turtle has been waiting for you. For about forty years.',
    lesson: 'Be yourself. Chill, kind, and not trying so hard.',
    pal: { g1: '#7fb85a', g2: '#76ad52', wall: '#24502a', wall2: '#2f6b35', path: '#b08850', water: '#4a90d9' },
    start: [2, 12],
    map: [
      '####################',
      '#.....*...~~~~~~...#',
      '#........~~~~~~~~..#',
      '#..*.....~~~~~~~~..#',
      '#.........~~~~~~...#',
      '#..................#',
      '#....*.........*...#',
      '#..................#',
      '#...~~~~...........#',
      '#...~~~~......,,,,,#',
      '#.............,....#',
      '#......*......,....#',
      '#.............,....#',
      '#..............*...#',
      '####################',
    ],
    open: [
      N('Sunset at the pond. Lina AND Grace are waiting on the dock. Together. That is never a good sign.'),
      L('Victoria', 'Listen first. Hype people up. Okay. I got this. I think. Maybe.'),
      N('Someone very old and very slow is near the water. Go say hi.'),
    ],
    after: [],
    ents: [
      { id: 'sharon', k: 'sharon', n: 'Sharon', x: 6, y: 6, helper: true, talk: () => {
        if (G.flags.sharon) return say([L('Sharon', 'Go... on... sweetie. I will... catch up. By... Tuesday.')]);
        G.flags.sharon = 1;
        say([
          L('Sharon', 'Ohhhhh... hello... Victoria...'),
          L('Sharon', 'I have been... waiting... for you.'),
          L('Victoria', 'Can you talk faster?'),
          L('Sharon', 'No.'),
          L('Sharon', 'Being cool... is not about... being loud. ...Or being quiet.'),
          L('Sharon', "It's about... being comfortable... in your own shell."),
          L('Victoria', "I don't have a shell, Sharon."),
          { ...L('Sharon', '...It\'s a metaphor... sweetie.'), c: [
            { t: "This is taking forever. I'm leaving.", a: 5, r: [L('Sharon', 'Rude... but I have... had worse. In... the eighties.')] },
            { t: "Take your time, Sharon. I'm listening.", a: -6, r: [L('Sharon', 'Ohhh... look at you... Lina would be... proud.')] },
          ] },
          L('Sharon', 'Take this... I have been saving it... since... 1987.'),
          give({ n: 'Very Old Lettuce', heal: 100 }),
          L('Sharon', "Your sisters... are on the dock. Don't try... to win. Just... be... you."),
        ]);
      } },
      { id: 'rock', k: 'rock', n: 'a flat rock', x: 9, y: 5, talk: choiceThing('rock',
        'A perfectly flat rock. A duck is floating nearby, minding its own business.', [
          { t: 'Throw it at the duck', a: 5, r: [N('The duck files a formal complaint. The duck has a lawyer.')] },
          { t: 'Skip it across the pond', a: -3, r: [N('Four skips! Nobody saw. Still cool. Being cool when nobody is watching counts double.')] },
        ], 'Just pebbles now. You used the good one.') },
      { id: 'bench', k: 'bench', n: 'the bench', x: 11, y: 7, talk: choiceThing('bench',
        'A bench facing the sunset.', [
          { t: 'Stand on it and announce your arrival to the pond', a: 5, r: [N('Nobody at the pond cares. One frog looks embarrassed for you.')] },
          { t: 'Sit. Watch the sunset. Say nothing.', a: -4, r: [L('Sharon', '(from across the pond) ...Nice.')] },
        ], 'Nice bench. Good sunset. Ten out of ten.') },
      { id: 'lina', k: 'lina', n: 'Lina', x: 16, y: 11, boss: true, talk: bossTalk(2) },
      { id: 'grace', k: 'grace', n: 'Grace', x: 18, y: 11, boss: true, talk: bossTalk(2) },
    ],
    boss: {
      title: 'FINAL SHOWDOWN: LINA + GRACE',
      foes: [{ k: 'lina', n: 'Lina' }, { k: 'grace', n: 'Grace' }], hp: 150, atk: [9, 15], speed: 0.03,
      pre: [
        L('Lina', 'So. You made it.'),
        L('Grace', "We heard you've been... less annoying?"),
        L('Lina', 'Suspicious.'),
        L('Grace', 'Final test. Both of us. At the same time.'),
        L('Victoria', 'Bring it.'),
      ],
      open: 'Two sisters. One dock. Zero chill. Victoria needs to use EVERYTHING she learned.',
      moves: [
        { n: 'Try WAY too hard', say: 'Victoria attempts a backflip. It is mostly a fall.', res: 'Grace filmed it. It will be on the internet forever.' },
        { n: 'Remind them you won', say: "'Remember when I beat you? Remember? REMEMBER THAT?'", res: 'Lina and Grace groan in perfect harmony.' },
        { n: 'Laugh at yourself', cool: true, pow: 24, say: "Victoria trips, laughs, and goes 'yeah, I meant to do that.'", res: 'Both sisters crack up. That was actually funny.' },
        { n: 'Listen AND hype', cool: true, pow: 30, say: "Victoria lets Lina finish her rant, then tells Grace her video was fire.", res: 'COMBO MOVE! Lessons stacked! The sisters are shook.' },
      ],
      roasts: {
        lina: [
          "Being less annoying for one day doesn't make you cool. It makes you a beta test.",
          "I'm proud of you. That was a roast. Shut up.",
          'You still chew like a golden retriever.',
        ],
        grace: [
          'Your glow-up is at like 40% loading. Hang in there.',
          'Nice try, but my sunglasses are cooler than your whole personality.',
          "You're cute when you're quiet. So, like, twice a year.",
        ],
      },
      win: [
        L('Lina', '...Okay. She\'s cool now. I hate it.'),
        L('Grace', "Ugh, she's cooler than ME now. I hate it more."),
        L('Victoria', "I learned it from you guys. Even though you're both mean as hell."),
        L('Lina', "We're your sisters. Being mean is our love language."),
        N('Thomas, Jody and Sharon show up. (Sharon started walking here during Level 1.)'),
        L('Thomas', 'WOOF! Is she cool now? She smells cool.'),
        L('Jody', "She is acceptable. I will allow her to pet me. Twice."),
        L('Sharon', 'I... made it... Did I... miss... anything?'),
        N('LESSON LEARNED: Be yourself. Chill, kind, and not trying so hard.'),
      ],
      lose: [L('Lina', 'Wow.'), L('Grace', 'Go talk to the turtle, babe. Then come back.')],
    },
  },
];
const LV = () => LEVELS[G.lv];

// ---------- explore ----------
function loadLevel(i) {
  G.lv = i;
  const [sx, sy] = LV().start;
  G.x = sx * T + 16; G.y = sy * T + 26; G.face = 1;
  G.mode = 'card';
}
const entPos = e => [e.x * T + 16, e.y * T + 26];
function solidAt(px, py) {
  const ch = (LV().map[Math.floor(py / T)] || '')[Math.floor(px / T)];
  if (ch === undefined || ch === '#' || ch === '~') return true;
  return ch === 'G' && !G.flags['clear' + G.lv];
}
function blocked(x, y) {
  if ([[x - 7, y - 6], [x + 7, y - 6], [x - 7, y], [x + 7, y]].some(([px, py]) => solidAt(px, py))) return true;
  return LV().ents.some(e => { const [ex, ey] = entPos(e); return Math.abs(x - ex) < 18 && Math.abs(y - ey) < 10; });
}
function nearest() {
  let best = null, bd = 44;
  for (const e of LV().ents) {
    const [ex, ey] = entPos(e), d = Math.hypot(G.x - ex, G.y - ey);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function updExplore() {
  let dx = 0, dy = 0;
  if (held.has('ArrowLeft') || held.has('a')) dx--;
  if (held.has('ArrowRight') || held.has('d')) dx++;
  if (held.has('ArrowUp') || held.has('w')) dy--;
  if (held.has('ArrowDown') || held.has('s')) dy++;
  const sp = 2.4 / (dx && dy ? Math.SQRT2 : 1);
  if (dx) { G.face = dx; if (!blocked(G.x + dx * sp, G.y)) G.x += dx * sp; }
  if (dy && !blocked(G.x, G.y + dy * sp)) G.y += dy * sp;
  G.step = dx || dy ? G.step + 1 : 0;
  const e = nearest();
  if (e && (ok() || (click && Math.hypot(click.x - entPos(e)[0], click.y - entPos(e)[1] + 16) < 30))) {
    G.flags['talked_' + e.id] = 1;
    e.talk();
    return;
  }
  const ch = LV().map[Math.floor(G.y / T)][Math.floor(G.x / T)];
  if (ch === 'X' && G.flags['clear' + G.lv]) G.mode = 'clear';
}
function drawWorld() {
  const lv = LV(), p = lv.pal;
  for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) {
    const ch = lv.map[y][x], px = x * T, py = y * T;
    rect(px, py, T, T, (x + y) % 2 ? p.g1 : p.g2);
    if (ch === ',' || ch === 'X') rect(px, py, T, T, p.path);
    if (ch === 'X' && G.flags['clear' + G.lv] && G.t % 60 < 40) { ctx.strokeStyle = '#fff8'; ctx.lineWidth = 2; ctx.strokeRect(px + 6, py + 6, T - 12, T - 12); }
    if (ch === '*') { circ(px + 10, py + 12, 3, '#ff70a6'); circ(px + 22, py + 20, 3, '#ffd166'); circ(px + 14, py + 24, 2.5, '#fff'); }
    if (ch === '~') {
      rect(px, py, T, T, p.water);
      const o = (G.t / 8 + x * 7 + y * 3) % 32;
      rect(px + o * 0.5, py + 10, 10, 2, '#ffffff55'); rect(px + 16 - o * 0.3, py + 22, 8, 2, '#ffffff40');
    }
    if (ch === '#') {
      rect(px, py, T, T, p.wall);
      if (G.lv === 1) { rect(px, py + T - 6, T, 6, p.wall2); }
      else { circ(px + 16, py + 14, 13, p.wall2); circ(px + 10, py + 10, 5, '#ffffff12'); }
    }
    if (ch === 'G') {
      if (G.flags['clear' + G.lv]) rect(px, py, T, T, p.path);
      else { rect(px, py, T, T, '#8b5a2b'); for (let i = 2; i < T; i += 8) rect(px + i, py, 4, T, '#6b4220'); rect(px, py + 12, T, 4, '#5c3a1a'); }
    }
  }
  // sprites sorted by feet y
  const list = LV().ents.map(e => ({ y: entPos(e)[1], d: () => {
    const [ex, ey] = entPos(e), bob = Math.sin(G.t * 0.06 + e.x) * 1;
    if (['phone', 'tramp', 'mirror', 'laptop', 'bench', 'rock'].includes(e.k)) thing(e.k, ex, ey);
    else drawChar(e.k, ex, ey, 1, G.x < ex ? -1 : 1, bob);
    if (!G.flags['talked_' + e.id] && (e.helper || e.boss)) outlined('!', ex, ey - 46 + Math.sin(G.t * 0.15) * 3, 20, e.boss ? '#ff4d6d' : '#f6d365');
  } }));
  list.push({ y: G.y, d: () => person('victoria', G.x, G.y, 1, G.face, G.step ? Math.abs(Math.sin(G.step * 0.25)) * -2 : 0, isCool()) });
  list.sort((a, b) => a.y - b.y).forEach(s => s.d());
}
const isCool = () => G.annoy <= 10 || G.mode === 'ending';
function drawHud() {
  panel(8, 8, 250, 52);
  text(LV().name, 20, 28, 14, '#f6d365');
  text('ANNOYING', 20, 49, 12, '#fff');
  bar(90, 39, 120, 12, G.annoy / 100, annoyColor(G.annoy));
  text(G.annoy + '%', 216, 50, 12, annoyColor(G.annoy));
  panel(W - 160, 8, 152, 32);
  text('🎒 Items: ' + G.items.length, W - 148, 30, 14, '#fff');
  if (G.mode === 'explore') {
    const e = nearest();
    if (e) { panel(W / 2 - 130, H - 46, 260, 34); text('SPACE: ' + (e.helper || e.boss ? 'talk to ' : 'check ') + e.n, W / 2, H - 23, 15, '#f6d365', 'center'); }
  }
}

// ---------- battle ----------
function startBattle(cfg) {
  G.hp = G.maxHp;
  B = { cfg, foeHp: cfg.hp, foeShow: cfg.hp, hpShow: G.hp, sel: 0, phase: 'text', q: [], cur: null, chars: 0, then: null, timing: null, shake: 0, fshake: 0, turn: 0, rage: 0 };
  G.mode = 'battle';
  bMsg([cfg.open, 'Cool moves need timing. Annoying moves... are annoying.'], toMenu);
}
function bMsg(list, then) { B.phase = 'text'; B.q = list.map(m => (typeof m === 'string' ? { t: m } : m)); B.then = then; nextMsg(); }
function nextMsg() {
  const m = B.q.shift();
  if (!m) { const th = B.then; B.then = null; return th(); }
  B.cur = m; B.chars = 0; if (m.fx) m.fx();
}
function toMenu() { B.phase = 'menu'; }
const menuItems = () => [...B.cfg.moves.map(m => m.n), G.items.length ? `Use ${G.items[0].n}` : 'Use item (none)'];
const menuRect = i => ({ x: 22, y: H - 140 + i * 25, w: 230, h: 23 });
function choose(i) {
  const cfg = B.cfg;
  if (i === cfg.moves.length) {
    if (!G.items.length) return bMsg(['Your backpack is empty. Rough.'], toMenu);
    const it = G.items.shift();
    return bMsg([{ t: `Victoria uses the ${it.n}. +${it.heal} confidence!`, fx: () => { G.hp = Math.min(G.maxHp, G.hp + it.heal); } }], foeTurn);
  }
  const m = cfg.moves[i];
  if (!m.cool) {
    return bMsg(['Victoria: ' + m.say, { t: m.res + " It's not very effective.", fx: () => { annoy(4); B.rage += 4; } }], foeTurn);
  }
  bMsg(['Victoria: ' + m.say], () => { B.phase = 'timing'; B.timing = { p: 0, dir: 1, m, sweeps: 0 }; });
}
function resolveTiming() {
  const { p, m } = B.timing, d = Math.abs(p - 0.5);
  const [grade, mult] = d < 0.05 ? ['PERFECT', 1.6] : d < 0.14 ? ['Nice', 1.15] : d < 0.28 ? ['Meh', 0.75] : ['Whiff', 0.35];
  const dmg = Math.round(m.pow * mult);
  bMsg([{ t: `${grade}! ${m.res} (-${dmg} beef)`, fx: () => { B.foeHp = Math.max(0, B.foeHp - dmg); B.fshake = 14; annoy(-2); } }],
    () => (B.foeHp <= 0 ? win() : foeTurn()));
}
function foeTurn() {
  const c = B.cfg, f = c.foes[B.turn++ % c.foes.length];
  const dmg = rand(c.atk[0], c.atk[1]) + B.rage; B.rage = 0;
  bMsg([{ t: `${f.n}: "${pick(c.roasts[f.k])}"`, fx: () => { G.hp = Math.max(0, G.hp - dmg); B.shake = 14; } }, `Ouch. -${dmg} confidence.`],
    () => (G.hp <= 0 ? lose() : toMenu()));
}
function win() {
  const cfg = B.cfg; B = null; G.mode = 'explore'; G.hp = G.maxHp;
  say(cfg.win, () => {
    G.flags['clear' + G.lv] = true; annoy(-12);
    if (G.lv === LEVELS.length - 1) G.mode = 'ending';
  });
}
function lose() {
  const cfg = B.cfg; B = null; G.mode = 'explore'; G.hp = G.maxHp;
  say([N('Victoria ran out of confidence!'), ...cfg.lose]);
}
function updBattle() {
  B.foeShow += (B.foeHp - B.foeShow) * 0.15; B.hpShow += (G.hp - B.hpShow) * 0.15;
  if (B.shake) B.shake--; if (B.fshake) B.fshake--;
  if (B.phase === 'text') {
    B.chars = Math.min(B.cur.t.length, B.chars + 1.6);
    if (okOrTap()) { if (B.chars < B.cur.t.length) B.chars = B.cur.t.length; else nextMsg(); }
  } else if (B.phase === 'menu') {
    const n = menuItems().length;
    if (up()) B.sel = (B.sel + n - 1) % n;
    if (down()) B.sel = (B.sel + 1) % n;
    let c = ok() ? B.sel : -1;
    for (let i = 0; i < n; i++) if (inRect(click, menuRect(i))) c = i;
    if (c >= 0) { B.sel = c; choose(c); }
  } else if (B.phase === 'timing') {
    const tm = B.timing;
    tm.p += tm.dir * B.cfg.speed;
    if (tm.p >= 1 || tm.p <= 0) { tm.dir *= -1; tm.p = Math.max(0, Math.min(1, tm.p)); tm.sweeps++; }
    if (okOrTap() || tm.sweeps >= 4) resolveTiming();
  }
}
const BG = [['#87ceeb', '#6dbb52'], ['#e9c46a', '#c99a6b'], ['#ff9a5a', '#5a8f4a']];
function drawBattle() {
  const [sky, ground] = BG[G.lv];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, sky); g.addColorStop(0.55, sky); g.addColorStop(0.551, ground); g.addColorStop(1, ground);
  rect(0, 0, W, H, g);
  if (G.lv === 2) { circ(W / 2, 264, 60, '#ffd166aa'); rect(0, 264, W, H - 264, ground); }
  ell(150, 318, 80, 18, '#00000030'); ell(480, 238, 110, 20, '#00000030');
  const sx = B.shake ? rand(-4, 4) : 0, fx = B.fshake ? rand(-5, 5) : 0;
  person('victoria', 150 + sx, 318, 3, 1, Math.sin(G.t * 0.08) * 1.5, isCool());
  const foes = B.cfg.foes;
  foes.forEach((f, i) => person(f.k, (foes.length > 1 ? 430 + i * 110 : 480) + fx, 238, 3, -1, Math.sin(G.t * 0.08 + i) * 1.5));
  outlined(B.cfg.title, W / 2, 34, 20, '#f6d365');
  // bars
  panel(370, 52, 250, 52, '#ff70a6');
  text(foes.map(f => f.n).join(' + ') + "'s BEEF with you", 382, 72, 13, '#fff');
  bar(382, 80, 226, 14, B.foeShow / B.cfg.hp, '#ff4d6d');
  panel(20, 52, 250, 70, '#c77dff');
  text("Victoria's CONFIDENCE", 32, 72, 13, '#fff');
  bar(32, 80, 226, 14, B.hpShow / G.maxHp, '#06d6a0');
  text('Annoying: ' + G.annoy + '%', 32, 113, 12, annoyColor(G.annoy));
  // bottom box
  panel(12, H - 150, W - 24, 140);
  if (B.phase === 'menu') {
    menuItems().forEach((s, i) => {
      const r = menuRect(i), on = i === B.sel, m = B.cfg.moves[i];
      text((on ? '▶ ' : '   ') + s, r.x, r.y + 17, 15, on ? '#f6d365' : '#ddd');
      if (m) text(m.cool ? '😎' : '🙄', r.x + 222, r.y + 17, 13, '#fff', 'right');
    });
    const m = B.cfg.moves[B.sel];
    const tip = m ? (m.cool ? 'Cool move. Time it with SPACE when the marker hits the green.' : 'Annoying move. Feels great. Does nothing. Makes them meaner.')
      : G.items.length ? `Heals ${G.items[0].heal} confidence. Uses your turn.` : 'Go talk to the animals to get items.';
    wrap(tip, 330, 14).forEach((s, i) => text(s, 280, H - 120 + i * 20, 14, '#bbb'));
  } else if (B.phase === 'text') {
    wrap(B.cur.t.slice(0, Math.floor(B.chars)), W - 64, 17).forEach((s, i) => text(s, 30, H - 118 + i * 23, 17, '#fff'));
    if (B.chars >= B.cur.t.length && G.t % 50 < 30) text('▼', W - 40, H - 22, 14, '#f6d365');
  } else if (B.phase === 'timing') {
    const bx = 120, bw = 400, by = H - 95;
    text('Press SPACE (or tap) when the marker is in the green!', W / 2, H - 115, 16, '#fff', 'center');
    rect(bx, by, bw, 26, '#ff4d6d'); rect(bx + bw * 0.22, by, bw * 0.56, 26, '#ffb703');
    rect(bx + bw * 0.36, by, bw * 0.28, 26, '#8ac926'); rect(bx + bw * 0.45, by, bw * 0.1, 26, '#06d6a0');
    const mx = bx + B.timing.p * bw;
    rect(mx - 3, by - 8, 6, 42, '#fff'); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(mx - 3, by - 8, 6, 42);
  }
}

// ---------- screens ----------
function cast(y, s) {
  const xs = [80, 175, 270, 370, 460, 555];
  ['lina', 'thomas', 'victoria', 'jody', 'sharon', 'grace'].forEach((k, i) =>
    drawChar(k, xs[i], y, s, 1, Math.sin(G.t * 0.07 + i) * 1.5, k === 'victoria' && G.mode === 'ending'));
}
function drawTitle() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b1650'); g.addColorStop(1, '#c0397a');
  rect(0, 0, W, H, g);
  for (let i = 0; i < 40; i++) circ((i * 97 + G.t * 0.2) % W, (i * 53) % 260, (i % 3) + 1, '#ffffff55');
  outlined("VICTORIA'S QUEST", W / 2, 110, 52, '#f6d365');
  outlined('How to Be Less Annoying (in 3 Easy Levels)', W / 2, 150, 20, '#fff');
  rect(0, 300, W, 180, '#00000040');
  cast(360, 2.2);
  if (G.t % 60 < 40) outlined('Press SPACE or tap to start', W / 2, 430, 22, '#fff');
  text('Arrows / WASD to move · SPACE to talk and pick', W / 2, 465, 13, '#ddd', 'center');
}
function drawCard(title, lines, foot) {
  rect(0, 0, W, H, '#160e22');
  outlined(title, W / 2, 170, 34, '#f6d365');
  lines.forEach((s, i) => wrap(s, 520, 18).forEach((w, j) => text(w, W / 2, 220 + i * 40 + j * 24, 18, '#eee', 'center')));
  if (G.t % 60 < 40) text(foot, W / 2, 420, 16, '#c77dff', 'center');
}
function drawEnding() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff9a5a'); g.addColorStop(1, '#6a2c70');
  rect(0, 0, W, H, g);
  for (let i = 0; i < 60; i++) {
    const x = (i * 71 + G.t * (1 + (i % 3))) % W, y = (i * 37 + G.t * 2 * (1 + (i % 2))) % H;
    rect(x, y, 5, 8, ['#f6d365', '#ff70a6', '#06d6a0', '#9b5de5'][i % 4]);
  }
  outlined('VICTORIA', W / 2, 80, 56, '#fff');
  outlined('THE ULTIMATE COOL PERSON', W / 2, 122, 30, '#f6d365');
  const a = G.annoy;
  const rank = a <= 5 ? 'Certified. Sharon is shedding a single tear.' : a <= 30 ? 'Pretty much the coolest. A tiny bit annoying, as a treat.' : 'Cool... ish. Lina says "it\'s a process."';
  outlined(`Final annoying meter: ${a}%`, W / 2, 168, 20, annoyColor(a));
  outlined(rank, W / 2, 196, 16, '#fff');
  cast(360, 2.2);
  if (G.t % 60 < 40) outlined('Press SPACE to play again', W / 2, 440, 20, '#fff');
}
function drawPops() {
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i], age = 80 - p.life;
    const [x, y] = G.mode === 'battle' ? [150, 200] : [G.x, G.y - 50];
    ctx.globalAlpha = Math.min(1, p.life / 30); outlined(p.t, x, y - age * 0.5, 16, p.c); ctx.globalAlpha = 1;
    if (--p.life <= 0) pops.splice(i, 1);
  }
}

// ---------- loop ----------
function frame() {
  G.t++;
  switch (G.mode) {
    case 'title':
      if (okOrTap()) { Object.assign(G, { annoy: 100, hp: 100, items: [], flags: {} }); loadLevel(0); }
      drawTitle(); break;
    case 'card':
      if (okOrTap()) {
        G.mode = 'explore';
        if (!G.flags['open' + G.lv]) { G.flags['open' + G.lv] = 1; say(LV().open); }
      }
      if (G.mode === 'card') drawCard(LV().name, [LV().sub], 'Press SPACE or tap');
      else { drawWorld(); drawHud(); }
      break;
    case 'explore': updExplore(); if (G.mode === 'explore' || G.mode === 'dialog' || G.mode === 'clear') { drawWorld(); drawHud(); drawDialog(); } break;
    case 'dialog': updDialog(); if (G.mode === 'battle') drawBattle(); else if (G.mode === 'ending') drawEnding(); else { drawWorld(); drawHud(); drawDialog(); } break;
    case 'battle': updBattle(); if (B) drawBattle(); else { drawWorld(); drawHud(); drawDialog(); } break;
    case 'clear':
      if (okOrTap()) loadLevel(G.lv + 1);
      drawCard(LV().name.split(':')[0] + ' complete!', ['Lesson learned: ' + LV().lesson, `Annoying meter: ${G.annoy}%`], 'Press SPACE for the next level');
      break;
    case 'ending':
      if (okOrTap()) G.mode = 'title';
      drawEnding(); break;
  }
  if (['explore', 'dialog', 'battle'].includes(G.mode)) drawPops();
  hit.clear(); click = null;
  requestAnimationFrame(frame);
}
window.VQ = { G, LEVELS, loadLevel, startBattle, get B() { return B; } };
requestAnimationFrame(frame);
