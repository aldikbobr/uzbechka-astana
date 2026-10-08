/* Бункер — paint splats on tap, package calculator with a filling hopper, briefing checklist */
(() => {
  'use strict';
  const M = window.Motion || { $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => Array.from(r.querySelectorAll(s)), motion: false, fine: false, reduce: true, toast() {}, wa: (n, t) => window.open('https://wa.me/' + n + '?text=' + encodeURIComponent(t), '_blank', 'noopener') };
  const { $, $$ } = M;
  const COLORS = ['#ff6a1a', '#b8f400', '#ff2d87', '#2fb8ff', '#ffd400'];
  const nf = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';

  /* Paint splats */
  const layer = $('#splats');
  const NS = 'http://www.w3.org/2000/svg';
  let ci = 0;
  const blob = () => {
    const n = 14, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = (i % 2 ? 26 : 34) + Math.random() * 14;
      pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
    }
    let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (let i = 0; i < n; i++) {
      const p = pts[(i + 1) % n], c = pts[i];
      d += ' Q' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' ' + ((c[0] + p[0]) / 2).toFixed(1) + ' ' + ((c[1] + p[1]) / 2).toFixed(1);
    }
    d += 'Z';
    for (let k = 0; k < 5; k++) {
      const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 12, s = 2 + Math.random() * 4;
      const x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
      d += ' M' + (x - s).toFixed(1) + ' ' + y.toFixed(1) + ' a' + s.toFixed(1) + ' ' + s.toFixed(1) + ' 0 1 0 ' + (2 * s).toFixed(1) + ' 0 a' + s.toFixed(1) + ' ' + s.toFixed(1) + ' 0 1 0 ' + (-2 * s).toFixed(1) + ' 0';
    }
    return d;
  };
  const splat = (x, y, size) => {
    if (!layer || !M.motion) return;
    if (layer.childElementCount > 28) layer.firstElementChild.remove();
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 100 100');
    s.setAttribute('class', 'splat');
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--s', (size || 90 + Math.random() * 90).toFixed(0) + 'px');
    s.style.setProperty('--r', (Math.random() * 360).toFixed(0) + 'deg');
    s.style.setProperty('--c', COLORS[ci++ % COLORS.length]);
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', blob());
    s.append(p);
    layer.append(s);
    setTimeout(() => s.remove(), 4200);
  };
  const hero = $('#hero');
  if (hero) {
    hero.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a,button,input,select,label')) return;
      splat(e.clientX, e.clientY);
    });
    if (M.ready) M.ready(() => {
      const t = $('.ht-word');
      if (!t) return;
      [[0.15, 0.3], [0.62, 0.7], [0.9, 0.2]].forEach(([fx, fy], i) => setTimeout(() => {
        const r = t.getBoundingClientRect();
        splat(r.left + r.width * fx, r.top + r.height * fy, 70 + i * 20);
      }, 900 + i * 260));
    });
  }

  /* Calculator */
  const form = $('#calc-form');
  if (form) {
    const GAMES = {
      paint: { label: 'Пейнтбол', base: { 100: 6000, 200: 8000, 300: 9500 }, ammo: 0, extras: [['Граната', 2000, 0], ['Дымовая шашка', 3000, 0], ['Ещё 100 шаров', 3000, 100], ['Бронежилет', 1000, 0]] },
      air: { label: 'Страйкбол', base: 7500, ammo: 450, extras: [['Ещё 450 шариков', 2000, 450], ['Граната разрывная', 3000, 0], ['Аренда шлема', 1000, 0], ['Аренда бронежилета', 1000, 0]] }
    };
    const extrasBox = $('.extra-grid', form);
    const packField = $('#pack-field');
    const range = $('#players'), pn = $('#players-n');
    const tTeam = $('#t-team'), tEach = $('#t-each');
    const ammoEl = $('#ammo'), hopper = $('#hopper');
    const bookPlayers = $('#book-players'), bookGame = $('#book-game');
    let game = 'paint', qty = [0, 0, 0, 0], lastBalls = 0;
    const renderExtras = () => {
      extrasBox.innerHTML = '';
      GAMES[game].extras.forEach(([name, price], i) => {
        const d = document.createElement('div');
        d.className = 'extra';
        d.innerHTML = '<span>' + name + '<small>' + nf(price) + '</small></span><div class="qty"><button type="button" data-d="-1" aria-label="Убрать: ' + name + '">−</button><b>0</b><button type="button" data-d="1" aria-label="Добавить: ' + name + '">+</button></div>';
        $$('button', d).forEach((b) => b.addEventListener('click', () => {
          qty[i] = Math.max(0, Math.min(60, qty[i] + +b.dataset.d));
          $('b', d).textContent = qty[i];
          d.classList.toggle('is-on', qty[i] > 0);
          calc();
        }));
        extrasBox.append(d);
      });
    };
    const fillHopper = (perPlayer) => {
      if (!hopper) return;
      const want = Math.max(6, Math.min(70, Math.round(perPlayer / 8)));
      while (hopper.childElementCount > want) hopper.lastElementChild.remove();
      const W = hopper.clientWidth || 300, H = hopper.clientHeight || 220;
      for (let k = hopper.childElementCount; k < want; k++) {
        const b = document.createElement('i');
        b.className = 'ball';
        const col = Math.floor(W / 22), row = Math.floor(k / col), x = (k % col) * 22 + (row % 2 ? 11 : 0) + 6;
        b.style.left = Math.min(W - 24, x) + 'px';
        b.style.top = (H - 26 - row * 19) + 'px';
        b.style.setProperty('--c', COLORS[k % COLORS.length]);
        hopper.append(b);
        if (M.motion && b.animate && k >= lastBalls) b.animate([{ transform: 'translateY(-' + (H + 40) + 'px)' }, { transform: 'translateY(0)' }], { duration: 500 + Math.random() * 300, delay: (k - lastBalls) * 18, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
      }
      lastBalls = want;
    };
    const val = (n) => (($('input[name="' + n + '"]:checked', form) || {}).value || '');
    const calc = () => {
      const g = GAMES[game];
      const players = +range.value;
      const pack = val('pack');
      const base = game === 'paint' ? g.base[pack] : g.base;
      let extra = 0, extraAmmo = 0;
      g.extras.forEach(([, price, ammo], i) => { extra += qty[i] * price; extraAmmo += qty[i] * ammo; });
      const team = players * base + extra;
      tTeam.textContent = nf(team);
      tEach.textContent = nf(team / players);
      pn.textContent = players;
      range.style.setProperty('--fill', ((players - 2) / 28 * 100).toFixed(1) + '%');
      const perPlayer = (game === 'paint' ? +pack : g.ammo) + Math.round(extraAmmo / players);
      if (ammoEl) ammoEl.textContent = perPlayer;
      fillHopper(perPlayer);
      if (bookPlayers) bookPlayers.value = players;
      if (bookGame) bookGame.value = g.label;
      return { players, pack, base, extra, team };
    };
    form.addEventListener('change', (e) => {
      if (e.target.name === 'game') {
        game = e.target.value; qty = [0, 0, 0, 0];
        packField.hidden = game !== 'paint';
        renderExtras();
      }
      calc();
    });
    range.addEventListener('input', calc);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const r = calc(), g = GAMES[game];
      const lines = ['Здравствуйте! Посчитал(а) игру на сайте «Бункера»:', 'Игра: ' + g.label + (game === 'paint' ? ', пакет ' + r.pack + ' шаров' : ''), 'Игроков: ' + r.players];
      g.extras.forEach(([name], i) => { if (qty[i]) lines.push(name + ': ' + qty[i]); });
      lines.push('Итого по прайсу: ' + nf(r.team).replace(/ /g, ' '));
      lines.push('Когда можно сыграть?');
      M.wa('77782223434', lines.join('\n'));
      M.toast('Открываем WhatsApp — расчёт уже в сообщении');
    });
    renderExtras();
    calc();
  }

  /* Briefing checklist ticks one by one */
  const checks = $$('#checks li');
  if (checks.length && M.motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => en.forEach((e) => {
      if (e.isIntersecting) { const i = checks.indexOf(e.target); setTimeout(() => e.target.classList.add('is-on'), 150 + i * 120); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -25% 0px' });
    checks.forEach((c) => io.observe(c));
  }
})();
