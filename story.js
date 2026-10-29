(() => {
  const $ = id => document.getElementById(id);

  // Story / Science toggle: opens or closes every science panel
  const mode = $("mode");
  mode.addEventListener("click", () => {
    const on = mode.getAttribute("aria-pressed") !== "true";
    mode.setAttribute("aria-pressed", String(on));
    mode.textContent = on ? "Science mode" : "Story mode";
    document.querySelectorAll(".science").forEach(d => (d.open = on));
  });

  // Progress bar and sol counter (0 to 5,111 across the story)
  const main = $("chapters");
  function onScroll() {
    const start = main.offsetTop;
    const span = main.offsetHeight - window.innerHeight;
    const f = Math.max(0, Math.min(1, (window.scrollY - start) / span));
    $("sol").textContent = Math.round(f * 5111).toLocaleString();
    $("progress").style.width = f * 100 + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Helper: build a row of buttons that show info in a text area
  function picker(boxId, infoId, data) {
    const box = $(boxId), info = $(infoId);
    Object.entries(data).forEach(([name, text]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.addEventListener("click", () => {
        box.querySelectorAll("button").forEach(x => x.classList.remove("on"));
        b.classList.add("on");
        info.textContent = text;
      });
      box.appendChild(b);
    });
  }

  picker("parts", "part-info", {
    "Panoramic camera": "My eyes. They take color pictures of the whole landscape.",
    "Microscopic imager": "A hand lens. It takes close-up photos of rocks and soil.",
    "Rock abrasion tool": "A rock grinder. It scrapes away dust to reveal fresh rock.",
    "Mössbauer spectrometer": "A chemistry nose. It finds iron-bearing minerals such as hematite.",
    "APXS": "Another chemistry nose. It measures which elements are in a rock.",
    "Mini-TES": "A heat-vision camera. It spots minerals by the heat they give off."
  });

  picker("stops", "stop-info", {
    "Eagle Crater": "Where I landed in 2004 and found my first signs of water.",
    "Endurance Crater": "A bigger crater where I looked at deeper layers of rock.",
    "Victoria Crater": "A huge crater with dramatic cliffs. I explored its rim for about two years.",
    "Endeavour Crater": "A giant crater I reached in 2011. I found clay minerals here.",
    "Marathon Valley": "A valley where clays showed up again. I finished a marathon distance on the way.",
    "Perseverance Valley": "My last stop. I was exploring it when the storm hit in 2018."
  });

  // Chapter 3: clue detective
  const clueText = {
    "Round blueberries": "Hematite pebbles. Water can make minerals clump into balls like these.",
    "Ripples in rock": "Ripple patterns like ones made by moving water at the edge of a lake or stream.",
    "Salty sulfates": "Minerals left behind when salty water dries up."
  };
  const seen = new Set();
  Object.entries(clueText).forEach(([name, text]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = name;
    b.addEventListener("click", () => {
      b.classList.add("on");
      seen.add(name);
      $("verdict").textContent = text + (seen.size === 3 ? " Case solved: Mars once had liquid water here!" : "");
    });
    $("clues").appendChild(b);
  });

  // Chapter 6: choice game
  $("game").querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => {
      $("feedback").textContent = b.dataset.ok === "1"
        ? "Yes! Tilting toward the Sun helped my panels catch more light."
        : "Not quite. Without enough sunlight I would lose power. Try again.";
    }));

  // Scroll effects: bars grow, sky dims in chapter 7
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.5 });
  io.observe($("compare"));
  io.observe($("marathon"));
  new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle("dusk", e.isIntersecting)), { threshold: 0.3 })
    .observe($("ch7"));

  // Quiz
  const quiz = [
    ["How long was Opportunity's mission planned to last?", ["90 sols", "500 sols", "5,111 sols"], 0],
    ["What are the 'blueberries'?", ["Frozen berries", "Hematite pebbles", "Meteors"], 1],
    ["What was the first meteorite identified on another planet?", ["Heat Shield Rock", "Eagle Rock", "Victoria Stone"], 0],
    ["What stopped Opportunity from working?", ["A crash", "Running out of fuel", "A global dust storm"], 2],
    ["Who was 9 years old when she helped name the rovers?", ["Sofi Collis", "Sophie Cole", "Sally Ride"], 0]
  ];
  let score = 0, done = 0;
  quiz.forEach(([q, opts, ans]) => {
    const f = document.createElement("fieldset");
    f.className = "quiz-q";
    f.innerHTML = `<legend>${q}</legend>`;
    opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.textContent = o;
      b.addEventListener("click", () => {
        if (f.dataset.done) return;
        f.dataset.done = "1";
        b.classList.add(i === ans ? "right" : "wrong");
        f.querySelectorAll(".quiz-opt")[ans].classList.add("right");
        if (i === ans) score++;
        if (++done === quiz.length)
          $("score").textContent = `You scored ${score} out of ${quiz.length}. ` + (score >= 4 ? "Great job, space explorer!" : "Scroll up and try again!");
      });
      f.appendChild(b);
    });
    $("quiz").appendChild(f);
  });
})();
