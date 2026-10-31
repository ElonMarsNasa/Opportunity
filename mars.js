(() => {
  const capsule = document.getElementById("capsule");
  const mars = document.getElementById("mars");
  const flash = document.getElementById("flash");
  const btn = document.getElementById("enter");
  const count = document.getElementById("count");
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const center = el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // Point the capsule's heat shield toward Mars
  function aim() {
    capsule.style.setProperty("--rot", "0deg");
    const c = center(capsule), m = center(mars);
    const angle = Math.atan2(m.y - c.y, m.x - c.x) * 180 / Math.PI;
    capsule.style.setProperty("--rot", angle + "deg");
    flash.style.setProperty("--fx", (m.x / window.innerWidth * 100) + "%");
    flash.style.setProperty("--fy", (m.y / window.innerHeight * 100) + "%");
  }
  aim();
  window.addEventListener("resize", aim);

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    count.textContent = "Entering the atmosphere...";
    const c = center(capsule), m = center(mars);
    capsule.style.setProperty("--tx", (m.x - c.x) + "px");
    capsule.style.setProperty("--ty", (m.y - c.y) + "px");
    document.body.classList.add("go");
    await wait(4600);
    document.body.classList.add("leaving");
    await wait(800);
    window.location.href = "next.html";
  });
})();
