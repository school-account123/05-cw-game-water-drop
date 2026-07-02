let gameRunning = false;
let dropMaker;
let countdownTimer;
let collisionTimer;
let milestoneTimer;
let score = 0;
let timeLeft = 30;

const gameContainer = document.getElementById("game-container");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const bucket = document.getElementById("bucket");
const milestoneNotification = document.getElementById("milestone-notification");
const difficultySelect = document.getElementById("difficulty-select");

let currentDifficulty = "Easy";
const difficultySettings = {
  Easy: { dropInterval: 900, durationMin: 4.2, durationMax: 5.2 },
  Medium: { dropInterval: 700, durationMin: 3.2, durationMax: 4.2 },
  Hard: { dropInterval: 500, durationMin: 2.2, durationMax: 3.2 },
};

difficultySelect.addEventListener("change", (event) => {
  currentDifficulty = event.target.value;
});

function updateScore() {
  scoreEl.textContent = score;
}

function updateTimer() {
  timeEl.textContent = timeLeft;
}

function showNotification(message) {
  if (!milestoneNotification) return;
  milestoneNotification.textContent = message;
  milestoneNotification.classList.add("show");

  if (milestoneTimer) {
    clearTimeout(milestoneTimer);
  }

  milestoneTimer = setTimeout(() => {
    milestoneNotification.classList.remove("show");
  }, 2200);
}

function checkMilestone() {
  const milestones = [10, 15, 20, 30];

  if (milestones.includes(score)) {
    showNotification(`Congratulations! You reached ${score} points!`);
  }
}

function clearDrops() {
  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdownTimer);
  clearInterval(collisionTimer);
  clearDrops();
  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
}

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTimer();
  clearDrops();
  startBtn.disabled = true;
  startBtn.textContent = "Game Running";

  const { dropInterval } = difficultySettings[currentDifficulty];
  dropMaker = setInterval(createDrop, dropInterval);
  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  collisionTimer = setInterval(checkCollisions, 50);
}

function stopGame() {
  endGame();
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTimer();
}

function createDrop() {
  const createSingleDrop = (isBadDrop = false) => {
    const drop = document.createElement("div");
    drop.className = isBadDrop ? "water-drop bad-drop" : "water-drop";

    const initialSize = isBadDrop ? 30 : 60;
    const sizeMultiplier = Math.random() * 0.8 + 0.5;
    const size = initialSize * sizeMultiplier;
    drop.style.width = drop.style.height = `${size}px`;

    const gameWidth = gameContainer.offsetWidth;
    const xPosition = Math.random() * Math.max(1, gameWidth - size);
    drop.style.left = `${xPosition}px`;
    const settings = difficultySettings[currentDifficulty];
    const duration = settings.durationMin + Math.random() * (settings.durationMax - settings.durationMin);
    drop.style.animationDuration = `${duration.toFixed(2)}s`;

    gameContainer.appendChild(drop);

    drop.addEventListener("animationend", () => {
      if (drop.isConnected) {
        drop.remove();
      }
    });
  };

  createSingleDrop(false);

  if (Math.random() < 0.25) {
    createSingleDrop(true);
  }
}

function moveBucket(event) {
  const rect = gameContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const bucketWidth = bucket.offsetWidth;
  const maxLeft = rect.width - bucketWidth;
  const nextLeft = Math.max(0, Math.min(x - bucketWidth / 2, maxLeft));

  bucket.style.left = `${nextLeft}px`;
}

function checkCollisions() {
  const bucketRect = bucket.getBoundingClientRect();
  const drops = document.querySelectorAll(".water-drop");

  drops.forEach((drop) => {
    const dropRect = drop.getBoundingClientRect();
    const overlaps = !(
      dropRect.right < bucketRect.left ||
      dropRect.left > bucketRect.right ||
      dropRect.bottom < bucketRect.top ||
      dropRect.top > bucketRect.bottom
    );

    if (overlaps) {
      if (drop.classList.contains("bad-drop")) {
        score = Math.max(0, score - 1);
      } else {
        score += 1;
      }

      updateScore();
      checkMilestone();
      drop.remove();
    }
  });
}

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
gameContainer.addEventListener("pointermove", moveBucket);

updateScore();
updateTimer();
