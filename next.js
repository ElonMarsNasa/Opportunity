(() => {
  const video = document.getElementById("scene");
  const btn = document.getElementById("go");
  const status = document.getElementById("status");
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const NEXT_PAGE = "story.html";   // change this to the page that comes after

  let videoFailed = false;
  video.querySelector("source").addEventListener("error", () => (videoFailed = true));

  async function leave() {
    document.body.classList.add("leaving");
    await wait(800);
    window.location.href = NEXT_PAGE;
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    status.textContent = "Rolling down the ramp...";

    if (!videoFailed) {
      try {
        video.addEventListener("ended", leave, { once: true });
        await video.play();
        return;
      } catch (e) {
        videoFailed = true;
      }
    }

    // Fallback if the video is missing: slow zoom toward the scene, then continue
    document.body.classList.add("zoom");
    await wait(2800);
    leave();
  });
})();
