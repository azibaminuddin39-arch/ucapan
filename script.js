const canvas = document.getElementById('sakuraCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Kelas untuk masing-masing kelopak bunga musim semi
class Petal {
    constructor(isBurst = false) {
        this.reset(isBurst);
    }

    reset(isBurst = false) {
        // Jika dipicu dari tombol, muncul dari area tengah atas
        this.x = isBurst ? (width / 2) + (Math.random() * 200 - 100) : Math.random() * width;
        this.y = isBurst ? (height / 2) - 50 : Math.random() * -height;
        this.size = Math.random() * 9 + 7; // Ukuran kelopak
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1.5 - 0.5;
        this.angle = Math.random() * 360;
        this.spin = Math.random() * 2 - 1;
        this.sway = Math.random() * 0.03 + 0.01;
        this.swayStep = Math.random() * Math.PI * 2;

        // Variasi warna pink lembut musim semi
        const colors = [
            'rgba(255, 183, 197, 0.85)',
            'rgba(255, 194, 209, 0.9)',
            'rgba(255, 143, 171, 0.8)',
            'rgba(255, 229, 236, 0.9)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.swayStep += this.sway;
        this.y += this.speedY;
        // Gerakan melayang tertiup angin
        this.x += this.speedX + Math.sin(this.swayStep) * 1.2;
        this.angle += this.spin;

        // Jika keluar layar bawah atau samping, kembalikan ke atas
        if (this.y > height + 20 || this.x > width + 30 || this.x < -30) {
            this.reset(false);
            this.y = -15;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.angle * Math.PI) / 180);

        // Menggambar bentuk kelopak bunga sakura
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            this.size / 2, -this.size / 2,
            this.size, this.size / 3,
            0, this.size
        );
        ctx.bezierCurveTo(
            -this.size, this.size / 3,
            -this.size / 2, -this.size / 2,
            0, 0
        );
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Membuat kumpulan kelopak bunga awal
const petals = [];
const initialPetalCount = 55;

for (let i = 0; i < initialPetalCount; i++) {
    const petal = new Petal(false);
    petal.y = Math.random() * height; // Sebar merata saat pertama dimuat
    petals.push(petal);
}

// Loop animasi utama
function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw();
    }

    requestAnimationFrame(animate);
}

animate();

// Interaksi tombol "Taburkan Bunga" untuk menambah kelopak ekstra
const celebrateBtn = document.getElementById('celebrateBtn');
celebrateBtn.addEventListener('click', () => {
    for (let i = 0; i < 25; i++) {
        const burstPetal = new Petal(true);
        burstPetal.speedY = Math.random() * 2.5 + 1.2;
        burstPetal.speedX = Math.random() * 6 - 3;
        petals.push(burstPetal);
    }

    // Batasi jumlah maksimal partikel agar performa tetap ringan
    if (petals.length > 150) {
        petals.splice(0, petals.length - 150);
    }
});
