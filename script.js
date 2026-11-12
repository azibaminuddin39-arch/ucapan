let audioCtx = null;
let isPlaying = false;
let melodyTimer = null;

const melodyNotes = [
  { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 0.6 }, { f: 261.63, d: 0.6 }, { f: 349.23, d: 0.6 }, { f: 329.63, d: 1.1 },
  { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 0.6 }, { f: 261.63, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 349.23, d: 1.1 },
  { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 523.25, d: 0.6 }, { f: 440.00, d: 0.6 }, { f: 349.23, d: 0.6 }, { f: 329.63, d: 0.6 }, { f: 293.66, d: 1.1 },
  { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.25 }, { f: 440.00, d: 0.6 }, { f: 349.23, d: 0.6 }, { f: 392.00, d: 0.6 }, { f: 349.23, d: 1.2 }
];

function playNote(freq, duration) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.09, audioCtx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration * 0.95);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function startMusic() {
  if (isPlaying) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  isPlaying = true;
  updateMusicUI();

  let index = 0;
  function scheduleNext() {
    if (!isPlaying) return;
    const note = melodyNotes[index];
    playNote(note.f, note.d);
    index = (index + 1) % melodyNotes.length;
    const pause = index === 0 ? 1400 : note.d * 780;
    melodyTimer = setTimeout(scheduleNext, pause);
  }
  scheduleNext();
}

function stopMusic() {
  isPlaying = false;
  clearTimeout(melodyTimer);
  updateMusicUI();
}

function updateMusicUI() {
  const icon = document.getElementById('musicIcon');
  const label = document.getElementById('musicLabel');
  if (isPlaying) {
    icon.textContent = '♫';
    label.textContent = 'Jeda Musik';
  } else {
    icon.textContent = '♪';
    label.textContent = 'Putar Musik';
  }
}

document.getElementById('musicToggle').addEventListener('click', () => {
  if (isPlaying) stopMusic();
  else startMusic();
});

const stageEnvelope = document.getElementById('stage-envelope');
const stageCalendar = document.getElementById('stage-calendar');
const stageCelebration = document.getElementById('stage-celebration');
const envelopeBox = document.getElementById('envelopeBox');

function showStage(targetStage) {
  [stageEnvelope, stageCalendar, stageCelebration].forEach(s => s.classList.remove('active'));
  targetStage.classList.add('active');
}

let envelopeOpened = false;
function handleOpenEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  envelopeBox.classList.add('open');
  startMusic();

  setTimeout(() => {
    showStage(stageCalendar);
  }, 1350);
}

envelopeBox.addEventListener('click', handleOpenEnvelope);
envelopeBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') handleOpenEnvelope();
});

function goToCelebration() {
  showStage(stageCelebration);
  initSpringScene();
}

document.getElementById('toCelebrationBtn').addEventListener('click', goToCelebration);
document.getElementById('date30').addEventListener('click', goToCelebration);

const candleBox = document.getElementById('candleBox');
const candleFlame = document.getElementById('candleFlame');
const candleHint = document.getElementById('candleHint');
let candleBlown = false;

candleBox.addEventListener('click', () => {
  candleBlown = !candleBlown;
  if (candleBlown) {
    candleFlame.classList.add('blown-out');
    candleHint.textContent = 'Selamat ulang tahun ke-18, Alya! ✨ (Ketuk lagi untuk menyalakan)';
    spawnPetalBurst(window.innerWidth / 2, window.innerHeight * 0.45, 45);
  } else {
    candleFlame.classList.remove('blown-out');
    candleHint.textContent = 'Buat harapan & ketuk lilin untuk meniupnya';
  }
});

const canvas = document.getElementById('springCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let branches = [];
let treeBlossoms = [];
let fallingPetals = [];
let sceneInitialized = false;
let growthProgress = 0;

const petalColors = ['#f7cad0', '#f2a6b3', '#d96b82', '#a82443', '#fbe3e8'];

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  if (sceneInitialized) {
    buildTree();
  }
});

function buildTree() {
  branches = [];
  treeBlossoms = [];

  const startX = width < 600 ? width * 0.22 : width * 0.25;
  const startY = height;
  const trunkLength = Math.min(height * 0.26, 175);

  function generateBranch(x, y, length, angle, widthBranch, depth) {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    branches.push({ x1: x, y1: y, x2: endX, y2: endY, width: widthBranch, depth: depth });

    if (depth <= 2) {
      const blossomCount = depth === 0 ? 7 : 4;
      for (let i = 0; i < blossomCount; i++) {
        treeBlossoms.push({
          x: endX + (Math.random() - 0.5) * 34,
          y: endY + (Math.random() - 0.5) * 34,
          size: 4 + Math.random() * 5.5,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    if (depth > 0) {
      const spread = 0.34 + Math.random() * 0.14;
      generateBranch(endX, endY, length * (0.74 + Math.random() * 0.08), angle - spread, widthBranch * 0.68, depth - 1);
      generateBranch(endX, endY, length * (0.74 + Math.random() * 0.08), angle + spread, widthBranch * 0.68, depth - 1);
      if (depth >= 4 && Math.random() > 0.45) {
        generateBranch(endX, endY, length * 0.68, angle + (Math.random() - 0.5) * 0.22, widthBranch * 0.55, depth - 2);
      }
    }
  }

  generateBranch(startX, startY, trunkLength, -Math.PI / 2 + 0.08, 13, 6);
}

function createPetal(x, y, burst = false) {
  return {
    x: x !== undefined ? x : Math.random() * width,
    y: y !== undefined ? y : -20 - Math.random() * height * 0.5,
    size: 6 + Math.random() * 7,
    speedY: burst ? (Math.random() - 0.3) * 4 : 0.8 + Math.random() * 1.4,
    speedX: burst ? (Math.random() - 0.5) * 6 : -0.4 + Math.random() * 1.1,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.05,
    swayOffset: Math.random() * Math.PI * 2,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
    opacity: 0.78 + Math.random() * 0.22
  };
}

function spawnPetalBurst(x, y, count = 25) {
  for (let i = 0; i < count; i++) {
    fallingPetals.push(createPetal(x, y, true));
  }
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;

  ctx.beginPath();
  ctx.moveTo(0, -p.size / 2);
  ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.8, p.size * 0.9, p.size * 0.4, 0, p.size);
  ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.4, -p.size * 0.8, -p.size * 0.8, 0, -p.size / 2);
  ctx.fill();
  ctx.restore();
}

function animateSpring(time) {
  ctx.clearRect(0, 0, width, height);

  if (growthProgress < 1) {
    growthProgress = Math.min(1, growthProgress + 0.014);
  }

  const sway = Math.sin(time * 0.0012) * 3.5;
  const maxDepthToDraw = Math.floor((1 - growthProgress) * 7);

  branches.forEach(b => {
    if (b.depth >= maxDepthToDraw) {
      const swayFactor = (7 - b.depth) * 0.45;
      ctx.beginPath();
      ctx.moveTo(b.x1 + sway * (swayFactor * 0.4), b.y1);
      ctx.lineTo(b.x2 + sway * swayFactor, b.y2);
      ctx.strokeStyle = '#29070e';
      ctx.lineWidth = b.width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  });

  if (growthProgress > 0.45) {
    const blossomAlpha = Math.min(1, (growthProgress - 0.45) * 1.8);
    treeBlossoms.forEach(bl => {
      const pulse = Math.sin(time * 0.002 + bl.phase) * 0.8;
      ctx.save();
      ctx.globalAlpha = blossomAlpha * 0.92;
      ctx.fillStyle = bl.color;
      ctx.beginPath();
      ctx.arc(bl.x + sway * 2.4, bl.y, Math.max(2, bl.size + pulse), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  for (let i = fallingPetals.length - 1; i >= 0; i--) {
    const p = fallingPetals[i];
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(time * 0.0015 + p.swayOffset) * 0.55;
    p.angle += p.spin;

    if (p.speedY < 0.8) p.speedY += 0.04;
    if (Math.abs(p.speedX) > 1.2) p.speedX *= 0.97;

    drawPetal(p);

    if (p.y > height + 25) {
      if (fallingPetals.length > 65) {
        fallingPetals.splice(i, 1);
      } else {
        fallingPetals[i] = createPetal();
      }
    }
  }

  requestAnimationFrame(animateSpring);
}

function initSpringScene() {
  if (!sceneInitialized) {
    sceneInitialized = true;
    buildTree();
    for (let i = 0; i < 55; i++) {
      const p = createPetal();
      p.y = Math.random() * height;
      fallingPetals.push(p);
    }
    requestAnimationFrame(animateSpring);
  } else {
    growthProgress = 0;
  }
}

canvas.addEventListener('click', (e) => {
  spawnPetalBurst(e.clientX, e.clientY, 20);
});

document.getElementById('burstPetalsBtn').addEventListener('click', () => {
  spawnPetalBurst(width * 0.5, height * 0.3, 45);
});

document.getElementById('replayBtn').addEventListener('click', () => {
  envelopeOpened = false;
  envelopeBox.classList.remove('open');
  candleBlown = false;
  candleFlame.classList.remove('blown-out');
  candleHint.textContent = 'Buat harapan & ketuk lilin untuk meniupnya';
  showStage(stageEnvelope);
});
// Menghentikan musik otomatis saat halaman disembunyikan / ditinggalkan
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isPlaying) {
    stopMusic(); // Menghentikan melodi kotak musik
  }
});
