// ===== Game Constants =====
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const ENEMY_SPEED = 2;
const COIN_VALUE = 10;
const ENEMY_DEFEAT_SCORE = 100;

// ===== Game State =====
let canvas, ctx;
let gameState = 'start'; // 'start', 'playing', 'gameOver', 'win'
let score = 0;
let coins = 0;
let lives = 3;
let camera = { x: 0, y: 0 };
let keys = {};
let particles = [];
let levelWidth = 5000;

// ===== Player Object =====
const player = {
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
    jumpCount: 0,
    maxJumps: 2,
    onGround: false,
    color: '#ff6b6b',
    direction: 1 // 1 = right, -1 = left
};

// ===== Game Objects Arrays =====
let platforms = [];
let enemies = [];
let coinsArray = [];
let powerUps = [];

// ===== Initialize Game =====
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Event Listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.getElementById('playAgainButton').addEventListener('click', restartGame);

    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space' && gameState === 'playing') {
            e.preventDefault();
            jump();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    createLevel();
}

// ===== Start Game =====
function startGame() {
    gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    resetGame();
    gameLoop();
}

// ===== Reset Game =====
function resetGame() {
    score = 0;
    coins = 0;
    lives = 3;
    camera.x = 0;
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    particles = [];

    createLevel();
    updateUI();
}

// ===== Restart Game =====
function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    startGame();
}

// ===== Create Level =====
function createLevel() {
    platforms = [];
    enemies = [];
    coinsArray = [];
    powerUps = [];

    // Ground
    platforms.push({ x: 0, y: 500, width: levelWidth, height: 76, color: '#2d5016', type: 'ground' });

    // Platforms
    for (let i = 0; i < 30; i++) {
        const x = 200 + i * 200 + Math.random() * 100;
        const y = 350 - Math.random() * 200;
        const width = 100 + Math.random() * 100;
        platforms.push({ x, y, width, height: 20, color: '#8b4513', type: 'platform' });

        // Add coins on platforms
        if (Math.random() > 0.5) {
            coinsArray.push({
                x: x + width / 2 - 15,
                y: y - 40,
                width: 30,
                height: 30,
                collected: false,
                rotation: 0
            });
        }
    }

    // Floating platforms
    for (let i = 0; i < 20; i++) {
        const x = 300 + i * 250;
        const y = 150 + Math.sin(i) * 50;
        platforms.push({ x, y, width: 80, height: 15, color: '#ff9800', type: 'floating' });
    }

    // Enemies
    for (let i = 0; i < 15; i++) {
        const x = 400 + i * 350;
        enemies.push({
            x,
            y: 450,
            width: 35,
            height: 35,
            velocityX: ENEMY_SPEED,
            color: '#9c27b0',
            type: 'walker',
            alive: true,
            direction: 1
        });
    }

    // Flying enemies
    for (let i = 0; i < 10; i++) {
        const x = 600 + i * 450;
        const y = 200 + Math.random() * 100;
        enemies.push({
            x,
            y,
            startY: y,
            width: 35,
            height: 35,
            velocityY: 1,
            color: '#e91e63',
            type: 'flyer',
            alive: true
        });
    }

    // Power-ups
    for (let i = 0; i < 5; i++) {
        const x = 800 + i * 900;
        const y = 300;
        powerUps.push({
            x,
            y,
            width: 30,
            height: 30,
            collected: false,
            type: 'star',
            rotation: 0
        });
    }

    // Goal flag
    platforms.push({
        x: levelWidth - 200,
        y: 400,
        width: 50,
        height: 100,
        color: '#4caf50',
        type: 'goal'
    });
}

// ===== Game Loop =====
function gameLoop() {
    if (gameState !== 'playing') return;

    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ===== Update =====
function update() {
    // Player movement
    player.velocityX = 0;

    if (keys['ArrowLeft']) {
        player.velocityX = -MOVE_SPEED;
        player.direction = -1;
    }
    if (keys['ArrowRight']) {
        player.velocityX = MOVE_SPEED;
        player.direction = 1;
    }

    // Apply gravity
    player.velocityY += GRAVITY;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Check platform collisions
    player.onGround = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (platform.type === 'goal') {
                winGame();
                return;
            }

            // Landing on platform from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.jumping = false;
                player.jumpCount = 0;
                player.onGround = true;
            }
        }
    });

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > levelWidth - player.width) player.x = levelWidth - player.width;
    if (player.y > CANVAS_HEIGHT) {
        loseLife();
    }

    // Update camera
    camera.x = player.x - CANVAS_WIDTH / 3;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levelWidth - CANVAS_WIDTH) camera.x = levelWidth - CANVAS_WIDTH;

    // Update enemies
    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        if (enemy.type === 'walker') {
            enemy.x += enemy.velocityX * enemy.direction;

            // Turn around at edges
            if (enemy.x < 0 || enemy.x > levelWidth) {
                enemy.direction *= -1;
            }

            // Check platform edges
            let onPlatform = false;
            platforms.forEach(platform => {
                if (checkCollision(enemy, platform)) {
                    onPlatform = true;
                }
            });
        } else if (enemy.type === 'flyer') {
            enemy.y += enemy.velocityY;
            if (enemy.y < enemy.startY - 50 || enemy.y > enemy.startY + 50) {
                enemy.velocityY *= -1;
            }
        }

        // Check player collision with enemy
        if (checkCollision(player, enemy)) {
            // Player jumping on enemy
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + 10) {
                enemy.alive = false;
                player.velocityY = JUMP_FORCE / 2;
                score += ENEMY_DEFEAT_SCORE;
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                updateUI();
            } else {
                loseLife();
            }
        }
    });

    // Update coins
    coinsArray.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            coins++;
            score += COIN_VALUE;
            createParticles(coin.x + coin.width / 2, coin.y + coin.height / 2, '#ffd700');
            updateUI();
        }
        coin.rotation += 0.05;
    });

    // Update power-ups
    powerUps.forEach(powerUp => {
        if (!powerUp.collected && checkCollision(player, powerUp)) {
            powerUp.collected = true;
            score += 200;
            lives = Math.min(lives + 1, 5);
            createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, '#ffe66d');
            updateUI();
        }
        powerUp.rotation += 0.1;
    });

    // Update particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life--;
        return p.life > 0;
    });
}

// ===== Render =====
function render() {
    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds
    drawClouds();

    // Save context and apply camera
    ctx.save();
    ctx.translate(-camera.x, 0);

    // Draw platforms
    platforms.forEach(platform => {
        if (platform.type === 'goal') {
            // Draw goal flag
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, 10, platform.height);
            ctx.beginPath();
            ctx.moveTo(platform.x + 10, platform.y);
            ctx.lineTo(platform.x + 50, platform.y + 20);
            ctx.lineTo(platform.x + 10, platform.y + 40);
            ctx.closePath();
            ctx.fill();
        } else if (platform.type === 'ground') {
            // Draw ground with grass
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#4a7c1f';
            for (let i = 0; i < platform.width; i += 20) {
                ctx.fillRect(platform.x + i, platform.y - 5, 15, 5);
            }
        } else {
            // Draw regular platform
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
    });

    // Draw coins
    coinsArray.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
            ctx.rotate(coin.rotation);
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffed4e';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#ff9800';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('¥', 0, 0);
            ctx.restore();
        }
    });

    // Draw power-ups
    powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
            ctx.save();
            ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            ctx.rotate(powerUp.rotation);
            drawStar(0, 0, 5, powerUp.width / 2, powerUp.width / 4, '#ffe66d');
            ctx.restore();
        }
    });

    // Draw enemies
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.fillStyle = enemy.color;
            if (enemy.type === 'walker') {
                // Draw walker enemy
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.fillStyle = '#fff';
                ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
                ctx.fillRect(enemy.x + 20, enemy.y + 8, 8, 8);
            } else {
                // Draw flyer enemy
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
                ctx.fill();
                // Wings
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.ellipse(enemy.x, enemy.y + enemy.height / 2, 15, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.ellipse(enemy.x + enemy.width, enemy.y + enemy.height / 2, 15, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 8, player.y + 8, 10, 10);
    ctx.fillRect(player.x + 22, player.y + 8, 10, 10);
    ctx.fillStyle = '#000';
    const eyeOffset = player.direction === 1 ? 5 : -5;
    ctx.fillRect(player.x + 12 + eyeOffset, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 26 + eyeOffset, player.y + 12, 4, 4);

    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    ctx.restore();
}

// ===== Draw Clouds =====
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 250 - camera.x * 0.3) % CANVAS_WIDTH;
        const y = 50 + i * 30;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== Draw Star =====
function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// ===== Jump =====
function jump() {
    if (player.jumpCount < player.maxJumps) {
        player.velocityY = JUMP_FORCE;
        player.jumping = true;
        player.jumpCount++;

        // Visual feedback for double jump
        if (player.jumpCount === 2) {
            createParticles(player.x + player.width / 2, player.y + player.height, '#4ecdc4');
        }
    }
}

// ===== Collision Detection =====
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// ===== Create Particles =====
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 5 + 2,
            color,
            life: 30
        });
    }
}

// ===== Lose Life =====
function loseLife() {
    lives--;
    updateUI();

    if (lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        player.x = 100;
        player.y = 300;
        player.velocityX = 0;
        player.velocityY = 0;
        camera.x = 0;
    }
}

// ===== Game Over =====
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCoins').textContent = coins;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// ===== Win Game =====
function winGame() {
    gameState = 'win';
    document.getElementById('winScore').textContent = score;
    document.getElementById('winCoins').textContent = coins;
    document.getElementById('winScreen').classList.remove('hidden');
}

// ===== Update UI =====
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;

    let livesDisplay = '';
    for (let i = 0; i < lives; i++) {
        livesDisplay += '❤️';
    }
    document.getElementById('lives').textContent = livesDisplay;
}

// ===== Initialize on load =====
window.addEventListener('load', init);
