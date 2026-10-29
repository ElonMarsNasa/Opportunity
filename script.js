(() => {
  const canvas = document.getElementById("space");
  const ctx = canvas.getContext("2d");
  const startLink = document.getElementById("start");

  // Orbit sizes and speeds are NOT to scale, so everything fits on screen.
  // period = seconds for one lap in this animation.
  const planets = [
    { name: "Mercury", orbit: 0.16, size: 3,   color: "#b5b0a8", period: 6 },
    { name: "Venus",   orbit: 0.26, size: 5,   color: "#e8c98a", period: 11 },
    { name: "Earth",   orbit: 0.37, size: 5.5, color: "#4f9df0", period: 16, moon: true },
    { name: "Mars",    orbit: 0.49, size: 4.5, color: "#e0603a", period: 24, highlight: true },
    { name: "Jupiter", orbit: 0.66, size: 13,  color: "#d9a679", period: 48 },
    { name: "Saturn",  orbit: 0.81, size: 11,  color: "#e6d29a", period: 70, ring: true },
    { name: "Uranus",  orbit: 0.92, size: 8,   color: "#8fe0e6", period: 100 },
    { name: "Neptune", orbit: 1.0,  size: 8,   color: "#4b6ff0", period: 130 }
  ];
  planets.forEach((p, i) => (p.angle = (i * 2.4) % (Math.PI * 2)));

  let w, h, dpr, cx, cy, rx, tilt, k, sunR, stars = [];
  let mouse = null;
  let last = performance.now();

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    tilt = w < h ? 0.6 : 0.36;               // how flat the orbits look
    cx = w / 2;
    cy = h * 0.52;
    rx = Math.min(w * 0.47, (h * 0.5 - 120) / tilt);
    k = Math.max(0.6, Math.min(1.2, rx / 600));
    sunR = Math.max(12, Math.min(34, rx * 0.05));

    stars = Array.from({ length: Math.round((w * h) / 4500) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.6 + 0.2
    }));
  }

  function position(p) {
    const r = p.orbit * rx;
    return { x: cx + Math.cos(p.angle) * r, y: cy + Math.sin(p.angle) * r * tilt };
  }

  function drawStars() {
    for (const s of stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawOrbits() {
    for (const p of planets) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, p.orbit * rx, p.orbit * rx * tilt, 0, 0, Math.PI * 2);
      ctx.strokeStyle = p.highlight ? "rgba(224,96,58,0.65)" : "rgba(255,255,255,0.10)";
      ctx.lineWidth = p.highlight ? 1.6 : 1;
      ctx.stroke();
    }
  }

  function drawSun() {
    const glow = ctx.createRadialGradient(cx, cy, sunR * 0.3, cx, cy, sunR * 4);
    glow.addColorStop(0, "rgba(255,179,71,0.55)");
    glow.addColorStop(1, "rgba(255,179,71,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR * 4, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.3, 1, cx, cy, sunR);
    body.addColorStop(0, "#fff3c4");
    body.addColorStop(1, "#ffa726");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fill();
  }

  function sphere(x, y, r, color) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.25, color);
    g.addColorStop(1, "#05060f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlanet(p) {
    const { x, y } = position(p);
    const r = p.size * k;

    if (p.highlight) {
      ctx.beginPath();
      ctx.arc(x, y, r + 7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(224,96,58,0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (p.ring) {
      ctx.beginPath();
      ctx.ellipse(x, y, r * 2, r * 0.7, -0.3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(230,210,154,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    sphere(x, y, r, p.color);

    if (p.moon) {
      const mx = x + Math.cos(p.angle * 9) * (r + 9);
      const my = y + Math.sin(p.angle * 9) * (r + 9) * 0.5;
      ctx.fillStyle = "#cfd0d6";
      ctx.beginPath();
      ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function label(text, x, y, color) {
    ctx.font = '600 14px "Figtree", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(4,5,13,0.75)";
    const tw = ctx.measureText(text).width + 14;
    ctx.fillRect(x - tw / 2, y - 12, tw, 22);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + 4);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    for (const p of planets) p.angle += (dt * Math.PI * 2) / p.period;

    ctx.clearRect(0, 0, w, h);
    drawStars();
    drawOrbits();

    // Draw back-to-front so planets pass behind and in front of the Sun
    const items = planets.map(p => ({ p, y: position(p).y }));
    items.push({ sun: true, y: cy });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.sun ? drawSun() : drawPlanet(it.p);

    // Labels: Mars always, any other planet on hover
    let hovered = null;
    for (const p of planets) {
      const { x, y } = position(p);
      if (mouse && Math.hypot(mouse.x - x, mouse.y - y) < p.size * k + 10) hovered = p;
    }
    canvas.style.cursor = hovered ? "help" : "default";

    const mars = planets.find(p => p.highlight);
    const mp = position(mars);
    label("Mars: Opportunity's home", mp.x, mp.y - mars.size * k - 20, "#ff9d7a");
    if (hovered && !hovered.highlight) {
      const hp = position(hovered);
      label(hovered.name, hp.x, hp.y - hovered.size * k - 16, "#ece8dd");
    }

    requestAnimationFrame(frame);
  }

  canvas.addEventListener("mousemove", e => (mouse = { x: e.clientX, y: e.clientY }));
  canvas.addEventListener("mouseleave", () => (mouse = null));
  window.addEventListener("resize", resize);

  // Fade out, then go to the story page
  startLink.addEventListener("click", e => {
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (window.location.href = startLink.href), 600);
  });

  resize();
  requestAnimationFrame(frame);
})();
