(() => {
  const scene = document.getElementById("scene");
  const btn = document.getElementById("launch");
  const count = document.getElementById("count");
  const smoke = document.getElementById("smoke");

  // Smoke puffs at the base of the rocket
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("span");
    p.className = "puff";
    p.style.setProperty("--dx", (Math.random() * 360 - 180) + "px");
    p.style.left = (Math.random() * 60 - 30) + "px";
    p.style.animationDelay = (Math.random() * 1.8) + "s";
    smoke.appendChild(p);
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    for (const n of ["3", "2", "1"]) {
      count.textContent = n;
      await wait(1000);
    }
    count.textContent = "Liftoff!";
    document.body.classList.add("ignite");   // flames, shake, smoke
    await wait(1800);
    document.body.classList.add("lift");     // rocket rises
    await wait(4600);
    document.body.classList.add("leaving");  // fade out
    await wait(800);
    window.location.href = "story.html";
  });
})();
