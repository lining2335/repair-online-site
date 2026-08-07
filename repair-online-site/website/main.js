// ============================================================
// 여기 3개만 실제 값으로 바꾸면 사이트 전체(모든 페이지)에 자동 반영돼요.
// ============================================================
const SERVER_ADDRESS = "play.repaironline.xyz";
const DISCORD_URL = "https://discord.gg/여기에디스코드초대코드";
const CHECK_LIVE_STATUS = false; // true로 바꾸면 mcsrvstat.us API로 실시간 상태를 가져옴

// ------------------------------------------------------------
// 사운드 매니저
// ------------------------------------------------------------
const SFX = {
  hover: new Audio("sounds/hover.mp3"),
  click: new Audio("sounds/click.mp3"),
  press: new Audio("sounds/press.mp3"),
  dragdrop: new Audio("sounds/dragdrop.mp3"),
};
SFX.hover.volume = 0.16;
SFX.click.volume = 0.28;
SFX.press.volume = 0.34;
SFX.dragdrop.volume = 0.30;

let soundEnabled = localStorage.getItem("ro_sound") !== "off";

function playSfx(name){
  if (!soundEnabled) return;
  const base = SFX[name];
  if (!base) return;
  const node = base.cloneNode();
  node.volume = base.volume;
  node.play().catch(() => {});
}

function setSoundEnabled(on){
  soundEnabled = on;
  localStorage.setItem("ro_sound", on ? "on" : "off");
  document.querySelectorAll("[data-sound-toggle]").forEach(btn => {
    btn.classList.toggle("muted", !on);
    btn.setAttribute("aria-pressed", String(!on));
    btn.title = on ? "효과음 끄기" : "효과음 켜기";
  });
}

// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-addr]").forEach(el => el.textContent = SERVER_ADDRESS);
  document.querySelectorAll("[data-discord]").forEach(el => el.href = DISCORD_URL);

  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(SERVER_ADDRESS);
      playSfx("dragdrop");
      const old = btn.textContent;
      btn.textContent = btn.dataset.copiedText || "복사됨";
      setTimeout(() => btn.textContent = old, 1500);
    });
  });

  document.querySelectorAll("a, nav.primary a, .foot-links a").forEach(el => {
    if (el.hasAttribute("data-copy")) return;
    el.addEventListener("mouseenter", () => playSfx("hover"));
    el.addEventListener("click", () => playSfx("click"));
  });

  document.querySelectorAll(".btn-primary, .btn-ghost, .price-card button, #searchBtn").forEach(el => {
    el.addEventListener("mouseenter", () => playSfx("hover"));
    el.addEventListener("click", () => playSfx("press"));
  });

  document.querySelectorAll(".feature-card, .price-card, .connect-card").forEach(el => {
    el.addEventListener("mouseenter", () => playSfx("hover"));
  });

  document.querySelectorAll("[data-sound-toggle]").forEach(btn => {
    btn.addEventListener("click", () => setSoundEnabled(!soundEnabled));
  });
  setSoundEnabled(soundEnabled);

  updateStatus();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: .15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  initEmbers();
});

async function updateStatus(){
  const pill = document.getElementById("statusPill");
  const text = document.getElementById("statusText");
  const players = document.getElementById("playerCount");
  if (!pill || !text) return;

  if (!CHECK_LIVE_STATUS) {
    text.textContent = "접속 정보는 상단 서버 주소를 확인하세요";
    return;
  }
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`);
    const data = await res.json();
    if (data.online) {
      pill.classList.add("online");
      text.textContent = `온라인 · ${data.players?.online ?? 0}명 접속중`;
      if (players) players.textContent = `${data.players?.online ?? 0}명`;
    } else {
      pill.classList.add("offline");
      text.textContent = "오프라인";
      if (players) players.textContent = "0명";
    }
  } catch (e) {
    text.textContent = "상태를 불러올 수 없습니다";
  }
}

// ------------------------------------------------------------
// 히어로 배경의 은은한 불씨(ember) 파티클 - 대장간/용접 컨셉의 시그니처 연출
// ------------------------------------------------------------
function initEmbers(){
  const canvas = document.getElementById("emberCanvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let w, h, particles;

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function makeParticle(){
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      r: 1 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      alpha: 0.15 + Math.random() * 0.35,
    };
  }
  function init(){
    resize();
    particles = Array.from({ length: 34 }, makeParticle);
  }
  function tick(){
    ctx.clearRect(0, 0, w, h);
    for (const p of particles){
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10){ Object.assign(p, makeParticle(), { y: h + 10 }); }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 154, 77, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  init();
  window.addEventListener("resize", resize);
  tick();
}
