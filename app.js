document.addEventListener('DOMContentLoaded', () => {
    // 画面要素を取得
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameContainer = document.getElementById('game-container');
    
    // ゲーム要素を取得
    const player = document.getElementById('player');
    const scoreElement = document.getElementById('score');
    const lostUnitsElement = document.getElementById('lost-units');
    const timerElement = document.getElementById('timer');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const finalLostUnitsElement = document.getElementById('final-lost-units');
    const finalResultMessage = document.getElementById('final-result-message');
    const restartButton = document.getElementById('restart-button');

    const gameContainerWidth = 500;
    const playerWidth = 80;

    // ゲームの状態を管理する変数
    let score, lostUnits, timeLeft;
    let animationFrameId, timerInterval, circleInterval;
    let bossCreated; 

    // プレイヤーの動きを管理する変数
    let currentPlayerX; 
    let targetPlayerX;
    const easingFactor = 0.1;
    const keysPressed = {};
    const playerSpeed = 10;

    // --- イベントリスナーの設定 ---
    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        runGame();
    });

    restartButton.addEventListener('click', () => {
        gameOverElement.style.display = 'none';
        runGame();
    });

    gameContainer.addEventListener('mousemove', (e) => {
        if (timeLeft > 0) {
            let mouseX = e.clientX - gameContainer.getBoundingClientRect().left;
            targetPlayerX = mouseX - playerWidth / 2;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            keysPressed[e.key] = true;
        }
    });
    document.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });

    // --- ゲームロジック関数 ---

    function isOverlapping(newCircleRect) {
        const existingCircles = document.querySelectorAll('.circle');
        for (const circle of existingCircles) {
            const existingRect = {
                left: circle.offsetLeft, top: circle.offsetTop,
                right: circle.offsetLeft + circle.offsetWidth,
                bottom: circle.offsetTop + circle.offsetHeight
            };
            if (
                newCircleRect.left < existingRect.right &&
                newCircleRect.right > existingRect.left &&
                newCircleRect.top < existingRect.bottom &&
                newCircleRect.bottom > existingRect.top
            ) {
                return true;
            }
        }
        return false;
    }

    function createCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        let speed;
        const circleSize = 45;

        let startX;
        let positionFound = false;
        for (let i = 0; i < 10; i++) {
            const potentialX = Math.random() * (gameContainerWidth - circleSize);
            const newRect = {
                left: potentialX, top: -50,
                right: potentialX + circleSize, bottom: -50 + circleSize
            };
            if (!isOverlapping(newRect)) {
                startX = potentialX;
                positionFound = true;
                break;
            }
        }
        if (!positionFound) return;

        const rand = Math.random();
        if (rand < 0.1) {
            circle.textContent = '☠';
            circle.classList.add('danger');
            circle.dataset.type = 'danger';
            speed = Math.random() * 5 + 3;
        } else if (rand < 0.25) {
            circle.textContent = '楽単';
            circle.classList.add('gold');
            speed = Math.random() * 3 + 2.5;
        } else if (rand < 0.4) {
            circle.textContent = '難単';
            circle.classList.add('blue');
            speed = Math.random() * 4 + 8;
        } else {
            circle.textContent = '単位';
            speed = Math.random() * 5 + 3;
        }
        
        if (!circle.dataset.type) {
            circle.dataset.points = 2;
        }
        
        circle.style.left = `${startX}px`;
        circle.dataset.speed = speed;
        gameContainer.appendChild(circle);
    }

    function createBossCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle', 'boss');
        circle.textContent = '教育方法学';
        circle.dataset.points = 2;
        circle.dataset.speed = 4;
        const bossSize = 90;
        circle.style.left = `${(gameContainerWidth - bossSize) / 2}px`;
        gameContainer.appendChild(circle);
    }

    function gameLoop() {
        if (keysPressed.ArrowLeft) {
            targetPlayerX -= playerSpeed;
        }
        if (keysPressed.ArrowRight) {
            targetPlayerX += playerSpeed;
        }

        targetPlayerX = Math.max(0, Math.min(targetPlayerX, gameContainerWidth - playerWidth));

        currentPlayerX += (targetPlayerX - currentPlayerX) * easingFactor;
        player.style.left = `${currentPlayerX}px`;

        document.querySelectorAll('.circle').forEach(circle => {
            const currentTop = parseFloat(circle.style.top || -100);
            const speed = parseFloat(circle.dataset.speed);
            circle.style.top = `${currentTop + speed}px`;

            const circleRect = circle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            if (
                circleRect.bottom > playerRect.top &&
                circleRect.top < playerRect.bottom &&
                circleRect.right > playerRect.left &&
                circleRect.left < playerRect.right
            ) {
                if (circle.dataset.type === 'danger') {
                    score -= 2;
                    lostUnits += 2;
                } else {
                    score += parseInt(circle.dataset.points || 1);
                }
                
                scoreElement.textContent = `獲得単位: ${score}`;
                lostUnitsElement.textContent = `落単数: ${lostUnits}`;
                circle.remove();
            } else if (currentTop > gameContainer.clientHeight) {
                if (circle.dataset.type !== 'danger') {
                    lostUnits += 2;
                    lostUnitsElement.textContent = `落単数: ${lostUnits}`;
                }
                circle.remove();
            }
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function runGame() {
        score = 0;
        lostUnits = 0;
        timeLeft = 15;
        bossCreated = false;

        currentPlayerX = (gameContainerWidth - playerWidth) / 2;
        targetPlayerX = currentPlayerX;
        player.style.left = `${currentPlayerX}px`;

        scoreElement.textContent = `獲得単位: ${score}`;
        lostUnitsElement.textContent = `落単数: ${lostUnits}`;
        timerElement.textContent = `残り時間: ${timeLeft}秒`;
        
        finalResultMessage.textContent = '';
        finalResultMessage.className = '';

        clearInterval(timerInterval);
        clearInterval(circleInterval);
        cancelAnimationFrame(animationFrameId);
        document.querySelectorAll('.circle').forEach(circle => circle.remove());
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `残り時間: ${timeLeft}秒`;
            if (timeLeft === 3 && !bossCreated) {
                createBossCircle();
                bossCreated = true;
            }
            if (timeLeft <= 0) {
                gameOver();
            }
        }, 1000);

        circleInterval = setInterval(createCircle, 480);
        gameLoop();
    }

    function gameOver() {
        clearInterval(timerInterval);
        clearInterval(circleInterval);
        cancelAnimationFrame(animationFrameId);
        
        keysPressed.ArrowLeft = false;
        keysPressed.ArrowRight = false;
        
        finalScoreElement.textContent = `獲得単位: ${score}`;
        finalLostUnitsElement.textContent = `落単数: ${lostUnits}`;

        if (score > 30) {
            finalResultMessage.textContent = '🎉 進級 🎉';
            finalResultMessage.classList.add('happy');
        } else {
            finalResultMessage.textContent = '😢 留年 😢';
            finalResultMessage.classList.add('sad');
        }

        gameOverElement.style.display = 'block';
    }
});
