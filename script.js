// Global Variables
let currentGame = null;
let gameScore = 0;
let gameStarted = false;
let dragScore = 0;
let draggedElement = null;
let memoryScore = 0;
let moves = 0;
let timer = 0;
let gameTimer = null;
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 8;
let lastScore = 0;

// Error handling for deployment
window.addEventListener('error', function(e) {
    console.log('Error caught:', e.error);
    return true;
});

// Video error handling and initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - EcoLearn initializing...');
    
    const video = document.getElementById('bg-video');
    if (video) {
        video.addEventListener('error', function() {
            console.log('Video failed to load, using fallback background');
            video.style.display = 'none';
        });
        
        video.addEventListener('loadstart', function() {
            console.log('Video loading started');
        });
        
        video.addEventListener('canplay', function() {
            console.log('Video can play');
        });
    }
    
    // Test basic functionality
    console.log('Testing basic functions...');
    
    // Test login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        console.log('Login button found');
    } else {
        console.error('Login button not found');
    }
    
    // Test factors button
    const factorsBtn = document.getElementById('factors-button');
    if (factorsBtn) {
        console.log('Factors button found');
    } else {
        console.error('Factors button not found');
    }
    
    console.log('EcoLearn initialization complete');
});

// Game Data
const wasteItems = [
  { item: "🍌 Banana Peel", category: "organic" },
  { item: "🥤 Plastic Bottle", category: "plastic" },
  { item: "📄 Newspaper", category: "paper" },
  { item: "🍾 Glass Bottle", category: "glass" },
  { item: "🥫 Tin Can", category: "metal" },
  { item: "🍎 Apple Core", category: "organic" },
  { item: "📦 Cardboard Box", category: "paper" },
  { item: "🥛 Milk Carton", category: "paper" },
  { item: "🍇 Grape Stems", category: "organic" },
  { item: "🔋 Battery", category: "metal" },
  { item: "🍕 Pizza Box", category: "paper" },
  { item: "🥤 Soda Can", category: "metal" },
  { item: "🍯 Glass Jar", category: "glass" },
  { item: "🥬 Lettuce", category: "organic" },
  { item: "📱 Phone", category: "metal" },
  { item: "🧻 Toilet Paper", category: "paper" },
  { item: "🍊 Orange Peel", category: "organic" },
  { item: "🥤 Coffee Cup", category: "paper" },
  { item: "🍾 Wine Bottle", category: "glass" },
  { item: "🥫 Food Can", category: "metal" },
];

const memoryGameData = [
  { item: "🍌", type: "organic" },
  { item: "🥤", type: "plastic" },
  { item: "📄", type: "paper" },
  { item: "🍾", type: "glass" },
  { item: "🥫", type: "metal" },
  { item: "🍎", type: "organic" },
  { item: "📦", type: "paper" },
  { item: "🔋", type: "metal" },
];

let currentItemIndex = 0;

// Utility Functions
function showMessage(message, type) {
  const existingMessage = document.querySelector(".game-message");
  if (existingMessage) existingMessage.remove();

  const messageElement = document.createElement("div");
  messageElement.className = `game-message ${type}`;
  messageElement.textContent = message;
  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "rgba(76, 175, 80, 0.9)" : "rgba(244, 67, 54, 0.9)"
    };
    color: white;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 1.2rem;
    font-weight: bold;
    z-index: 1000;
    animation: messageSlide 0.5s ease;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  `;

  if (!document.querySelector("#message-styles")) {
    const style = document.createElement("style");
    style.id = "message-styles";
    style.textContent = `
      @keyframes messageSlide {
        0% { transform: translateX(-50%) translateY(-50px); opacity: 0; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(messageElement);
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.style.animation = "messageSlide 0.5s ease reverse";
      setTimeout(() => messageElement.remove(), 500);
    }
  }, 2000);
}

function addConfetti() {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}vw;
      z-index: 1000;
      animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }

  if (!document.querySelector("#confetti-styles")) {
    const style = document.createElement("style");
    style.id = "confetti-styles";
    style.textContent = `
      @keyframes confettiFall {
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function updateScore(scoreElementId, score) {
  const scoreElement = document.getElementById(scoreElementId);
  scoreElement.textContent = `Score: ${score}`;
  scoreElement.classList.add("updated");
  setTimeout(() => scoreElement.classList.remove("updated"), 500);
}

// Game Management
function startGame(gameType) {
  document.getElementById("game-selection").style.display = "none";
  const gameContainer = document.getElementById(gameType + "-game");
  if (gameContainer) {
    gameContainer.style.display = "block";
    currentGame = gameType;

    if (gameType === "click-sort") initClickSortGame();
    else if (gameType === "drag-drop") initDragDropGame();
    else if (gameType === "memory-match") initMemoryMatchGame();
    else if (gameType === "trash-sorter") initTrashSorterGame();
    else if (gameType === "plant-tree") initPlantTreeGame();
    else if (gameType === "save-ocean") initSaveOceanGame();
    else if (gameType === "clean-city") initCleanCityGame();
    else if (gameType === "rainwater-collector") initRainwaterCollectorGame();
    else if (gameType === "solar-panel-builder") initSolarPanelBuilderGame();
    else if (gameType === "save-the-forest") initSaveTheForestGame();
  }
}

function backToSelection() {
  document
    .querySelectorAll(".game-container")
    .forEach((game) => (game.style.display = "none"));
  document.getElementById("game-selection").style.display = "block";
  currentGame = null;
  gameScore = 0;
  gameStarted = false;
  // Clear any running timers when leaving a game
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

// Click Sort Game
function initClickSortGame() {
  gameScore = 0;
  gameStarted = false;
  currentItemIndex = 0;
  showRandomItem();
  setupClickSortListeners();
  updateScore("score", gameScore);

  // Add back button event listener
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", backToSelection);
  }
}

function showRandomItem() {
  const randomIndex = Math.floor(Math.random() * wasteItems.length);
  currentItemIndex = randomIndex;
  const currentItem = wasteItems[currentItemIndex];

  const itemElement = document.getElementById("item");
  const bins = document.querySelectorAll(".bin");

  itemElement.textContent = currentItem.item;
  itemElement.style.background = "rgba(255, 255, 255, 0.2)";
  itemElement.style.transform = "scale(1)";

  bins.forEach((bin) => bin.classList.remove("correct", "incorrect"));
}

function setupClickSortListeners() {
  // Scope to click-sort game only to avoid interfering with other games
  const bins = document.querySelectorAll("#click-sort-game .bin");
  const itemElement = document.getElementById("item");

  bins.forEach((bin) =>
    bin.addEventListener("click", () => handleBinClick(bin))
  );
  itemElement.addEventListener("click", () => {
    if (gameStarted) showRandomItem();
  });
}

function handleBinClick(clickedBin) {
  if (!gameStarted) gameStarted = true;

  const currentItem = wasteItems[currentItemIndex];
  const isCorrect = clickedBin.id === currentItem.category;
  const bins = document.querySelectorAll(".bin");
  const itemElement = document.getElementById("item");

  bins.forEach((bin) => bin.classList.remove("correct", "incorrect"));

  if (isCorrect) {
    clickedBin.classList.add("correct");
    gameScore += 10;
    showMessage("Correct! +10 points", "success");
    itemElement.style.background = "rgba(76, 175, 80, 0.3)";
    if (window.animateCorrectAnswer) {
      window.animateCorrectAnswer(clickedBin);
    }
    setTimeout(() => showRandomItem(), 1500);
  } else {
    clickedBin.classList.add("incorrect");
    gameScore = Math.max(0, gameScore - 5);
    showMessage("Wrong! -5 points", "error");
    itemElement.style.background = "rgba(244, 67, 54, 0.3)";
    if (window.animateIncorrectAnswer) {
      window.animateIncorrectAnswer(clickedBin);
    }
  }

  updateScore("score", gameScore);

  if (gameScore > 0 && gameScore % 50 === 0 && gameScore > lastScore) {
    addConfetti();
    showMessage(`🎉 ${gameScore} points! Amazing!`, "success");
    lastScore = gameScore;
  }
}

// Drag & Drop Game
function initDragDropGame() {
  dragScore = 0;
  updateScore("dragScore", dragScore);

  // Scope elements to the drag-drop game container only
  const dragDropContainer = document.getElementById("drag-drop-game");
  const wasteItems = dragDropContainer
    ? dragDropContainer.querySelectorAll(".waste")
    : document.querySelectorAll("#drag-drop-game .waste");
  const bins = dragDropContainer
    ? dragDropContainer.querySelectorAll(".bin")
    : document.querySelectorAll("#drag-drop-game .bin");

  wasteItems.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
  });

  bins.forEach((bin) => {
    bin.addEventListener("dragover", handleDragOver);
    bin.addEventListener("drop", handleDrop);
    bin.addEventListener("dragenter", handleDragEnter);
    bin.addEventListener("dragleave", handleDragLeave);
  });

  // Add back button event listener
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", backToSelection);
  }
}

function handleDragStart(e) {
  draggedElement = e.target;
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
  if (window.animateDragStart) {
    window.animateDragStart(e.target);
  }
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  draggedElement = null;
  if (window.animateDragEnd) {
    window.animateDragEnd(e.target);
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDragEnter(e) {
  e.preventDefault();
  e.target.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.target.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  // Ensure we are handling the bin element even if a child/text node is targeted
  const binEl =
    e.currentTarget ||
    (e.target && e.target.closest && e.target.closest(".bin")) ||
    e.target;
  binEl.classList.remove("drag-over");

  if (!draggedElement) return;
  const binType = binEl.getAttribute("data-type");
  const wasteType = draggedElement.getAttribute("data-type");

  if (binType === wasteType) {
    binEl.classList.add("correct-drop");
    dragScore += 10;
    showMessage("Correct! +10 points", "success");
    draggedElement.remove();
    setTimeout(() => binEl.classList.remove("correct-drop"), 1000);

    const remainingItems = document.querySelectorAll(".waste");
    if (remainingItems.length === 0) {
      setTimeout(() => {
        showMessage("🎉 All items sorted! Great job!", "success");
        addConfetti();
      }, 1000);
    }
  } else {
    binEl.classList.add("incorrect-drop");
    dragScore = Math.max(0, dragScore - 5);
    showMessage("Wrong bin! -5 points", "error");
    setTimeout(() => binEl.classList.remove("incorrect-drop"), 1000);
  }

  updateScore("dragScore", dragScore);
}

// Memory Match Game
function initMemoryMatchGame() {
  memoryScore = 0;
  moves = 0;
  timer = 0;
  matchedPairs = 0;
  flippedCards = [];
  // Clear any existing timer to avoid multiple intervals
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }

  updateMemoryUI();
  createMemoryBoard();
  startMemoryTimer();

  // Prevent duplicate listeners by cloning buttons before (re)binding
  const newGameBtnOld = document.getElementById("newGameBtn");
  const hintBtnOld = document.getElementById("hintBtn");
  if (newGameBtnOld) {
    const newGameBtn = newGameBtnOld.cloneNode(true);
    newGameBtnOld.parentNode.replaceChild(newGameBtn, newGameBtnOld);
    newGameBtn.addEventListener("click", initMemoryMatchGame);
  }
  if (hintBtnOld) {
    const hintBtn = hintBtnOld.cloneNode(true);
    hintBtnOld.parentNode.replaceChild(hintBtn, hintBtnOld);
    hintBtn.addEventListener("click", showHint);
  }

  // Add back button event listener
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", backToSelection);
  }
}

function createMemoryBoard() {
  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  const cards = [];
  memoryGameData.forEach((data, index) => {
    cards.push({ ...data, id: index * 2, pairId: index });
    cards.push({ ...data, id: index * 2 + 1, pairId: index });
  });

  const shuffledCards = cards.sort(() => Math.random() - 0.5);

  shuffledCards.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.className = "memory-card";
    cardElement.dataset.cardId = card.id;
    cardElement.dataset.pairId = card.pairId;
    cardElement.dataset.type = card.type;
    cardElement.innerHTML = "?";
    cardElement.addEventListener("click", handleCardClick);
    gameBoard.appendChild(cardElement);
  });
}

function handleCardClick(e) {
  const card = e.target;

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length >= 2
  ) {
    return;
  }

  card.classList.add("flipped");
  card.innerHTML = memoryGameData[card.dataset.pairId].item;
  flippedCards.push(card);
  if (window.animateCardFlip) {
    window.animateCardFlip(card);
  }

  if (flippedCards.length === 2) {
    moves++;
    updateMemoryUI();
    setTimeout(() => checkForMatch(), 1000);
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.pairId === card2.dataset.pairId) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    memoryScore += 20;
    matchedPairs++;
    showMessage("Match found! +20 points", "success");

    if (matchedPairs === totalPairs) {
      clearInterval(gameTimer);
      showMessage("🎉 Congratulations! You completed the game!", "success");
      addConfetti();
    }
  } else {
    card1.classList.add("wrong");
    card2.classList.add("wrong");
    memoryScore = Math.max(0, memoryScore - 5);
    showMessage("No match! -5 points", "error");

    setTimeout(() => {
      card1.classList.remove("flipped", "wrong");
      card2.classList.remove("flipped", "wrong");
      card1.innerHTML = "?";
      card2.innerHTML = "?";
    }, 1000);
  }

  flippedCards = [];
  updateMemoryUI();
}

function startMemoryTimer() {
  gameTimer = setInterval(() => {
    timer++;
    updateMemoryUI();
  }, 1000);
}

function updateMemoryUI() {
  document.getElementById("memoryScore").textContent = `Score: ${memoryScore}`;
  document.getElementById("moves").textContent = `Moves: ${moves}`;
  document.getElementById("timer").textContent = `Time: ${timer}s`;
}

function showHint() {
  if (flippedCards.length === 0) {
    const unflippedCards = document.querySelectorAll(
      ".memory-card:not(.flipped):not(.matched)"
    );
    if (unflippedCards.length > 0) {
      const randomCard =
        unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
      randomCard.style.background = "rgba(255, 255, 0, 0.3)";
      randomCard.style.borderColor = "#ffd700";

      setTimeout(() => {
        randomCard.style.background = "";
        randomCard.style.borderColor = "";
      }, 2000);

      showMessage("💡 Hint: Check the highlighted card!", "success");
    }
  }
}

// Factors Toggle
function initializeFactorsToggle() {
  const factorsButton = document.getElementById("factors-button");
  const factorSections = document.querySelectorAll(".factor-section");

  // Don't hide challenges section by default
  factorSections.forEach((s) => {
    if (s.id !== 'challenges') {
      s.style.display = "none";
    }
  });

  function toggleFactors(e) {
    if (e) {
      e.preventDefault();
      // Prevent bubbling so clicking the button doesn't also trigger the section click handler
      e.stopPropagation();
    }
    const anyHidden = Array.from(factorSections).some(
      (s) => s.style.display === "none"
    );
    factorSections.forEach((s) => {
      if (s.id === 'challenges') {
        // Always keep challenges visible
        s.style.display = "block";
      } else {
        s.style.display = anyHidden ? "block" : "none";
      }
    });
    if (anyHidden) scrollToSection("factors");
  }

  if (factorsButton) factorsButton.addEventListener("click", toggleFactors);

  // Hero CTA Explore Factors
  const heroExploreBtn = document.getElementById("cta-explore-factors");
  // Helper to explicitly set visibility for all factor sections
  function setSectionsVisibility(show) {
    factorSections.forEach((s) => {
      if (s.id === 'challenges') {
        s.style.display = 'block';
      } else {
        s.style.display = show ? 'block' : 'none';
      }
    });
  }
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener("click", () => {
      // Ensure all factor sections are visible and scroll into view
      setSectionsVisibility(true);
      scrollToSection("factors");
    });
  }

  // Make sure challenges section is always visible
  const challengesSection = document.getElementById('challenges');
  if (challengesSection) {
    challengesSection.style.display = "block";
  }

  factorSections.forEach((s) => (s.style.display = "block"));
  scrollToSection("factors");
}


// Roadmap Functions
function initializeRoadmap() {
  const milestones = document.querySelectorAll(".milestone");
  const hideBtn = document.getElementById("hide-roadmap-btn");

  milestones.forEach((milestone) => {
    milestone.addEventListener("click", () => completeMilestone(milestone));
    milestone.addEventListener("mouseenter", () => {
      if (!milestone.classList.contains("completed")) {
        milestone.style.transform = "translateY(-5px) scale(1.05)";
      }
    });
    milestone.addEventListener("mouseleave", () => {
      if (!milestone.classList.contains("completed")) {
        milestone.style.transform = "translateY(0) scale(1)";
      }
    });
  });

  if (hideBtn) {
    hideBtn.addEventListener("click", hideRoadmap);
  }
}

function completeMilestone(milestone) {
  if (milestone.classList.contains("completed")) return;

  milestone.classList.add("completed");
  completeTask("Complete a milestone", 10);
  showMessage("Milestone completed! +10 points", "success");
  if (window.animateMilestoneCompletion) {
    window.animateMilestoneCompletion(milestone);
  }
  createConfettiEffect(milestone);
  checkAllMilestonesCompleted();
}

function checkAllMilestonesCompleted() {
  const milestones = document.querySelectorAll(".milestone");
  const completed = document.querySelectorAll(".milestone.completed");

  if (milestones.length === completed.length) {
    showAllMilestonesCompleted();
  }
}

function showAllMilestonesCompleted() {
  showMessage("🎉 All milestones completed! You are an Eco-Mentor!", "success");
  addConfetti();
}

function createConfettiEffect(element) {
  const rect = element.getBoundingClientRect();
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];

  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      z-index: 1000;
      animation: confettiBurst 1s ease-out forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1000);
  }

  if (!document.querySelector("#confetti-burst-styles")) {
    const style = document.createElement("style");
    style.id = "confetti-burst-styles";
    style.textContent = `
      @keyframes confettiBurst {
        0% { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100
      }px) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function hideRoadmap() {
  const roadmap = document.getElementById("eco-roadmap");
  if (roadmap) {
    roadmap.style.display = "none";
    showMessage("Roadmap hidden! Click Factors to show again.", "success");
  }
}

function showRoadmap() {
  const roadmap = document.getElementById("eco-roadmap");
  if (roadmap) {
    roadmap.style.display = "block";
  }
}

// Task System
function completeTask(taskName, points) {
  // Allow calling with just numeric points (e.g., from challenges)
  if (typeof taskName === "number" && points === undefined) {
    points = taskName;
    taskName = "Daily Challenge";
  }

  // Ensure points is a valid number
  points = parseInt(points) || 0;

  const currentPoints = parseInt(localStorage.getItem("ecoPoints") || "0");
  const newPoints = currentPoints + points;

  localStorage.setItem("ecoPoints", newPoints.toString());
  updatePointsDisplay();

  // Show success message
  showMessage(`${taskName} completed! +${points} eco-points earned!`, "success");

  console.log(`Task completed: ${taskName}, Points: ${points}, Total: ${newPoints}`);
}

// Daily Challenge completion with button state management
function completeDailyChallenge(button, challengeName, points) {
  // Check if already completed
  if (button.classList.contains('completed')) {
    showMessage('Challenge already completed today!', 'warning');
    return;
  }

  // Complete the task
  completeTask(challengeName, points);

  // Animate button completion
  animateTaskCompletion(button);

  // Update button state after animation
  setTimeout(() => {
    button.classList.add('completed');
    button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
    button.style.background = '#4CAF50';
    button.style.cursor = 'not-allowed';
    button.disabled = true;
  }, 600);

  // Store completion in localStorage
  const today = new Date().toDateString();
  const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '{}');
  if (!completedChallenges[today]) {
    completedChallenges[today] = [];
  }
  completedChallenges[today].push(challengeName);
  localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
}

function updatePointsDisplay() {
  const points = localStorage.getItem("ecoPoints") || "0";

  // Update main points display
  const pointsElement = document.getElementById("points");
  if (pointsElement) {
    pointsElement.textContent = points;
  }

  // Update profile points display
  const profilePointsElement = document.getElementById("profile-points");
  if (profilePointsElement) {
    profilePointsElement.textContent = points;
  }

  // Update any other points displays
  const allPointsElements = document.querySelectorAll('[id*="points"]');
  allPointsElements.forEach(element => {
    if (element.id.includes('points') && (element.textContent === 'NaN' || element.textContent === '')) {
      element.textContent = points;
    }
  });

  console.log(`Points updated: ${points}`);
}

// Scroll Functions
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// Enhanced GSAP Animations
function initializeGSAPAnimations() {
  // Hero section - staggered entrance
  const heroTl = gsap.timeline();

  heroTl
    .from(".hero-content h1", {
      duration: 1.5,
      y: 100,
      opacity: 0,
      ease: "power4.out",
      transformOrigin: "center bottom"
    })
    .from(".hero-content p", {
      duration: 1.2,
      y: 60,
      opacity: 0,
      ease: "power3.out"
    }, "-=0.8")
    .from(".hero-ctas .cta-button", {
      duration: 1,
      y: 40,
      opacity: 0,
      scale: 0.9,
      ease: "back.out(1.7)",
      stagger: 0.2
    }, "-=0.6")
    .from(".explore-factors-center", {
      duration: 0.8,
      scale: 0,
      rotation: 180,
      ease: "elastic.out(1, 0.5)"
    }, "-=0.4");

  // Feature cards - wave animation
  gsap.from(".feature", {
    duration: 1.2,
    y: 80,
    opacity: 0,
    rotationX: 45,
    transformOrigin: "center bottom",
    stagger: {
      amount: 0.8,
      from: "start"
    },
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".features-grid",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  // Challenge cards - bounce entrance
  gsap.from(".challenge-card", {
    duration: 1,
    y: 100,
    opacity: 0,
    scale: 0.7,
    rotation: 5,
    stagger: {
      amount: 0.6,
      from: "center"
    },
    ease: "bounce.out",
    scrollTrigger: {
      trigger: ".challenges-grid",
      start: "top 85%"
    }
  });

  // Add hover animations
  addHoverAnimations();
}

// Interactive hover animations
function addHoverAnimations() {
  // Challenge cards hover
  document.querySelectorAll('.challenge-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1.05,
        y: -10,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1,
        y: 0,
        ease: "power2.out"
      });
    });
  });

  // Button hover effects
  document.querySelectorAll('.challenge-btn, .cta-button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        duration: 0.2,
        scale: 1.05,
        y: -2,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        duration: 0.2,
        scale: 1,
        y: 0,
        ease: "power2.out"
      });
    });
  });
}

// Enhanced task completion animation
function animateTaskCompletion(element) {
  const tl = gsap.timeline();

  // Button press effect
  tl.to(element, {
    duration: 0.1,
    scale: 0.95,
    ease: "power2.in"
  })
    // Success bounce
    .to(element, {
      duration: 0.4,
      scale: 1.1,
      backgroundColor: "#4CAF50",
      ease: "back.out(1.7)"
    })
    // Settle back
    .to(element, {
      duration: 0.3,
      scale: 1,
      ease: "power2.out"
    })
    // Icon rotation
    .from(element.querySelector('i'), {
      duration: 0.5,
      rotation: 360,
      scale: 0,
      ease: "elastic.out(1, 0.3)"
    }, "-=0.4");

  // Points popup animation
  showPointsPopup(element, 10);
}

// Points popup animation
function showPointsPopup(element, points) {
  const popup = document.createElement('div');
  popup.className = 'points-popup';
  popup.textContent = `+${points}`;
  popup.style.cssText = `
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    color: #4CAF50;
    font-weight: bold;
    font-size: 1.2rem;
    pointer-events: none;
    z-index: 1000;
  `;

  element.style.position = 'relative';
  element.appendChild(popup);

  gsap.fromTo(popup,
    { y: 0, opacity: 1, scale: 0.5 },
    {
      duration: 1.5,
      y: -50,
      opacity: 0,
      scale: 1.2,
      ease: "power2.out",
      onComplete: () => popup.remove()
    }
  );
}

// Challenge card entrance animations
function animateChallengeCards() {
  gsap.from(".challenge-card", {
    duration: 1.2,
    y: 100,
    opacity: 0,
    scale: 0.8,
    rotation: 10,
    stagger: {
      amount: 0.8,
      from: "random"
    },
    ease: "back.out(1.2)",
    scrollTrigger: {
      trigger: ".challenges-grid",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });
}

// Map reveal animation
function animateMapReveal() {
  const mapContainer = document.getElementById('challenges-map');
  if (mapContainer) {
    gsap.fromTo(mapContainer,
      {
        scale: 0.5,
        opacity: 0,
        rotationY: 90
      },
      {
        duration: 1.5,
        scale: 1,
        opacity: 1,
        rotationY: 0,
        ease: "power3.out"
      }
    );
  }
}

// Quiz category selection animation
function animateQuizSelection(category) {
  gsap.to(category, {
    duration: 0.3,
    scale: 0.95,
    ease: "power2.in",
    onComplete: () => {
      gsap.to(category, {
        duration: 0.5,
        scale: 1.05,
        backgroundColor: "#4CAF50",
        ease: "elastic.out(1, 0.3)"
      });
    }
  });
}

// Milestone animations function
function initializeMilestoneAnimations() {
  gsap.utils.toArray(".milestone").forEach((milestone, index) => {
    gsap.from(milestone, {
      scrollTrigger: {
        trigger: milestone,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      scale: 0,
      rotation: 180,
      opacity: 0,
      delay: index * 0.2,
      ease: "back.out(1.7)",
    });
  });

  // Game cards animation
  gsap.utils.toArray(".game-card").forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      y: 100,
      rotation: 10,
      opacity: 0,
      delay: index * 0.15,
      ease: "power3.out",
    });
  });

  // Gallery items animation
  gsap.utils.toArray(".gallery-item").forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      y: 100,
      opacity: 0,
      delay: index * 0.1,
      ease: "power3.out",
    });
  });

  // Innovation section animations
  gsap.utils.toArray(".loop-item").forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      scale: 0,
      rotation: 180,
      opacity: 0,
      delay: index * 0.2,
      ease: "back.out(1.7)",
    });
  });

  gsap.utils.toArray(".impact-card").forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      y: 100,
      opacity: 0,
      delay: index * 0.15,
      ease: "power3.out",
    });
  });

  gsap.utils.toArray(".stakeholder-item").forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.6,
      x: -50,
      opacity: 0,
      delay: index * 0.1,
      ease: "power3.out",
    });
  });

  gsap.utils.toArray(".scale-phase").forEach((phase, index) => {
    gsap.from(phase, {
      scrollTrigger: {
        trigger: phase,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      scale: 0,
      rotation: 360,
      opacity: 0,
      delay: index * 0.3,
      ease: "back.out(1.7)",
    });
  });

  gsap.utils.toArray(".ai-card").forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.8,
      y: 100,
      opacity: 0,
      delay: index * 0.1,
      ease: "power3.out",
    });
  });

  gsap.utils.toArray(".support-item").forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
      },
      duration: 0.6,
      y: 50,
      opacity: 0,
      delay: index * 0.1,
      ease: "power3.out",
    });
  });
}

// Enhanced hover effects with GSAP
function initializeHoverEffects() {
  // Feature cards hover
  gsap.utils.toArray(".feature-card").forEach((card) => {
    const icon = card.querySelector(".feature-icon i");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        duration: 0.3,
        y: -10,
        scale: 1.02,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.5,
        rotation: 360,
        scale: 1.2,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.5,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  // Milestone hover effects
  gsap.utils.toArray(".milestone").forEach((milestone) => {
    const icon = milestone.querySelector(".milestone-icon i");

    milestone.addEventListener("mouseenter", () => {
      gsap.to(milestone, {
        duration: 0.3,
        y: -10,
        scale: 1.05,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.8,
        rotation: 360,
        scale: 1.3,
        ease: "power2.out",
      });
    });

    milestone.addEventListener("mouseleave", () => {
      gsap.to(milestone, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.8,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  // Game cards hover
  gsap.utils.toArray(".game-card").forEach((card) => {
    const icon = card.querySelector(".game-icon");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        duration: 0.3,
        y: -10,
        scale: 1.02,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.6,
        rotation: 360,
        scale: 1.2,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.6,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  // Gallery items hover
  gsap.utils.toArray(".gallery-item").forEach((item) => {
    const img = item.querySelector("img");
    const overlay = item.querySelector(".gallery-overlay");

    item.addEventListener("mouseenter", () => {
      gsap.to(item, {
        duration: 0.3,
        y: -10,
        scale: 1.02,
        ease: "power2.out",
      });

      gsap.to(img, {
        duration: 0.5,
        scale: 1.1,
        ease: "power2.out",
      });

      gsap.to(overlay, {
        duration: 0.3,
        y: 0,
        opacity: 1,
        ease: "power2.out",
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(item, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(img, {
        duration: 0.5,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(overlay, {
        duration: 0.3,
        y: "100%",
        opacity: 0,
        ease: "power2.out",
      });
    });
  });

  // Innovation section hover effects
  gsap.utils.toArray(".loop-item").forEach((item) => {
    const icon = item.querySelector(".loop-icon i");

    item.addEventListener("mouseenter", () => {
      gsap.to(item, {
        duration: 0.3,
        y: -10,
        scale: 1.05,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.6,
        rotation: 360,
        scale: 1.3,
        ease: "power2.out",
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(item, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.6,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  gsap.utils.toArray(".impact-card").forEach((card) => {
    const icon = card.querySelector(".impact-header i");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        duration: 0.3,
        y: -10,
        scale: 1.02,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.5,
        rotation: 360,
        scale: 1.2,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.5,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  gsap.utils.toArray(".ai-card").forEach((card) => {
    const icon = card.querySelector(".ai-icon i");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        duration: 0.3,
        y: -10,
        scale: 1.02,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.6,
        rotation: 360,
        scale: 1.2,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        duration: 0.3,
        y: 0,
        scale: 1,
        ease: "power2.out",
      });

      gsap.to(icon, {
        duration: 0.6,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  // Button hover effects
  gsap.utils
    .toArray("button, .cta-button, .feature-btn, .challenge-btn")
    .forEach((button) => {
      button.addEventListener("mouseenter", () => {
        gsap.to(button, {
          duration: 0.2,
          scale: 1.05,
          ease: "power2.out",
        });
      });

      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          duration: 0.2,
          scale: 1,
          ease: "power2.out",
        });
      });
    });
}

// Enhanced game animations
function enhanceGameAnimations() {
  // Click sort game animations
  function animateCorrectAnswer(element) {
    gsap.to(element, {
      duration: 0.3,
      scale: 1.2,
      rotation: 360,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(element, {
          duration: 0.3,
          scale: 1,
          rotation: 0,
          ease: "power2.out",
        });
      },
    });
  }

  function animateIncorrectAnswer(element) {
    gsap.to(element, {
      duration: 0.1,
      x: -10,
      ease: "power2.out",
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        gsap.to(element, {
          duration: 0.3,
          x: 0,
          ease: "power2.out",
        });
      },
    });
  }

  // Memory game card flip animation
  function animateCardFlip(card) {
    gsap.to(card, {
      duration: 0.3,
      rotationY: 90,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(card, {
          duration: 0.3,
          rotationY: 0,
          ease: "power2.out",
        });
      },
    });
  }

  // Drag and drop animations
  function animateDragStart(element) {
    gsap.to(element, {
      duration: 0.2,
      scale: 1.2,
      rotation: 10,
      ease: "power2.out",
    });
  }

  function animateDragEnd(element) {
    gsap.to(element, {
      duration: 0.2,
      scale: 1,
      rotation: 0,
      ease: "power2.out",
    });
  }

  // Store animation functions globally for use in game logic
  window.animateCorrectAnswer = animateCorrectAnswer;
  window.animateIncorrectAnswer = animateIncorrectAnswer;
  window.animateCardFlip = animateCardFlip;
  window.animateDragStart = animateDragStart;
  window.animateDragEnd = animateDragEnd;
}

// Enhanced confetti with GSAP
function createGSAPConfetti() {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
    position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}vw;
      z-index: 1000;
    `;
    document.body.appendChild(confetti);

    gsap.to(confetti, {
      duration: 2 + Math.random() * 3,
      y: window.innerHeight + 100,
      rotation: 720,
      opacity: 0,
      ease: "power2.out",
      onComplete: () => confetti.remove(),
    });
  }
}

// Enhanced milestone completion animation
function animateMilestoneCompletion(milestone) {
  const icon = milestone.querySelector(".milestone-icon i");

  gsap.to(milestone, {
    duration: 0.5,
    scale: 1.2,
    ease: "back.out(1.7)",
    onComplete: () => {
      gsap.to(milestone, {
        duration: 0.3,
        scale: 1,
        ease: "power2.out",
      });
    },
  });

  gsap.to(icon, {
    duration: 1,
    rotation: 720,
    scale: 1.5,
    ease: "power2.out",
    onComplete: () => {
      gsap.to(icon, {
        duration: 0.5,
        rotation: 0,
        scale: 1,
        ease: "power2.out",
      });
    },
  });
}

// Navigation animations
function initializeNavigationAnimations() {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      gsap.to(link, {
        duration: 0.2,
        scale: 1.1,
        ease: "power2.out",
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(link, {
        duration: 0.2,
        scale: 1,
        ease: "power2.out",
      });
    });
  });
}

// Mobile menu animations
function initializeMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");

      if (navMenu.classList.contains("active")) {
        gsap.from(".nav-menu li", {
          duration: 0.3,
          x: -100,
          opacity: 0,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
    });
  }
}

// Additional missing functions
function exploreFeature(featureType) {
  showMessage(`Exploring ${featureType} feature!`, "success");
  // Add specific feature exploration logic here
}

function getStarted() {
  showMessage("Welcome to EcoLearn! Let's start your eco-journey!", "success");
  scrollToSection("challenges");
}

function scheduleDemo() {
  showMessage("Demo scheduling feature coming soon!", "success");
  scrollToSection("contact");
}

// Quiz functionality
const quizData = {
  basic: {
    title: "Basic Environmental Knowledge (Class 1-6)",
    description: "Fundamental environmental concepts for young learners",
    questions: [
      {
        question: "Which of these gives us oxygen to breathe?",
        options: ["Mountains", "Trees", "Rocks", "Cars"],
        correct: 1,
      },
      {
        question: "Which is the main source of energy on Earth?",
        options: ["The Moon", "The Sun", "Wind", "Coal"],
        correct: 1,
      },
      {
        question: "Which of these animals lives in water?",
        options: ["Dog", "Lion", "Dolphin", "Cow"],
        correct: 2,
      },
      {
        question: "Which of these is a renewable source of energy?",
        options: ["Petrol", "Solar power", "Coal", "Diesel"],
        correct: 1,
      },
      {
        question: "Which gas do humans need to breathe?",
        options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"],
        correct: 1,
      },
      {
        question: "Which of these is NOT a type of pollution?",
        options: ["Air pollution", "Water pollution", "Noise pollution", "Flower pollution"],
        correct: 3,
      },
      {
        question: "Which of these activities helps protect the environment?",
        options: ["Throwing garbage on roads", "Planting more trees", "Cutting down trees", "Wasting water"],
        correct: 1,
      },
      {
        question: "What is the process by which water turns into vapor?",
        options: ["Melting", "Freezing", "Evaporation", "Condensation"],
        correct: 2,
      },
      {
        question: "Which of these is a non-renewable resource?",
        options: ["Sunlight", "Wind", "Coal", "Rainwater"],
        correct: 2,
      },
      {
        question: "Which animal is called the 'Ship of the Desert'?",
        options: ["Horse", "Camel", "Elephant", "Cow"],
        correct: 1,
      },
      {
        question: "Which part of the plant makes food?",
        options: ["Roots", "Stem", "Leaves", "Flowers"],
        correct: 2,
      },
      {
        question: "Which of these causes water pollution?",
        options: ["Cleaning a river", "Throwing garbage into rivers", "Using filtered water", "Drinking boiled water"],
        correct: 1,
      },
      {
        question: "Which of these animals is endangered?",
        options: ["Dog", "Cat", "Tiger", "Goat"],
        correct: 2,
      },
      {
        question: "Which gas do plants release during photosynthesis?",
        options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Helium"],
        correct: 2,
      },
      {
        question: "Which of these is a natural disaster?",
        options: ["Plastic pollution", "Earthquake", "Garbage dump", "Loud noise"],
        correct: 1,
      },
      {
        question: "Which of these is a natural resource?",
        options: ["Plastic", "Coal", "Glass", "Cement"],
        correct: 1,
      },
      {
        question: "Which of these helps save water?",
        options: ["Leaving taps open", "Fixing leaking taps", "Playing with water", "Wasting water"],
        correct: 1,
      },
      {
        question: "Which type of pollution is caused by loudspeakers?",
        options: ["Water pollution", "Land pollution", "Air pollution", "Noise pollution"],
        correct: 3,
      },
      {
        question: "Which of these is a water animal?",
        options: ["Horse", "Fish", "Cat", "Dog"],
        correct: 1,
      },
      {
        question: "Which is the cleanest form of energy?",
        options: ["Solar energy", "Petrol", "Diesel", "Coal"],
        correct: 0,
      },
      {
        question: "What do we call animals that eat only plants?",
        options: ["Carnivores", "Herbivores", "Omnivores", "Insectivores"],
        correct: 1,
      },
      {
        question: "Which of these is a way to keep our surroundings clean?",
        options: ["Throwing garbage anywhere", "Burning plastic", "Using dustbins", "Cutting trees"],
        correct: 2,
      },
      {
        question: "Which of these can be recycled?",
        options: ["Old newspapers", "Food peels", "Dirty water", "Smoke"],
        correct: 0,
      },
      {
        question: "Which natural resource is used to generate hydroelectric power?",
        options: ["Sunlight", "Water", "Wind", "Coal"],
        correct: 1,
      },
      {
        question: "Which is the largest land animal?",
        options: ["Giraffe", "African Elephant", "Rhino", "Hippopotamus"],
        correct: 1,
      },
      {
        question: "Which of these helps in reducing air pollution?",
        options: ["Planting trees", "Burning garbage", "Cutting forests", "Using more cars"],
        correct: 0,
      },
      {
        question: "Which of these is biodegradable waste?",
        options: ["Plastic bottle", "Banana peel", "Glass bottle", "Metal can"],
        correct: 1,
      },
      {
        question: "Which of these helps conserve soil?",
        options: ["Deforestation", "Planting trees", "Overgrazing", "Burning crops"],
        correct: 1,
      },
      {
        question: "What do we call the natural home of animals?",
        options: ["Zoo", "Habitat", "House", "Cage"],
        correct: 1,
      },
      {
        question: "Which of these practices helps in waste management?",
        options: ["Throwing garbage in rivers", "Recycling and reusing", "Wasting resources", "Burning plastic"],
        correct: 1,
      },
    ],
  },
  intermediate: {
    title: "Intermediate Environmental Knowledge",
    description: "More detailed environmental concepts and solutions",
    questions: [
      {
        question: "Which of these causes global warming?",
        options: ["Planting more trees", "Increasing greenhouse gases", "Cleaning rivers", "Recycling waste"],
        correct: 1,
      },
      {
        question: "Which layer of the atmosphere protects us from harmful UV rays?",
        options: ["Oxygen layer", "Ozone layer", "Carbon dioxide layer", "Water vapor layer"],
        correct: 1,
      },
      {
        question: "Which of these activities causes soil erosion?",
        options: ["Planting trees", "Cutting down forests", "Building check dams", "Growing grass"],
        correct: 1,
      },
      {
        question: "Which gas is produced by vehicles that causes air pollution?",
        options: ["Oxygen", "Carbon dioxide", "Water vapor", "Helium"],
        correct: 1,
      },
      {
        question: "Which of these helps conserve water?",
        options: ["Leaving taps open", "Rainwater harvesting", "Throwing waste in rivers", "Polluting lakes"],
        correct: 1,
      },
      {
        question: "Which of these animals is on the endangered species list?",
        options: ["Dog", "Goat", "Blue Whale", "Cow"],
        correct: 2,
      },
      {
        question: "Which type of pollution is caused by honking cars and loudspeakers?",
        options: ["Air pollution", "Noise pollution", "Water pollution", "Land pollution"],
        correct: 1,
      },
      {
        question: "Which is a renewable resource of energy?",
        options: ["Natural gas", "Coal", "Sunlight", "Petrol"],
        correct: 2,
      },
      {
        question: "What is the best way to manage food waste?",
        options: ["Composting", "Burning", "Throwing on roads", "Dumping into rivers"],
        correct: 0,
      },
      {
        question: "Which of these is biodegradable waste?",
        options: ["Plastic bag", "Metal can", "Glass bottle", "Vegetable peel"],
        correct: 3,
      },
      {
        question: "Which of these is not a fossil fuel?",
        options: ["Coal", "Petroleum", "Natural gas", "Wind energy"],
        correct: 3,
      },
      {
        question: "Which practice helps to prevent water pollution?",
        options: ["Dumping waste into rivers", "Throwing plastic in oceans", "Treating sewage water before releasing it", "Cutting down trees"],
        correct: 2,
      },
      {
        question: "Which greenhouse gas is most responsible for global warming?",
        options: ["Oxygen", "Carbon dioxide", "Helium", "Nitrogen"],
        correct: 1,
      },
      {
        question: "Which of these is a clean energy source?",
        options: ["Petrol", "Solar power", "Coal", "Diesel"],
        correct: 1,
      },
      {
        question: "Which action helps protect wildlife?",
        options: ["Hunting animals", "Deforestation", "Creating wildlife sanctuaries", "Using plastic waste"],
        correct: 2,
      },
      {
        question: "What do we call the cutting down of forests?",
        options: ["Reforestation", "Afforestation", "Deforestation", "Plantation"],
        correct: 2,
      },
      {
        question: "Which of these can be recycled?",
        options: ["Smoke", "Old newspapers", "Food peels", "Air"],
        correct: 1,
      },
      {
        question: "Which is the largest source of fresh water on Earth?",
        options: ["Oceans", "Glaciers", "Rivers", "Lakes"],
        correct: 1,
      },
      {
        question: "Which natural resource is needed to generate hydroelectricity?",
        options: ["Coal", "Water", "Sunlight", "Wind"],
        correct: 1,
      },
      {
        question: "Which of these is an effect of air pollution?",
        options: ["Clear skies", "Acid rain", "More trees", "More oxygen"],
        correct: 1,
      },
      {
        question: "Which action reduces soil erosion?",
        options: ["Overgrazing animals", "Deforestation", "Planting trees", "Burning crops"],
        correct: 2,
      },
      {
        question: "Which of these practices is harmful to marine animals?",
        options: ["Throwing plastic into oceans", "Planting mangroves", "Cleaning beaches", "Coral reef conservation"],
        correct: 0,
      },
      {
        question: "Which of these is a non-renewable resource?",
        options: ["Solar energy", "Wind energy", "Petroleum", "Rainwater"],
        correct: 2,
      },
      {
        question: "Which of these steps can reduce plastic waste?",
        options: ["Recycling plastic", "Burning plastic", "Throwing it in rivers", "Burying it in soil"],
        correct: 0,
      },
      {
        question: "Which of these causes land pollution?",
        options: ["Planting trees", "Littering", "Recycling waste", "Composting"],
        correct: 1,
      },
      {
        question: "Which of these renewable resources is used in windmills?",
        options: ["Water", "Wind", "Coal", "Oil"],
        correct: 1,
      },
      {
        question: "What is the natural home of plants and animals called?",
        options: ["Shelter", "Cage", "Habitat", "Zoo"],
        correct: 2,
      },
      {
        question: "Which of these gases do humans exhale when breathing?",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"],
        correct: 1,
      },
      {
        question: "Which of these is NOT a cause of global warming?",
        options: ["Burning fossil fuels", "Cutting forests", "Planting trees", "Industrial pollution"],
        correct: 2,
      },
      {
        question: "The practice of saving and protecting natural resources is called:",
        options: ["Pollution", "Conservation", "Deforestation", "Exploitation"],
        correct: 1,
      },
    ],
  },
  advanced: {
    title: "Advanced Environmental Knowledge",
    description: "Complex environmental challenges and solutions",
    questions: [
      {
        question: "Which of these helps reduce the greenhouse effect?",
        options: ["Cutting more trees", "Burning fossil fuel", "Planting more trees", "Using more cars"],
        correct: 2,
      },
      {
        question: "Which renewable energy source uses moving water to produce electricity?",
        options: ["Wind energy", "Solar energy", "Hydropower", "Geothermal energy"],
        correct: 2,
      },
      {
        question: "Which of these activities increases soil fertility naturally?",
        options: ["Composting kitchen waste", "Throwing garbage on land", "Using plastic bags", "Cutting down forests"],
        correct: 0,
      },
      {
        question: "Which of these gases is called a greenhouse gas?",
        options: ["Nitrogen", "Oxygen", "Carbon dioxide", "Argon"],
        correct: 2,
      },
      {
        question: "Which of these is a non-biodegradable material?",
        options: ["Vegetable peels", "Paper", "Plastic bottle", "Leaves"],
        correct: 2,
      },
      {
        question: "Which type of pollution causes breathing problems like asthma?",
        options: ["Noise pollution", "Air pollution", "Water pollution", "Land pollution"],
        correct: 1,
      },
      {
        question: "Which activity causes oil spills in oceans?",
        options: ["Fishing", "Swimming", "Leakage from ships", "Coral reef planting"],
        correct: 2,
      },
      {
        question: "Which of these actions helps conserve wildlife?",
        options: ["Hunting animals", "Setting up national parks", "Cutting forests", "Throwing waste in forests"],
        correct: 1,
      },
      {
        question: "Which of these causes acid rain?",
        options: ["Rainwater harvesting", "Smoke from factories", "Planting trees", "Drinking rainwater"],
        correct: 1,
      },
      {
        question: "Which of these practices saves energy?",
        options: ["Keeping lights on during the day", "Using LED bulbs", "Leaving fans on when not needed", "Burning coal for heat"],
        correct: 1,
      },
      {
        question: "Which of these is an example of e-waste?",
        options: ["Plastic bag", "Old mobile phone", "Banana peel", "Cardboard box"],
        correct: 1,
      },
      {
        question: "Which of these is a renewable resource?",
        options: ["Coal", "Natural gas", "Wind", "Petrol"],
        correct: 2,
      },
      {
        question: "Which practice can reduce plastic pollution?",
        options: ["Burning plastic", "Using cloth bags", "Throwing plastic into oceans", "Making more plastic items"],
        correct: 1,
      },
      {
        question: "What is the term for the variety of plants and animals in an area?",
        options: ["Pollution", "Biodiversity", "Climate", "Habitat"],
        correct: 1,
      },
      {
        question: "Which of these is a natural disaster caused by heavy rainfall?",
        options: ["Forest fire", "Earthquake", "Flood", "Drought"],
        correct: 2,
      },
      {
        question: "Which of these steps can help reduce global warming?",
        options: ["Planting trees", "Burning coal", "Cutting forests", "Increasing factories"],
        correct: 0,
      },
      {
        question: "Which of these animals is an important pollinator?",
        options: ["Dog", "Cat", "Bee", "Elephant"],
        correct: 2,
      },
      {
        question: "Which of these practices saves water?",
        options: ["Using a bucket instead of a shower", "Leaving taps running", "Washing cars with a hose", "Playing water games"],
        correct: 0,
      },
      {
        question: "Which type of pollution harms marine life the most?",
        options: ["Noise pollution", "Water pollution", "Air pollution", "Land pollution"],
        correct: 1,
      },
      {
        question: "Which of these is an example of renewable energy?",
        options: ["Solar energy", "Diesel", "Petrol", "Coal"],
        correct: 0,
      },
      {
        question: "Which of these causes melting of glaciers?",
        options: ["Planting trees", "Global warming", "Recycling waste", "Rainwater harvesting"],
        correct: 1,
      },
      {
        question: "Which of these is a step towards zero waste living?",
        options: ["Using disposable plastic cups", "Using reusable bottles", "Burning garbage", "Throwing waste on roads"],
        correct: 1,
      },
      {
        question: "Which of these helps reduce land pollution?",
        options: ["Composting and recycling", "Burning waste", "Dumping garbage on land", "Cutting forests"],
        correct: 0,
      },
      {
        question: "Which of these gases is essential for plants to make food?",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"],
        correct: 1,
      },
      {
        question: "Which of these is an effect of deforestation?",
        options: ["Increased wildlife", "Soil erosion", "Cleaner air", "More rainfall"],
        correct: 1,
      },
      {
        question: "Which type of pollution is caused by bright city lights disturbing animals?",
        options: ["Land pollution", "Light pollution", "Water pollution", "Air pollution"],
        correct: 1,
      },
      {
        question: "Which of these is a way to conserve forest resources?",
        options: ["Overcutting trees", "Afforestation", "Forest burning", "Mining"],
        correct: 1,
      },
      {
        question: "Which of these is a threat to coral reefs?",
        options: ["Clean water", "Plastic waste", "Recycling waste", "Eco-tourism"],
        correct: 1,
      },
      {
        question: "Which of these can reduce electricity use at home?",
        options: ["Switching off lights when not in use", "Leaving fans running", "Using more air conditioners", "Keeping devices plugged in all the time"],
        correct: 0,
      },
      {
        question: "Which of these is the most environment-friendly action?",
        options: ["Driving everywhere by car", "Walking or cycling", "Burning garbage", "Throwing waste on roads"],
        correct: 1,
      },
    ],
  },
  level2_basic: {
    title: "Level 2 Basic (Class 7-12)",
    description: "Environmental concepts for secondary school students",
    questions: [
      {
        question: "The layer of the atmosphere that protects us from harmful UV rays is:",
        options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
        correct: 1,
      },
      {
        question: "The process of converting waste materials into reusable objects is called:",
        options: ["Reusing", "Recycling", "Composting", "Reducing"],
        correct: 1,
      },
      {
        question: "Which of these is a primary greenhouse gas?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"],
        correct: 2,
      },
      {
        question: "Which renewable energy source uses sunlight to generate electricity?",
        options: ["Wind energy", "Geothermal energy", "Solar energy", "Hydropower"],
        correct: 2,
      },
      {
        question: "The process by which plants release oxygen into the air is called:",
        options: ["Respiration", "Photosynthesis", "Evaporation", "Condensation"],
        correct: 1,
      },
      {
        question: "Which type of pollution causes hearing problems in humans?",
        options: ["Water pollution", "Air pollution", "Noise pollution", "Land pollution"],
        correct: 2,
      },
      {
        question: "Which of these is the main cause of global warming?",
        options: ["Rainfall", "Deforestation", "Greenhouse gases", "Soil erosion"],
        correct: 2,
      },
      {
        question: "Which gas is essential for human survival?",
        options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Methane"],
        correct: 2,
      },
      {
        question: "Which of these is a non-renewable energy resource?",
        options: ["Wind", "Solar", "Coal", "Geothermal"],
        correct: 2,
      },
      {
        question: "Which of these actions helps reduce air pollution?",
        options: ["Burning garbage", "Using public transport", "Using more private cars", "Cutting down trees"],
        correct: 1,
      },
      {
        question: "Which of these animals is endangered?",
        options: ["Cow", "Dog", "Tiger", "Goat"],
        correct: 2,
      },
      {
        question: "Which natural resource is most affected by oil spills?",
        options: ["Soil", "Water", "Air", "Forest"],
        correct: 1,
      },
      {
        question: "The Earth Summit held in 1992 took place in:",
        options: ["New York", "Rio de Janeiro", "London", "Paris"],
        correct: 1,
      },
      {
        question: "Which of these is an alternative to plastic bags?",
        options: ["Paper bag", "Glass", "Thermocol", "Polythene"],
        correct: 0,
      },
      {
        question: "Which of these ecosystems is the largest on Earth?",
        options: ["Desert", "Ocean", "Forest", "Grassland"],
        correct: 1,
      },
      {
        question: "Which of these gases is most responsible for ozone layer depletion?",
        options: ["Oxygen", "CFCs (Chlorofluorocarbons)", "Methane", "Nitrogen"],
        correct: 1,
      },
      {
        question: "Which practice helps conserve soil?",
        options: ["Overgrazing", "Terrace farming", "Deforestation", "Mining"],
        correct: 1,
      },
      {
        question: "The energy stored in food is a form of:",
        options: ["Mechanical energy", "Chemical energy", "Electrical energy", "Solar energy"],
        correct: 1,
      },
      {
        question: "Which of these is the main source of freshwater?",
        options: ["Oceans", "Rivers and lakes", "Underground oil", "Glaciers only"],
        correct: 1,
      },
      {
        question: "Which of these is an effect of deforestation?",
        options: ["Soil erosion", "Fresh air", "More rainfall", "Biodiversity increase"],
        correct: 0,
      },
      {
        question: "Which practice reduces waste generation?",
        options: ["Buying more packaged items", "Throwing trash everywhere", "Following 3Rs: Reduce, Reuse, Recycle", "Burning waste"],
        correct: 2,
      },
      {
        question: "Which form of energy comes from heat inside the Earth?",
        options: ["Solar", "Geothermal", "Wind", "Nuclear"],
        correct: 1,
      },
      {
        question: "Which human activity causes desertification?",
        options: ["Tree plantation", "Excessive farming and deforestation", "Water harvesting", "Rainwater storage"],
        correct: 1,
      },
      {
        question: "Which of these gases is released during burning of fossil fuels?",
        options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correct: 0,
      },
      {
        question: "Which renewable energy is produced by wind turbines?",
        options: ["Geothermal energy", "Hydropower", "Wind energy", "Solar energy"],
        correct: 2,
      },
      {
        question: "Which of these is an example of natural resource conservation?",
        options: ["Hunting animals", "Wasting water", "Planting trees", "Burning forests"],
        correct: 2,
      },
      {
        question: "Which environmental issue causes melting of polar ice caps?",
        options: ["Ozone depletion", "Global warming", "Acid rain", "Noise pollution"],
        correct: 1,
      },
      {
        question: "Which of these is a biodegradable waste item?",
        options: ["Plastic bottle", "Metal can", "Fruit peel", "Styrofoam"],
        correct: 2,
      },
      {
        question: "Which of these is the best method to save rainwater?",
        options: ["Drinking rainwater", "Watering plants with rain", "Rainwater harvesting", "Letting rainwater flow into drains"],
        correct: 2,
      },
      {
        question: "Which country is known for having a large area of tropical rainforests?",
        options: ["India", "Australia", "Brazil", "Egypt"],
        correct: 2,
      },
    ],
  },
  level2_intermediate: {
    title: "Level 2 Intermediate (Class 7-12)",
    description: "Advanced environmental concepts for secondary students",
    questions: [
      {
        question: "Which cycle involves the movement of water between the atmosphere, land, and oceans?",
        options: ["Carbon cycle", "Water cycle", "Nitrogen cycle", "Oxygen cycle"],
        correct: 1,
      },
      {
        question: "Which of these is the primary cause of acid rain?",
        options: ["Carbon dioxide and methane", "Sulfur dioxide and nitrogen oxides", "Oxygen and ozone", "Hydrogen and helium"],
        correct: 1,
      },
      {
        question: "Which of the following is a renewable energy source?",
        options: ["Coal", "Petroleum", "Wind energy", "Natural gas"],
        correct: 2,
      },
      {
        question: "The Kyoto Protocol is related to:",
        options: ["Protecting endangered species", "Reducing greenhouse gas emissions", "Soil conservation", "Deforestation control"],
        correct: 1,
      },
      {
        question: "Which of these organisms is considered a decomposer?",
        options: ["Lion", "Grass", "Earthworm", "Deer"],
        correct: 2,
      },
      {
        question: "Which type of biodiversity includes variety of ecosystems like forests, wetlands, and deserts?",
        options: ["Species diversity", "Genetic diversity", "Ecosystem diversity", "Population diversity"],
        correct: 2,
      },
      {
        question: "Which element is fixed by bacteria in the soil for plant use?",
        options: ["Oxygen", "Nitrogen", "Carbon", "Phosphorus"],
        correct: 1,
      },
      {
        question: "Which of these gases has the highest global warming potential?",
        options: ["Carbon dioxide", "Methane", "Nitrous oxide", "CFCs (Chlorofluorocarbons)"],
        correct: 3,
      },
      {
        question: "The main cause of eutrophication in lakes and rivers is:",
        options: ["Oil spills", "Excessive nutrients from fertilizers", "Acid rain", "Deforestation"],
        correct: 1,
      },
      {
        question: "Which part of the Earth contains the largest amount of carbon?",
        options: ["Atmosphere", "Oceans", "Soil", "Plants"],
        correct: 1,
      },
      {
        question: "Which organization is responsible for global environmental issues?",
        options: ["WHO", "UNESCO", "UNEP", "IMF"],
        correct: 2,
      },
      {
        question: "Which of these is a major contributor to smog formation?",
        options: ["Water vapor", "Ozone", "Smoke and fog combination", "Oxygen"],
        correct: 2,
      },
      {
        question: "The practice of growing different types of crops in the same field to conserve soil fertility is called:",
        options: ["Monocropping", "Crop rotation", "Overgrazing", "Slash and burn"],
        correct: 1,
      },
      {
        question: "Which gas is known as a major pollutant from vehicles?",
        options: ["Oxygen", "Carbon monoxide", "Nitrogen", "Ozone"],
        correct: 1,
      },
      {
        question: "The silent valley in Kerala is famous for:",
        options: ["Industrial growth", "Hydroelectric project", "Rainforest ecosystem", "Mining activities"],
        correct: 2,
      },
      {
        question: "Which of these steps helps in soil conservation?",
        options: ["Deforestation", "Contour plowing", "Mining", "Urbanization"],
        correct: 1,
      },
      {
        question: "The main purpose of a biological oxygen demand (BOD) test is to measure:",
        options: ["Oxygen level in the air", "Pollution level in water", "Soil fertility", "Greenhouse gases"],
        correct: 1,
      },
      {
        question: "Which of these is a secondary pollutant?",
        options: ["Sulfur dioxide", "Carbon dioxide", "Ozone in the troposphere", "Methane"],
        correct: 2,
      },
      {
        question: "The main goal of sustainable development is to:",
        options: ["Use resources without planning", "Meet present needs without harming future generations", "Increase production at any cost", "Build more industries"],
        correct: 1,
      },
      {
        question: "Which of these renewable energies is not dependent on the sun?",
        options: ["Solar energy", "Wind energy", "Geothermal energy", "Hydropower"],
        correct: 2,
      },
      {
        question: "The greenhouse effect naturally occurs because of:",
        options: ["Human-made pollution", "Greenhouse gases trapping heat", "Deforestation", "Soil erosion"],
        correct: 1,
      },
      {
        question: "Which international day is celebrated on June 5th to raise awareness about environmental protection?",
        options: ["Earth Day", "World Environment Day", "Ozone Day", "Biodiversity Day"],
        correct: 1,
      },
      {
        question: "Which of these is a bioindicator of water pollution?",
        options: ["Frog", "Lichen", "Algae growth", "Tiger"],
        correct: 2,
      },
      {
        question: "Which of these organisms are known as primary consumers in a food chain?",
        options: ["Herbivores", "Carnivores", "Decomposers", "Omnivores"],
        correct: 0,
      },
      {
        question: "The term biodegradable refers to:",
        options: ["Waste that never decomposes", "Waste that can be naturally decomposed by microorganisms", "Synthetic material", "Nuclear waste"],
        correct: 1,
      },
      {
        question: "Which of these renewable energy resources is generated by flowing water?",
        options: ["Wind energy", "Hydropower", "Solar power", "Geothermal"],
        correct: 1,
      },
      {
        question: "Which of these environmental problems is caused by overuse of fertilizers?",
        options: ["Noise pollution", "Eutrophication", "Deforestation", "Light pollution"],
        correct: 1,
      },
      {
        question: "Which law in India deals with environmental protection?",
        options: ["Forest Conservation Act", "Wildlife Protection Act", "Environment Protection Act", "Pollution Control Act"],
        correct: 2,
      },
      {
        question: "Which process returns carbon dioxide to the atmosphere during the carbon cycle?",
        options: ["Photosynthesis", "Respiration and decomposition", "Rainfall", "Evaporation"],
        correct: 1,
      },
      {
        question: "The ultimate source of energy for most ecosystems is:",
        options: ["Fossil fuels", "Wind", "The Sun", "Geothermal heat"],
        correct: 2,
      },
    ],
  },
  level2_advanced: {
    title: "Level 2 Advanced (Class 7-12)",
    description: "Expert-level environmental science for secondary students",
    questions: [
      {
        question: "The Montreal Protocol (1987) is aimed at:",
        options: ["Controlling air pollution", "Reducing ozone-depleting substances", "Protecting biodiversity", "Preventing soil erosion"],
        correct: 1,
      },
      {
        question: "Which of these is an example of a keystone species?",
        options: ["Elephant", "Tiger", "Sea otter", "All of the above"],
        correct: 3,
      },
      {
        question: "Which process releases phosphorus from rocks into the soil?",
        options: ["Weathering", "Photosynthesis", "Respiration", "Evaporation"],
        correct: 0,
      },
      {
        question: "The greenhouse gas with the longest atmospheric lifetime is:",
        options: ["Carbon dioxide", "Methane", "Nitrous oxide", "CFCs"],
        correct: 3,
      },
      {
        question: "Which of the following is a major effect of deforestation on climate?",
        options: ["Increased rainfall", "Reduced atmospheric CO₂", "Altered local and global temperatures", "Soil enrichment"],
        correct: 2,
      },
      {
        question: "Which of these methods is used for bioremediation of polluted soil?",
        options: ["Burning the soil", "Planting specific microorganisms", "Burying the soil", "Irrigation"],
        correct: 1,
      },
      {
        question: "Eutrophication primarily results in:",
        options: ["Increased oxygen in water", "Algal bloom and oxygen depletion", "Cleaner water", "Biodiversity increase"],
        correct: 1,
      },
      {
        question: "Which type of forest has the highest biodiversity?",
        options: ["Temperate forest", "Tropical rainforest", "Boreal forest", "Mangrove forest"],
        correct: 1,
      },
      {
        question: "Which international treaty aims to reduce carbon emissions globally?",
        options: ["Kyoto Protocol", "CITES", "Basel Convention", "Montreal Protocol"],
        correct: 0,
      },
      {
        question: "Which of these is an example of a non-point source pollutant?",
        options: ["Factory smoke", "Oil spill from a ship", "Runoff from agricultural fields", "Sewage discharge from a plant"],
        correct: 2,
      },
      {
        question: "Which of these is a critical zone for biodiversity?",
        options: ["Desert", "Coral reefs", "Grasslands", "Urban parks"],
        correct: 1,
      },
      {
        question: "Bioaccumulation refers to:",
        options: ["Spread of invasive species", "Accumulation of pollutants in the food chain", "Water cycle", "Soil erosion"],
        correct: 1,
      },
      {
        question: "Which of the following is a major anthropogenic source of methane?",
        options: ["Fossil fuel combustion", "Landfills and livestock", "Oceans", "Forests"],
        correct: 1,
      },
      {
        question: "Desertification is mainly caused by:",
        options: ["Planting trees", "Deforestation and overgrazing", "Conservation", "Flood control"],
        correct: 1,
      },
      {
        question: "Which of these reduces the effect of urban heat islands?",
        options: ["Planting rooftop gardens", "Asphalt roads", "Industrial growth", "Concrete walls"],
        correct: 0,
      },
      {
        question: "Which biogeochemical cycle does not involve the atmosphere?",
        options: ["Carbon cycle", "Nitrogen cycle", "Phosphorus cycle", "Water cycle"],
        correct: 2,
      },
      {
        question: "Which is an indicator species for air quality?",
        options: ["Frog", "Lichen", "Earthworm", "Tiger"],
        correct: 1,
      },
      {
        question: "The primary cause of ocean acidification is:",
        options: ["Deforestation", "Absorption of CO₂ from atmosphere", "Oil spills", "Plastic pollution"],
        correct: 1,
      },
      {
        question: "Which of these conservation strategies is in situ?",
        options: ["Botanical garden", "National park", "Zoo", "Seed bank"],
        correct: 1,
      },
      {
        question: "Which type of radiation is mostly absorbed by the ozone layer?",
        options: ["Infrared", "Ultraviolet", "Gamma rays", "Microwaves"],
        correct: 1,
      },
      {
        question: "The Basel Convention regulates:",
        options: ["Transboundary movement of hazardous waste", "Wildlife trade", "Ozone depletion", "Carbon emissions"],
        correct: 0,
      },
      {
        question: "Which of these is a major threat to freshwater ecosystems?",
        options: ["Industrial effluents", "Photosynthesis", "Reforestation", "Wind energy"],
        correct: 0,
      },
      {
        question: "Which of the following is a greenhouse gas not naturally present in high concentrations?",
        options: ["Carbon dioxide", "Methane", "CFCs (synthetic gases)", "Water vapor"],
        correct: 2,
      },
      {
        question: "Integrated Pest Management (IPM) aims to:",
        options: ["Eliminate all insects", "Control pests with minimum chemical use", "Use only pesticides", "Increase pest population"],
        correct: 1,
      },
      {
        question: "Which of the following contributes to soil salinity?",
        options: ["Over-irrigation and improper drainage", "Forestation", "Crop rotation", "Contour farming"],
        correct: 0,
      },
      {
        question: "Which is a major consequence of melting polar ice caps?",
        options: ["Reduced rainfall", "Rising sea levels", "Forest regrowth", "More deserts"],
        correct: 1,
      },
      {
        question: "Which of these species is invasive in India?",
        options: ["Neem", "Lantana camara", "Mango", "Banyan tree"],
        correct: 1,
      },
      {
        question: "The Green India Mission aims to:",
        options: ["Plant trees and improve forest cover", "Build highways", "Increase industrial output", "Reduce carbon footprint in vehicles"],
        correct: 0,
      },
      {
        question: "Which energy source has the lowest carbon footprint?",
        options: ["Coal", "Natural gas", "Nuclear energy", "Diesel"],
        correct: 2,
      },
      {
        question: "The term 'Anthropocene' refers to:",
        options: ["Geological period dominated by human impact on Earth", "Ice Age", "Prehistoric forests", "Formation of mountains"],
        correct: 0,
      },
    ],
  },
  level3_basic: {
    title: "Level 3 Basic (College)",
    description: "Fundamental environmental science concepts for college students",
    questions: [
      {
        question: "Which of the following is a primary producer in an ecosystem?",
        options: ["Lion", "Grass", "Frog", "Eagle"],
        correct: 1,
      },
      {
        question: "The primary cause of ocean dead zones is:",
        options: ["Overfishing", "Eutrophication due to nutrient runoff", "Oil spills", "Coral bleaching"],
        correct: 1,
      },
      {
        question: "Which of these is a non-renewable energy source?",
        options: ["Coal", "Wind", "Solar", "Geothermal"],
        correct: 0,
      },
      {
        question: "The LD50 in ecotoxicology refers to:",
        options: ["Life duration of 50 species", "Dose of a chemical lethal to 50% of a test population", "Level of pollution", "Water toxicity"],
        correct: 1,
      },
      {
        question: "Nitrogen fixation in soil is carried out mainly by:",
        options: ["Earthworms", "Rhizobium bacteria", "Fungi", "Algae"],
        correct: 1,
      },
      {
        question: "Biochemical Oxygen Demand (BOD) measures:",
        options: ["Oxygen in air", "Organic pollution in water", "Soil nutrients", "Ozone layer depletion"],
        correct: 1,
      },
      {
        question: "The largest reservoir of carbon on Earth is:",
        options: ["Atmosphere", "Oceans", "Fossil fuels", "Forests"],
        correct: 1,
      },
      {
        question: "Coral bleaching occurs mainly due to:",
        options: ["Ocean warming", "Overfishing", "Oil spills", "Mangrove destruction"],
        correct: 0,
      },
      {
        question: "Which of the following is a point source pollutant?",
        options: ["Runoff from farmland", "Discharge from a sewage treatment plant", "Acid rain", "Urban runoff"],
        correct: 1,
      },
      {
        question: "The CITES treaty regulates:",
        options: ["Greenhouse gas emissions", "International trade in endangered species", "Water pollution control", "Fossil fuel use"],
        correct: 1,
      },
      {
        question: "Which is the largest terrestrial biome on Earth?",
        options: ["Desert", "Boreal forest (Taiga)", "Tropical rainforest", "Grassland"],
        correct: 1,
      },
      {
        question: "Acid rain primarily results from:",
        options: ["Carbon dioxide", "Sulfur dioxide and nitrogen oxides", "Oxygen", "Methane"],
        correct: 1,
      },
      {
        question: "Which of these is an invasive aquatic species?",
        options: ["Water hyacinth", "Lotus", "Kelp", "Seagrass"],
        correct: 0,
      },
      {
        question: "Bioaccumulation is most significant in which type of pollutant?",
        options: ["Water-soluble pollutants", "Fat-soluble pollutants like DDT", "CO₂", "O₂"],
        correct: 1,
      },
      {
        question: "Ecosystem services include:",
        options: ["Food production", "Climate regulation", "Pollination", "All of the above"],
        correct: 3,
      },
      {
        question: "The main anthropogenic source of nitrous oxide (N₂O) is:",
        options: ["Fertilizer application", "Deforestation", "Vehicle exhaust", "Industrial smog"],
        correct: 0,
      },
      {
        question: "Desertification affects which ecosystem service the most?",
        options: ["Water purification", "Soil fertility", "Carbon sequestration", "Pollination"],
        correct: 1,
      },
      {
        question: "The primary cause of global warming is:",
        options: ["Deforestation", "Greenhouse gas emissions from human activities", "Natural climate cycles", "Soil erosion"],
        correct: 1,
      },
      {
        question: "Which of the following is an example of in situ conservation?",
        options: ["Seed bank", "Botanical garden", "Wildlife sanctuary", "Tissue culture"],
        correct: 2,
      },
      {
        question: "Phytoremediation is used to:",
        options: ["Grow crops faster", "Remove pollutants from soil using plants", "Increase biodiversity", "Prevent deforestation"],
        correct: 1,
      },
      {
        question: "The Anthropocene epoch is characterized by:",
        options: ["Human domination of ecosystems", "Ice age conditions", "Pre-industrial forests", "Extinction of dinosaurs"],
        correct: 0,
      },
      {
        question: "Which type of pollution is measured by PM2.5 and PM10?",
        options: ["Noise pollution", "Air pollution", "Water pollution", "Soil pollution"],
        correct: 1,
      },
      {
        question: "Ozone layer depletion leads to:",
        options: ["Increased UV radiation reaching Earth", "Increased rainfall", "Soil enrichment", "Decreased global temperatures"],
        correct: 0,
      },
      {
        question: "Sustainable yield refers to:",
        options: ["Maximum harvest at any cost", "Resource use that does not exceed regeneration", "Stopping all resource use", "Harvesting only renewable energy"],
        correct: 1,
      },
      {
        question: "Biomagnification refers to:",
        options: ["Pollutants increasing in concentration as they move up the food chain", "Increase in biodiversity", "Erosion of soil", "Growth of forests"],
        correct: 0,
      },
      {
        question: "The main component of smog in urban areas is:",
        options: ["Water vapor", "Ozone and particulate matter", "Methane", "Carbon monoxide only"],
        correct: 1,
      },
      {
        question: "Renewable energy examples include:",
        options: ["Coal, natural gas", "Solar, wind, hydro", "Petroleum, diesel", "Nuclear fuel only"],
        correct: 1,
      },
      {
        question: "The Biosphere Reserve concept primarily aims to:",
        options: ["Protect endangered species and maintain ecosystem services", "Build more cities", "Encourage industrialization", "Increase agriculture"],
        correct: 0,
      },
      {
        question: "Which greenhouse gas has the highest global warming potential per molecule?",
        options: ["Carbon dioxide", "Methane", "Nitrous oxide", "Sulfur hexafluoride (SF₆)"],
        correct: 3,
      },
      {
        question: "Integrated Coastal Zone Management (ICZM) focuses on:",
        options: ["Sustainable use of coastal resources", "Inland soil conservation", "Urban development", "Desertification control"],
        correct: 0,
      },
    ],
  },
  level3_intermediate: {
    title: "Level 3 Intermediate (College)",
    description: "Advanced environmental science concepts for college students",
    questions: [
      {
        question: "Which of the following is a primary driver of anthropogenic climate change?",
        options: ["Solar flares", "Greenhouse gas emissions from fossil fuels", "Volcanic eruptions", "Natural ocean currents"],
        correct: 1,
      },
      {
        question: "Riparian zones are important for:",
        options: ["Forest management", "Soil and water conservation along riverbanks", "Desertification control", "Urban development"],
        correct: 1,
      },
      {
        question: "Which of the following is most responsible for thermal pollution in rivers?",
        options: ["Industrial effluents", "Agricultural runoff", "Plastic waste", "Oil spills"],
        correct: 0,
      },
      {
        question: "Leaching in soil refers to:",
        options: ["Loss of soil fertility due to water washing away nutrients", "Plant growth", "Rock formation", "Photosynthesis"],
        correct: 0,
      },
      {
        question: "Dead zones in oceans are primarily caused by:",
        options: ["Global warming", "Nutrient overload from agriculture leading to hypoxia", "Oil spills", "Overfishing"],
        correct: 1,
      },
      {
        question: "Biomonitoring is the process of:",
        options: ["Measuring atmospheric pressure", "Using living organisms to assess environmental quality", "Estimating population growth", "Measuring soil erosion"],
        correct: 1,
      },
      {
        question: "Which of the following is a non-point source water pollutant?",
        options: ["Industrial discharge", "Runoff from agricultural fields", "Wastewater treatment plant output", "Sewage pipe discharge"],
        correct: 1,
      },
      {
        question: "Which greenhouse gas is mostly emitted from paddy fields?",
        options: ["Carbon dioxide", "Methane", "Nitrous oxide", "Ozone"],
        correct: 1,
      },
      {
        question: "Riparian buffer strips are mainly used to:",
        options: ["Reduce air pollution", "Filter agricultural runoff before it enters water bodies", "Increase urban heat", "Prevent soil erosion on slopes"],
        correct: 1,
      },
      {
        question: "Integrated Waste Management (IWM) emphasizes:",
        options: ["Landfilling only", "Burning only", "Reducing, reusing, recycling, and proper disposal", "Exporting waste"],
        correct: 2,
      },
      {
        question: "Primary succession occurs in:",
        options: ["Abandoned farmland", "Newly exposed rock surfaces", "Lakes", "Forest clearings"],
        correct: 1,
      },
      {
        question: "Algal blooms are indicators of:",
        options: ["Soil erosion", "High nutrient levels in water bodies", "Deforestation", "Air pollution"],
        correct: 1,
      },
      {
        question: "Phytoplankton contributes to:",
        options: ["Soil fertility", "Marine primary productivity", "Urban heat islands", "Desertification"],
        correct: 1,
      },
      {
        question: "Heavy metals in water can be removed using:",
        options: ["Sedimentation", "Bioremediation using plants and microbes", "Evaporation", "Photosynthesis"],
        correct: 1,
      },
      {
        question: "Which global agreement aims to limit temperature rise to below 2°C?",
        options: ["Kyoto Protocol", "Paris Agreement", "Montreal Protocol", "Basel Convention"],
        correct: 1,
      },
      {
        question: "Cation exchange capacity (CEC) is an important property of:",
        options: ["Air", "Soil", "Water", "Forests"],
        correct: 1,
      },
      {
        question: "Endocrine-disrupting chemicals (EDCs) affect:",
        options: ["Plant photosynthesis", "Hormonal systems of animals and humans", "Soil pH", "Air quality"],
        correct: 1,
      },
      {
        question: "Which type of pollution can cause coral bleaching?",
        options: ["Noise pollution", "Thermal and chemical pollution", "Light pollution", "Soil pollution"],
        correct: 1,
      },
      {
        question: "Carbon sequestration is primarily carried out by:",
        options: ["Fossil fuels", "Plants and oceans", "Animals", "Microbes"],
        correct: 1,
      },
      {
        question: "Anthropogenic eutrophication is mainly caused by:",
        options: ["Industrial dust", "Excess fertilizers and sewage", "Oil spills", "Logging"],
        correct: 1,
      },
      {
        question: "LEED certification is associated with:",
        options: ["Soil testing", "Green building standards", "Air quality monitoring", "Ocean conservation"],
        correct: 1,
      },
      {
        question: "Acid mine drainage results from:",
        options: ["Excessive agriculture", "Oxidation of sulfide minerals from mining operations", "Deforestation", "Oil spills"],
        correct: 1,
      },
      {
        question: "Photochemical smog forms mainly in:",
        options: ["Rural areas", "Urban areas with high NOx and VOC emissions", "Oceans", "Deserts"],
        correct: 1,
      },
      {
        question: "Riparian wetlands are important because they:",
        options: ["Serve as carbon sinks", "Filter pollutants and prevent flooding", "Increase desertification", "Reduce biodiversity"],
        correct: 1,
      },
      {
        question: "Sustainable forest management includes:",
        options: ["Clear-cutting", "Selective logging and regeneration", "Burning forests", "Mining operations"],
        correct: 1,
      },
      {
        question: "Persistent Organic Pollutants (POPs) are dangerous because they:",
        options: ["Decompose quickly", "Accumulate in fat tissues and persist in the environment", "Only affect water", "Are harmless"],
        correct: 1,
      },
      {
        question: "Which biome stores the largest amount of carbon in its soil?",
        options: ["Desert", "Peatlands", "Tundra", "Grasslands"],
        correct: 1,
      },
      {
        question: "Green infrastructure includes:",
        options: ["Paved roads", "Permeable pavements, green roofs, urban trees", "Industrial complexes", "Mining areas"],
        correct: 1,
      },
      {
        question: "Microplastics affect:",
        options: ["Only soil", "Aquatic organisms and food chain", "Air quality", "Forest cover"],
        correct: 1,
      },
      {
        question: "Integrated Environmental Management (IEM) aims to:",
        options: ["Separate management of air, water, and soil", "Consider interlinked ecosystems and human activities for holistic management", "Only conserve forests", "Only manage industrial waste"],
        correct: 1,
      },
    ],
  },
  level3_advanced: {
    title: "Level 3 Advanced (College)",
    description: "Expert-level environmental science for college students",
    questions: [
      {
        question: "Planetary boundaries concept defines:",
        options: ["Safe limits for human activities to prevent global ecological collapse", "Limits for agricultural production", "Space exploration boundaries", "Urban expansion zones"],
        correct: 0,
      },
      {
        question: "Net primary productivity (NPP) measures:",
        options: ["Total energy produced by decomposers", "Total carbon fixed by autotrophs minus respiration", "Human energy consumption", "Fossil fuel energy"],
        correct: 1,
      },
      {
        question: "Carbon footprint of a product measures:",
        options: ["Land area used", "Total greenhouse gas emissions during its lifecycle", "Water consumption", "Energy efficiency"],
        correct: 1,
      },
      {
        question: "Resilience in ecosystems refers to:",
        options: ["Ability to resist human entry", "Ability to recover after disturbance", "Maximum productivity", "Soil fertility"],
        correct: 1,
      },
      {
        question: "Which international treaty focuses on reducing black carbon and short-lived climate pollutants?",
        options: ["Montreal Protocol", "Paris Agreement", "Climate and Clean Air Coalition (CCAC)", "Kyoto Protocol"],
        correct: 2,
      },
      {
        question: "Ecological footprint analysis evaluates:",
        options: ["Pollution levels", "Human demand on ecosystems vs. Earth's biocapacity", "Soil quality", "Water pH"],
        correct: 1,
      },
      {
        question: "Trophic pyramids represent:",
        options: ["Energy, biomass, or number distribution across trophic levels", "Soil nutrients", "Water cycle", "Industrial waste management"],
        correct: 0,
      },
      {
        question: "Adaptive management in environmental science involves:",
        options: ["Following fixed rules", "Monitoring, feedback, and adjusting management practices", "Ignoring ecosystem changes", "Standardized industrial operations"],
        correct: 1,
      },
      {
        question: "Which ecosystem is the largest carbon sink on Earth?",
        options: ["Tropical forests", "Oceans", "Tundra", "Grasslands"],
        correct: 1,
      },
      {
        question: "Urban metabolism studies:",
        options: ["Human health", "Material and energy flows in cities", "Soil nutrients", "Industrial outputs only"],
        correct: 1,
      },
      {
        question: "Life Cycle Assessment (LCA) is used to:",
        options: ["Study human lifespan", "Evaluate environmental impacts of products/services over their lifecycle", "Soil productivity", "Air quality"],
        correct: 1,
      },
      {
        question: "Blue carbon refers to:",
        options: ["Carbon in fossil fuels", "Carbon stored in coastal ecosystems like mangroves and seagrasses", "Atmospheric CO₂", "Industrial carbon emissions"],
        correct: 1,
      },
      {
        question: "Payment for Ecosystem Services (PES) incentivizes:",
        options: ["Industries to pollute", "Protecting and maintaining ecosystem services", "Urbanization", "Mining activities"],
        correct: 1,
      },
      {
        question: "Climate-smart agriculture (CSA) aims to:",
        options: ["Increase production without considering climate", "Adapt to climate change, mitigate emissions, and improve productivity", "Replace traditional crops with industrial products", "Reduce water use only"],
        correct: 1,
      },
      {
        question: "Anthropogenic nitrogen fixation mainly comes from:",
        options: ["Lightning", "Fertilizer production and use", "Decomposition", "Oceanic bacteria"],
        correct: 1,
      },
      {
        question: "Planetary-scale tipping points refer to:",
        options: ["Thresholds beyond which ecosystems may collapse", "Soil erosion", "Air pollution levels", "Urban sprawl"],
        correct: 0,
      },
      {
        question: "Ecosystem-based adaptation (EbA) to climate change includes:",
        options: ["Engineering dams only", "Using natural ecosystems to reduce vulnerability", "Industrial expansion", "Mining for resources"],
        correct: 1,
      },
      {
        question: "Anthropogenic biomes (Anthromes) are:",
        options: ["Purely natural ecosystems", "Human-modified ecosystems", "Desert only", "Polar regions"],
        correct: 1,
      },
      {
        question: "Ocean acidification is caused by:",
        options: ["CO₂ absorption from atmosphere", "Oil spills", "Marine biodiversity loss", "Plastic pollution"],
        correct: 0,
      },
      {
        question: "Environmental Kuznets Curve (EKC) hypothesizes:",
        options: ["Pollution always increases with income", "Pollution first increases then decreases with economic growth", "Ecosystem degradation is random", "Deforestation is constant"],
        correct: 1,
      },
      {
        question: "Adaptive co-management emphasizes:",
        options: ["Top-down government control", "Collaboration among stakeholders with learning and adaptation", "Ignoring community input", "Industry-focused management only"],
        correct: 1,
      },
      {
        question: "Carbon trading is associated with:",
        options: ["Reducing water pollution", "Market-based mechanism to reduce greenhouse gas emissions", "Air quality improvement only", "Soil fertility enhancement"],
        correct: 1,
      },
      {
        question: "Ecological modeling is used to:",
        options: ["Predict ecosystem responses to changes", "Build cities", "Manage traffic", "Measure CO₂ in laboratories only"],
        correct: 0,
      },
      {
        question: "Mitigation hierarchy in conservation includes:",
        options: ["Avoid, minimize, restore, offset", "Only avoid", "Only restore", "Only offset"],
        correct: 0,
      },
      {
        question: "Greenhouse gas inventories are essential for:",
        options: ["Soil conservation", "Tracking emissions for climate policy", "Water management", "Energy production only"],
        correct: 1,
      },
      {
        question: "Permafrost thawing can release:",
        options: ["Nitrogen only", "Carbon and methane", "Ozone", "Sulfur compounds"],
        correct: 1,
      },
      {
        question: "Rewilding is a conservation approach that:",
        options: ["Reintroduces species and restores ecological processes", "Builds dams", "Urbanizes land", "Harvests forests intensively"],
        correct: 0,
      },
      {
        question: "Sustainable Development Goals (SDGs) relevant to environment include:",
        options: ["Clean water, life on land, climate action", "Only economic growth", "Industry development only", "Urbanization only"],
        correct: 0,
      },
      {
        question: "Ecosystem valuation assigns:",
        options: ["Monetary value to ecosystem services", "Biodiversity scores only", "Pollution ratings", "Soil quality index"],
        correct: 0,
      },
      {
        question: "Geoengineering to combat climate change includes:",
        options: ["Afforestation only", "Solar radiation management and carbon dioxide removal", "Reducing plastic use", "Noise pollution control"],
        correct: 1,
      },
    ],
  },
};

let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizScore = 0;
let userProfile = {
  email: null,
  name: null,
  quizzesCompleted: 0,
  bestPercentage: 0,
  history: [],
};

function startQuiz(category) {
  currentQuiz = quizData[category];
  currentQuestionIndex = 0;
  userAnswers = [];
  quizScore = 0;

  document.querySelector(".quiz-categories").style.display = "none";
  document.querySelector(".quiz-container").style.display = "block";

  document.getElementById("quiz-title").textContent = currentQuiz.title;
  document.getElementById("quiz-description").textContent =
    currentQuiz.description;

  showQuestion();
}

function showQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

  document.getElementById("question-text").textContent = question.question;
  document.getElementById("progress-fill").style.width = `${progress}%`;
  document.getElementById("progress-text").textContent = `Question ${currentQuestionIndex + 1
    } of ${currentQuiz.questions.length}`;

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  question.options.forEach((option, index) => {
    const optionElement = document.createElement("div");
    optionElement.className = "option";
    optionElement.textContent = option;
    optionElement.addEventListener("click", () => selectOption(index));
    optionsContainer.appendChild(optionElement);
  });

  // Update navigation buttons
  const prevBtn = document.getElementById("prev-question");
  const nextBtn = document.getElementById("next-question");
  const submitBtn = document.getElementById("submit-quiz");

  if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;

  // Ensure the next button is clearly visible/enabled on non-final questions
  if (nextBtn) {
    const showNext = currentQuestionIndex < currentQuiz.questions.length - 1;
    nextBtn.style.display = showNext ? "inline-flex" : "none";
    nextBtn.style.visibility = showNext ? "visible" : "hidden";
    nextBtn.disabled = !showNext ? true : false;
  }

  if (submitBtn) {
    const showSubmit =
      currentQuestionIndex === currentQuiz.questions.length - 1;
    submitBtn.style.display = showSubmit ? "block" : "none";
    submitBtn.style.visibility = showSubmit ? "visible" : "hidden";
    submitBtn.disabled = !showSubmit ? true : false;
  }
}

function selectOption(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;

  // Remove previous selections
  document
    .querySelectorAll(".option")
    .forEach((opt) => opt.classList.remove("selected"));

  // Add selection to clicked option
  document.querySelectorAll(".option")[optionIndex].classList.add("selected");
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
}

function submitQuiz() {
  // Calculate score
  currentQuiz.questions.forEach((question, index) => {
    if (userAnswers[index] === question.correct) {
      quizScore++;
    }
  });

  const percentage = Math.round(
    (quizScore / currentQuiz.questions.length) * 100
  );

  // Show results
  document.querySelector(".quiz-container").style.display = "none";
  document.querySelector(".quiz-results").style.display = "block";

  document.getElementById("score-percentage").textContent = `${percentage}%`;
  document.getElementById("correct-answers").textContent = quizScore;
  document.getElementById("total-questions").textContent =
    currentQuiz.questions.length;

  let message = "";
  if (percentage >= 90) message = "Excellent! You're an eco-expert!";
  else if (percentage >= 70) message = "Great job! You know your eco-stuff!";
  else if (percentage >= 50) message = "Good effort! Keep learning!";
  else message = "Keep studying! Every expert was once a beginner!";

  document.getElementById("score-message").textContent = message;

  // Show detailed question review with correct answers
  showQuestionReview();

  // Award points based on score
  const pointsEarned = Math.round(percentage / 10) * 5;
  completeTask("Quiz completion", pointsEarned);
  showMessage(`Quiz completed! +${pointsEarned} points`, "success");

  // Persist quiz result per user
  try {
    const email = localStorage.getItem("ecoUserEmail") || "guest";
    const profileKey = `profile_${email}`;
    const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
    const newHistoryItem = {
      title: currentQuiz.title,
      percentage,
      correct: quizScore,
      total: currentQuiz.questions.length,
      ts: Date.now(),
    };
    const history = Array.isArray(existing.history) ? existing.history : [];
    history.unshift(newHistoryItem);
    const quizzesCompleted = (existing.quizzesCompleted || 0) + 1;
    const bestPercentage = Math.max(existing.bestPercentage || 0, percentage);
    const points = parseInt(localStorage.getItem("ecoPoints") || "0", 10);
    const name = localStorage.getItem("ecoUserName") || "Guest";
    const profile = {
      email,
      name,
      quizzesCompleted,
      bestPercentage,
      history,
      points,
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
  } catch (e) {
    console.warn("Failed saving profile:", e);
  }
  updateProfileUI();
}

function showQuestionReview() {
  const reviewContainer = document.getElementById("question-review");
  reviewContainer.innerHTML = "";

  currentQuiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const correctAnswer = question.correct;
    const isCorrect = userAnswer === correctAnswer;

    const reviewItem = document.createElement("div");
    reviewItem.className = `review-item ${isCorrect ? "correct" : "incorrect"}`;

    reviewItem.innerHTML = `
      <div class="review-question">
        <h5>Q${index + 1}. ${question.question}</h5>
      </div>
      <div class="review-options">
        ${question.options.map((option, optIndex) => {
      let optionClass = "";
      let icon = "";

      if (optIndex === correctAnswer) {
        optionClass = "correct-answer";
        icon = '<i class="fas fa-check"></i>';
      } else if (optIndex === userAnswer && userAnswer !== correctAnswer) {
        optionClass = "wrong-answer";
        icon = '<i class="fas fa-times"></i>';
      }

      return `
            <div class="review-option ${optionClass}">
              ${icon} ${String.fromCharCode(65 + optIndex)}) ${option}
            </div>
          `;
    }).join("")}
      </div>
      <div class="review-result">
        ${isCorrect
        ? '<span class="result-correct"><i class="fas fa-check-circle"></i> Correct!</span>'
        : `<span class="result-incorrect"><i class="fas fa-times-circle"></i> Incorrect</span>
             <span class="correct-info">Correct answer: ${String.fromCharCode(65 + correctAnswer)}) ${question.options[correctAnswer]}</span>`
      }
      </div>
    `;

    reviewContainer.appendChild(reviewItem);
  });
}

function restartQuiz() {
  document.querySelector(".quiz-results").style.display = "none";
  document.querySelector(".quiz-categories").style.display = "grid";
}

function tryAnotherQuiz() {
  document.querySelector(".quiz-results").style.display = "none";
  document.querySelector(".quiz-categories").style.display = "grid";
}

function goBackToCategories() {
  // Hide quiz container and show categories
  document.querySelector(".quiz-container").style.display = "none";
  document.querySelector(".quiz-categories").style.display = "grid";

  // Reset quiz state
  currentQuiz = null;
  currentQuestionIndex = 0;
  userAnswers = [];
  quizScore = 0;

  // Show message
  showMessage("Quiz cancelled. Choose another category!", "info");
}

// AI Image Analysis Functions
function initializeAIFeatures() {
  // Mode selector functionality
  const modeBtns = document.querySelectorAll('.mode-btn');
  const cameraContainer = document.querySelector('.camera-container');
  const uploadContainer = document.querySelector('.upload-container');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      if (mode === 'camera') {
        cameraContainer.style.display = 'block';
        uploadContainer.style.display = 'none';
      } else {
        cameraContainer.style.display = 'none';
        uploadContainer.style.display = 'block';
      }
    });
  });

  // Image upload functionality
  const imageUpload = document.getElementById('image-upload');
  const uploadZone = document.getElementById('upload-zone');
  const uploadPreview = document.getElementById('upload-preview');
  const uploadedImage = document.getElementById('uploaded-image');

  // Drag and drop functionality
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#4CAF50';
    uploadZone.style.background = 'rgba(76, 175, 80, 0.2)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    uploadZone.style.background = 'transparent';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  });

  imageUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  });

  // Clear upload functionality
  document.getElementById('clear-upload').addEventListener('click', () => {
    uploadPreview.style.display = 'none';
    uploadZone.style.display = 'block';
    imageUpload.value = '';
  });

  // Analyze uploaded image
  document.getElementById('analyze-uploaded').addEventListener('click', () => {
    analyzeWasteImage(uploadedImage.src);
  });
}

function handleImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    showMessage('Please upload a valid image file', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const uploadedImage = document.getElementById('uploaded-image');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadZone = document.getElementById('upload-zone');

    uploadedImage.src = e.target.result;
    uploadPreview.style.display = 'block';
    uploadZone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function analyzeWasteImage(imageSrc) {
  showMessage('Analyzing image with AI...', 'info');

  // Simulate AI analysis (in real implementation, this would call an AI service)
  setTimeout(() => {
    const wasteItems = [
      { name: 'Plastic Bottle', category: 'plastic', confidence: 95 },
      { name: 'Banana Peel', category: 'organic', confidence: 92 },
      { name: 'Newspaper', category: 'paper', confidence: 88 },
      { name: 'Glass Jar', category: 'glass', confidence: 90 },
      { name: 'Aluminum Can', category: 'metal', confidence: 94 }
    ];

    const randomItem = wasteItems[Math.floor(Math.random() * wasteItems.length)];
    displayWasteAnalysis(randomItem);
  }, 2000);
}

function displayWasteAnalysis(item) {
  // Update identified item
  document.getElementById('identified-item-name').textContent = item.name;
  document.getElementById('confidence-score').textContent = `Confidence: ${item.confidence}%`;

  // Update bin recommendation
  const binType = document.getElementById('bin-type');
  const binIcon = document.querySelector('.bin-icon');
  const recommendedBin = document.getElementById('recommended-bin');

  binType.textContent = `${item.category.charAt(0).toUpperCase() + item.category.slice(1)} Bin`;
  binIcon.className = `bin-icon ${item.category}`;

  // Update segregation instructions
  const instructions = getSegregationInstructions(item.category);
  document.getElementById('segregation-instructions').innerHTML = instructions;

  // Update suggestions
  const suggestions = getWasteSuggestions(item.category);
  document.getElementById('recycling-tips').textContent = suggestions.recycling;
  document.getElementById('eco-alternatives').textContent = suggestions.alternatives;
  document.getElementById('environmental-impact').textContent = suggestions.impact;

  // Show AI suggestions
  document.querySelector('.ai-suggestions').style.display = 'block';
  showMessage('AI analysis complete!', 'success');
}

function getSegregationInstructions(category) {
  const instructions = {
    plastic: `
      <ul>
        <li>Clean the plastic item to remove any food residue</li>
        <li>Remove any labels or caps if possible</li>
        <li>Place in the blue recycling bin</li>
        <li>Avoid crushing bottles to maintain their shape for sorting</li>
      </ul>
    `,
    organic: `
      <ul>
        <li>Place in the green organic waste bin</li>
        <li>Can be composted at home if you have a compost bin</li>
        <li>Avoid mixing with non-organic materials</li>
        <li>Consider starting a home composting system</li>
      </ul>
    `,
    paper: `
      <ul>
        <li>Ensure paper is clean and dry</li>
        <li>Remove any plastic coating or tape</li>
        <li>Place in the yellow recycling bin</li>
        <li>Shred sensitive documents before recycling</li>
      </ul>
    `,
    glass: `
      <ul>
        <li>Rinse the glass container</li>
        <li>Remove lids and caps</li>
        <li>Place in the purple glass recycling bin</li>
        <li>Handle carefully to avoid breakage</li>
      </ul>
    `,
    metal: `
      <ul>
        <li>Clean the metal item</li>
        <li>Remove any labels</li>
        <li>Place in the gray metal recycling bin</li>
        <li>Aluminum cans can be crushed to save space</li>
      </ul>
    `
  };

  return instructions[category] || '<p>General waste disposal guidelines apply.</p>';
}

function getWasteSuggestions(category) {
  const suggestions = {
    plastic: {
      recycling: 'Plastic can be recycled multiple times. Look for recycling symbols and numbers to ensure proper sorting.',
      alternatives: 'Consider using reusable water bottles, cloth bags, and glass containers to reduce plastic waste.',
      impact: 'Recycling one plastic bottle saves enough energy to power a light bulb for 3 hours.'
    },
    organic: {
      recycling: 'Organic waste can be composted to create nutrient-rich soil for plants and gardens.',
      alternatives: 'Start home composting, use organic waste for plant fertilizer, or participate in community composting programs.',
      impact: 'Composting organic waste reduces methane emissions from landfills by up to 50%.'
    },
    paper: {
      recycling: 'Paper can be recycled 5-7 times before fibers become too short. Always keep it clean and dry.',
      alternatives: 'Go digital when possible, use both sides of paper, and choose recycled paper products.',
      impact: 'Recycling one ton of paper saves 17 trees, 7,000 gallons of water, and 3.3 cubic yards of landfill space.'
    },
    glass: {
      recycling: 'Glass can be recycled infinitely without losing quality. Separate by color when possible.',
      alternatives: 'Reuse glass jars for storage, choose products in glass containers, and support bottle return programs.',
      impact: 'Recycling glass uses 40% less energy than making new glass and reduces CO2 emissions significantly.'
    },
    metal: {
      recycling: 'Metals retain their properties indefinitely and can be recycled repeatedly without degradation.',
      alternatives: 'Choose products with minimal metal packaging, repair metal items instead of replacing them.',
      impact: 'Recycling aluminum cans uses 95% less energy than producing new ones from raw materials.'
    }
  };

  return suggestions[category] || {
    recycling: 'Follow local recycling guidelines for proper disposal.',
    alternatives: 'Look for eco-friendly alternatives to reduce waste generation.',
    impact: 'Every small action contributes to environmental protection.'
  };
}

// Location-Based Challenges Functions
function initializeLocationFeatures() {
  // Challenge tabs functionality
  const tabBtns = document.querySelectorAll('.tab-btn');
  const dailyChallenges = document.getElementById('daily-challenges');
  const locationChallenges = document.getElementById('location-challenges');

  // Set default state - show daily challenges with responsive grid
  function setResponsiveGrid() {
    if (dailyChallenges) {
      console.log('Setting grid for daily challenges');
      dailyChallenges.style.display = 'grid';
      dailyChallenges.style.visibility = 'visible';
      dailyChallenges.style.opacity = '1';

      if (window.innerWidth <= 480) {
        dailyChallenges.style.gridTemplateColumns = '1fr';
      } else if (window.innerWidth <= 1024) {
        dailyChallenges.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else {
        dailyChallenges.style.gridTemplateColumns = 'repeat(4, 1fr)';
      }

      dailyChallenges.style.gap = '1.5rem';

      // Ensure all cards are visible
      const cards = dailyChallenges.querySelectorAll('.challenge-card');
      cards.forEach(card => {
        card.style.display = 'flex';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
      });

      console.log(`Grid set with ${cards.length} cards visible`);
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.dataset.tab;
      if (tab === 'daily') {
        setResponsiveGrid();
        locationChallenges.style.display = 'none';
      } else {
        dailyChallenges.style.display = 'none';
        locationChallenges.style.display = 'block';
      }
    });
  });

  // Get location functionality
  document.getElementById('get-location').addEventListener('click', getLocationChallenges);

  // Initialize on load
  setResponsiveGrid();
  window.addEventListener('resize', setResponsiveGrid);

  if (locationChallenges) {
    locationChallenges.style.display = 'none';
  }
}

function getLocationChallenges() {
  showMessage('Getting your location...', 'info');

  if (!navigator.geolocation) {
    showMessage('Geolocation is not supported by this browser', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      loadNearbyEnvironmentalActivities(lat, lng);
    },
    (error) => {
      showMessage('Unable to get your location. Showing sample challenges.', 'warning');
      loadSampleLocationChallenges();
    }
  );
}

// Global variables for Maps
let map;
let userLocation;
let challengeMarkers = [];

function loadNearbyEnvironmentalActivities(lat, lng) {
  // Store user location
  userLocation = { lat, lng };

  // Show map and hide placeholder
  document.getElementById('map-placeholder').style.display = 'none';
  document.getElementById('google-map').style.display = 'block';

  // Initialize Map with animation
  initializeLeafletMap(lat, lng);
  animateMapReveal();

  // Simulate loading nearby environmental activities
  showMessage('Finding environmental activities near you...', 'info');

  setTimeout(() => {
    const sampleChallenges = [
      {
        title: 'Community Clean-up Drive',
        location: 'Central Park',
        description: 'Join local volunteers for a park cleaning initiative',
        points: 25,
        type: 'cleanup',
        distance: '0.5 km',
        lat: lat + 0.005,
        lng: lng + 0.005
      },
      {
        title: 'Tree Plantation Drive',
        location: 'Riverside Area',
        description: 'Help plant native trees along the riverbank',
        points: 30,
        type: 'plantation',
        distance: '1.2 km',
        lat: lat - 0.008,
        lng: lng + 0.010
      },
      {
        title: 'E-waste Collection Center',
        location: 'Municipal Office',
        description: 'Drop off your electronic waste for proper recycling',
        points: 15,
        type: 'ewaste',
        distance: '0.8 km',
        lat: lat + 0.007,
        lng: lng - 0.006
      },
      {
        title: 'Organic Farming Workshop',
        location: 'Community Garden',
        description: 'Learn sustainable farming techniques',
        points: 20,
        type: 'workshop',
        distance: '2.1 km',
        lat: lat - 0.015,
        lng: lng - 0.012
      }
    ];

    // Add markers to map
    addChallengeMarkers(sampleChallenges);

    // Update distance information
    const challengesWithDistance = sampleChallenges.map(challenge => ({
      ...challenge,
      location: `${challenge.location} (${challenge.distance} away)`
    }));

    displayLocationChallenges(challengesWithDistance);
    showMessage('Found nearby environmental activities!', 'success');
  }, 2000);
}

function initializeLeafletMap(lat, lng) {
  // Initialize Leaflet Map
  map = L.map('google-map').setView([lat, lng], 13);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Create custom user location icon
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div style="
      width: 20px; 
      height: 20px; 
      background: #4CAF50; 
      border: 3px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Add user location marker
  L.marker([lat, lng], { icon: userIcon })
    .addTo(map)
    .bindPopup('📍 Your Location')
    .openPopup();
}


function addChallengeMarkers(challenges) {
  if (!map) return;

  // Clear existing markers
  challengeMarkers.forEach(marker => map.removeLayer(marker));
  challengeMarkers = [];

  // Add new markers
  challenges.forEach((challenge, index) => {
    // Create custom icon for challenge type
    const challengeIcon = L.divIcon({
      className: 'challenge-marker',
      html: `<div style="
        width: 30px; 
        height: 30px; 
        background: ${getMarkerColor(challenge.type)}; 
        border: 2px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">${getMarkerEmoji(challenge.type)}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Create marker
    const marker = L.marker([challenge.lat, challenge.lng], { icon: challengeIcon })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 10px; max-width: 200px;">
          <h4 style="margin: 0 0 5px 0; color: #4CAF50;">${challenge.title}</h4>
          <p style="margin: 5px 0; font-size: 0.9rem;">${challenge.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <span style="color: #4CAF50; font-weight: bold;">+${challenge.points} points</span>
            <span style="font-size: 0.8rem; color: #666;">${challenge.distance}</span>
          </div>
          <button onclick="joinLocationChallenge('${challenge.title}', ${challenge.points})" 
                  style="width: 100%; margin-top: 10px; padding: 5px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Join Challenge
          </button>
        </div>
      `);

    challengeMarkers.push(marker);
  });
}

function getMarkerColor(type) {
  const colors = {
    cleanup: '#FF9800',
    plantation: '#4CAF50',
    ewaste: '#9C27B0',
    workshop: '#2196F3'
  };
  return colors[type] || colors.cleanup;
}

function getMarkerEmoji(type) {
  const emojis = {
    cleanup: '🧹',
    plantation: '🌳',
    ewaste: '♻️',
    workshop: '🌱'
  };
  return emojis[type] || emojis.cleanup;
}

function loadSampleLocationChallenges() {
  const sampleChallenges = [
    {
      title: 'Find Nearest Recycling Center',
      location: 'Use location services to find exact distance',
      description: 'Locate and visit your nearest recycling facility',
      points: 20,
      type: 'recycling',
      distance: 'Unknown'
    },
    {
      title: 'Local Environmental NGO',
      location: 'Enable location to find nearby NGOs',
      description: 'Connect with environmental organizations in your area',
      points: 25,
      type: 'ngo',
      distance: 'Unknown'
    }
  ];

  displayLocationChallenges(sampleChallenges);
}

function displayLocationChallenges(challenges) {
  const challengesList = document.getElementById('location-challenges-list');
  challengesList.innerHTML = '';

  challenges.forEach(challenge => {
    const challengeCard = document.createElement('div');
    challengeCard.className = 'location-challenge-card';
    challengeCard.innerHTML = `
      <div class="challenge-location">
        <i class="fas fa-map-marker-alt"></i>
        <span>${challenge.location}</span>
      </div>
      <h4>${challenge.title}</h4>
      <p>${challenge.description}</p>
      <div class="challenge-details">
        <span class="challenge-distance">📍 ${challenge.distance}</span>
        <span class="challenge-points">+${challenge.points} points</span>
      </div>
      <button class="challenge-btn" onclick="joinLocationChallenge('${challenge.title}', ${challenge.points})">
        <i class="fas fa-map-marked-alt"></i> Join Challenge
      </button>
    `;
    challengesList.appendChild(challengeCard);
  });
}

function joinLocationChallenge(title, points) {
  showMessage(`Joined "${title}"! Complete it to earn ${points} points.`, 'success');
  // In a real implementation, this would integrate with maps and tracking
}

// // Role-based Onboarding System
// function initializeOnboarding() {
//   const roleButtons = document.querySelectorAll('.role-btn');
//   const userTypeSelector = document.getElementById('user-type-selector');
//   const studentOnboarding = document.getElementById('student-onboarding');
//   const teacherOnboarding = document.getElementById('teacher-onboarding');
//   const govtOnboarding = document.getElementById('govt-onboarding');
//   const backButton = document.getElementById('back-to-roles');

//   // Role selection handlers
//   roleButtons.forEach(btn => {
//     btn.addEventListener('click', () => {
//       const role = btn.dataset.role;
//       userTypeSelector.style.display = 'none';
//       backButton.style.display = 'block';

//       // Hide all onboarding forms
//       if (studentOnboarding) studentOnboarding.style.display = 'none';
//       if (teacherOnboarding) teacherOnboarding.style.display = 'none';
//       if (govtOnboarding) govtOnboarding.style.display = 'none';

//       // Show selected role form
//       if (role === 'student') {
//         if (studentOnboarding) {
//           studentOnboarding.style.display = 'block';
//         } else {
//           showMessage('Student registration is currently unavailable.', 'info');
//           userTypeSelector.style.display = 'block';
//           backButton.style.display = 'none';
//         }
//       } else if (role === 'teacher') {
//         teacherOnboarding.style.display = 'block';
//       } else if (role === 'government') {
//         govtOnboarding.style.display = 'block';
//       }
//     });
//   });

//   // Back button handler
//   backButton.addEventListener('click', () => {
//     userTypeSelector.style.display = 'block';
//     if (studentOnboarding) studentOnboarding.style.display = 'none';
//     if (teacherOnboarding) teacherOnboarding.style.display = 'none';
//     if (govtOnboarding) govtOnboarding.style.display = 'none';
//     backButton.style.display = 'none';
//   });

//   // Verification handlers
//   const verifyStudentBtn = document.getElementById('verify-student');
//   if (verifyStudentBtn) {
//     verifyStudentBtn.addEventListener('click', handleStudentVerification);
//   }
//   document.getElementById('verify-teacher').addEventListener('click', handleTeacherVerification);
//   document.getElementById('verify-official').addEventListener('click', handleOfficialVerification);
// }

// function handleStudentVerification() {
//   const udiseCode = document.getElementById('udise-code').value;
//   const studentClass = document.getElementById('student-class').value;
//   const rollNumber = document.getElementById('roll-number').value;
//   const studentName = document.getElementById('student-name').value;
//   const studentPhone = document.getElementById('student-phone').value;

//   if (!udiseCode || !studentClass || !rollNumber || !studentName || !studentPhone) {
//     showMessage('Please fill all required fields', 'error');
//     return;
//   }

//   // Simulate UDISE verification
//   showMessage('Verifying UDISE code...', 'info');

//   setTimeout(() => {
//     // Mock school data
//     const mockSchools = {
//       '03180101001': 'Government Senior Secondary School, Amritsar',
//       '03180201002': 'DAV Public School, Jalandhar',
//       '03180301003': 'Government High School, Ludhiana',
//       '03180401004': 'Khalsa College Public School, Patiala'
//     };

//     const schoolName = mockSchools[udiseCode];

//     if (schoolName) {
//       // Store student data
//       const studentData = {
//         role: 'student',
//         udiseCode,
//         schoolName,
//         class: studentClass,
//         rollNumber,
//         name: studentName,
//         phone: studentPhone,
//         registrationDate: new Date().toISOString(),
//         trustScore: 'Medium',
//         ecoPoints: 0,
//         level: 1
//       };

//       localStorage.setItem('ecoUserData', JSON.stringify(studentData));
//       localStorage.setItem('ecoUserName', studentName);
//       localStorage.setItem('ecoUserRole', 'student');
//       localStorage.setItem('ecoLoggedIn', 'true');

//       showMessage(`Welcome ${studentName}! Registered to ${schoolName}`, 'success');

//       setTimeout(() => {
//         document.getElementById('login-overlay').style.display = 'none';
//         setSectionsVisibility(true);
//         updateProfileUI();
//       }, 2000);

//     } else {
//       showMessage('Invalid UDISE code. Please check and try again.', 'error');
//     }
//   }, 2000);
// }

// function handleTeacherVerification() {
//   const teacherUdise = document.getElementById('teacher-udise').value;
//   const teacherId = document.getElementById('teacher-id').value;
//   const teacherName = document.getElementById('teacher-name').value;
//   const teacherRole = document.getElementById('teacher-role').value;
//   const teacherPhone = document.getElementById('teacher-phone').value;

//   if (!teacherUdise || !teacherId || !teacherName || !teacherRole || !teacherPhone) {
//     showMessage('Please fill all required fields', 'error');
//     return;
//   }

//   showMessage('Verifying teacher credentials...', 'info');

//   setTimeout(() => {
//     const teacherData = {
//       role: 'teacher',
//       udiseCode: teacherUdise,
//       teacherId,
//       name: teacherName,
//       teacherRole,
//       phone: teacherPhone,
//       registrationDate: new Date().toISOString(),
//       permissions: ['moderate_submissions', 'create_challenges', 'view_analytics']
//     };

//     localStorage.setItem('ecoUserData', JSON.stringify(teacherData));
//     localStorage.setItem('ecoUserName', teacherName);
//     localStorage.setItem('ecoUserRole', 'teacher');
//     localStorage.setItem('ecoLoggedIn', 'true');

//     showMessage(`Welcome ${teacherName}! Teacher account verified.`, 'success');

//     setTimeout(() => {
//       document.getElementById('login-overlay').style.display = 'none';
//       setSectionsVisibility(true);
//       updateProfileUI();
//       initializeTeacherDashboard();
//     }, 2000);
//   }, 2000);
// }

// function handleOfficialVerification() {
//   const orgName = document.getElementById('org-name').value;
//   const orgType = document.getElementById('org-type').value;
//   const officialId = document.getElementById('official-id').value;
//   const officialName = document.getElementById('official-name').value;
//   const officialPhone = document.getElementById('official-phone').value;

//   if (!orgName || !orgType || !officialId || !officialName || !officialPhone) {
//     showMessage('Please fill all required fields', 'error');
//     return;
//   }

//   showMessage('Verifying official credentials...', 'info');

//   setTimeout(() => {
//     const officialData = {
//       role: 'government',
//       orgName,
//       orgType,
//       officialId,
//       name: officialName,
//       phone: officialPhone,
//       registrationDate: new Date().toISOString(),
//       permissions: ['view_analytics', 'audit_submissions', 'generate_reports']
//     };

//     localStorage.setItem('ecoUserData', JSON.stringify(officialData));
//     localStorage.setItem('ecoUserName', officialName);
//     localStorage.setItem('ecoUserRole', 'government');
//     localStorage.setItem('ecoLoggedIn', 'true');

//     showMessage(`Welcome ${officialName}! Official account verified.`, 'success');

//     setTimeout(() => {
//       document.getElementById('login-overlay').style.display = 'none';
//       setSectionsVisibility(true);
//       updateProfileUI();
//       initializeGovernmentDashboard();
//     }, 2000);
//   }, 2000);
// }

// function initializeTeacherDashboard() {
//   // Add teacher-specific features
//   showMessage('Teacher dashboard features activated!', 'info');
//   // This would initialize teacher-specific UI elements
// }

// function initializeGovernmentDashboard() {
//   // Add government-specific features
//   showMessage('Government dashboard features activated!', 'info');
//   // This would initialize government-specific UI elements
// }

// Initialize quiz event listeners
document.addEventListener("DOMContentLoaded", function () {

  // Login gating
  const loginOverlay = document.getElementById("login-overlay");
  const loginSubmit = document.getElementById("login-submit");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  function setSectionsVisibility(isLoggedIn) {
    const sections = document.querySelectorAll("section");
    sections.forEach((sec) => {
      if (sec.id === "home") {
        sec.style.display = "block";
      } else {
        sec.style.display = isLoggedIn ? "block" : "none";
      }
    });
  }

  const alreadyLoggedIn = localStorage.getItem("ecoLoggedIn") === "true";
  if (!alreadyLoggedIn && loginOverlay) {
    loginOverlay.style.display = "flex";
    setSectionsVisibility(false);
  } else {
    setSectionsVisibility(true);
  }

  if (loginSubmit && loginOverlay) {
    loginSubmit.addEventListener("click", (e) => {
      e.preventDefault();
      const email = (emailInput && emailInput.value.trim()) || "";
      const password = (passwordInput && passwordInput.value.trim()) || "";
      if (!email || !password) {
        showMessage("Please enter email and password", "error");
        return;
      }
      // Demo auth: accept any non-empty values
      localStorage.setItem("ecoLoggedIn", "true");
      localStorage.setItem("ecoUserEmail", email);
      // Use part before @ as display name
      const displayName = email.split("@")[0];
      localStorage.setItem("ecoUserName", displayName);
      loginOverlay.style.display = "none";
      setSectionsVisibility(true);
      showMessage("Logged in successfully!", "success");
      updateProfileUI();
    });
  }
  // Quiz category buttons
  document.querySelectorAll(".start-quiz-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const category = e.target.getAttribute("data-category");
      startQuiz(category);
    });
  });

  // Quiz navigation
  document
    .getElementById("next-question")
    .addEventListener("click", nextQuestion);
  document
    .getElementById("prev-question")
    .addEventListener("click", prevQuestion);
  document.getElementById("submit-quiz").addEventListener("click", submitQuiz);
  document
    .getElementById("restart-quiz")
    .addEventListener("click", restartQuiz);
  document
    .getElementById("try-another-quiz")
    .addEventListener("click", tryAnotherQuiz);
  document
    .getElementById("quiz-back-btn")
    .addEventListener("click", goBackToCategories);

  // Initialize new features
  initializeAIFeatures();
  initializeLocationFeatures();

  // Initialize points display
  updatePointsDisplay();

  // Restore completed challenges state
  restoreCompletedChallenges();
});

// Restore completed challenges from localStorage
function restoreCompletedChallenges() {
  const today = new Date().toDateString();
  const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '{}');
  const todayCompleted = completedChallenges[today] || [];

  // Find all challenge buttons and mark completed ones
  const challengeButtons = document.querySelectorAll('.challenge-btn');
  challengeButtons.forEach(button => {
    const onclick = button.getAttribute('onclick');
    if (onclick) {
      // Extract challenge name from onclick attribute
      const match = onclick.match(/'([^']+)'/);
      if (match && todayCompleted.includes(match[1])) {
        button.classList.add('completed');
        button.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        button.style.background = '#4CAF50';
        button.style.cursor = 'not-allowed';
        button.disabled = true;
      }
    }
  });
}

// AI Camera Functions
function initializeAICamera() {
  const startCameraBtn = document.getElementById("start-camera");
  const capturePhotoBtn = document.getElementById("capture-photo");
  const retakePhotoBtn = document.getElementById("retake-photo");
  const analyzePhotoBtn = document.getElementById("analyze-photo");
  const sharePhotoBtn = document.getElementById("share-photo");
  const saveSuggestionsBtn = document.getElementById("save-suggestions");
  const getMoreSuggestionsBtn = document.getElementById("get-more-suggestions");

  const cameraVideo = document.getElementById("camera-video");
  const cameraCanvas = document.getElementById("camera-canvas");
  const capturedImage = document.getElementById("captured-image");
  const photoResult = document.querySelector(".photo-result");
  const aiSuggestions = document.querySelector(".ai-suggestions");

  // Check if all required elements exist
  if (!startCameraBtn || !capturePhotoBtn || !cameraVideo || !cameraCanvas) {
    console.warn("AI Camera elements not found, skipping initialization");
    return;
  }

  let stream = null;
  let capturedPhotoData = null;

  // Start camera
  startCameraBtn.addEventListener("click", async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      cameraVideo.srcObject = stream;
      startCameraBtn.disabled = true;
      capturePhotoBtn.disabled = false;

      // Show camera tips
      showCameraTips();
    } catch (error) {
      console.error("Error accessing camera:", error);
      showMessage(
        "Camera access denied. Please allow camera permission.",
        "error"
      );
    }
  });

  // Capture photo
  capturePhotoBtn.addEventListener("click", () => {
    const context = cameraCanvas.getContext("2d");
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;

    context.drawImage(cameraVideo, 0, 0);
    capturedPhotoData = cameraCanvas.toDataURL("image/jpeg");

    capturedImage.src = capturedPhotoData;
    photoResult.style.display = "block";
    capturePhotoBtn.style.display = "none";
    retakePhotoBtn.style.display = "inline-block";
    analyzePhotoBtn.disabled = false;

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  });

  // Retake photo
  retakePhotoBtn.addEventListener("click", () => {
    photoResult.style.display = "none";
    aiSuggestions.style.display = "none";
    capturePhotoBtn.style.display = "inline-block";
    retakePhotoBtn.style.display = "none";
    analyzePhotoBtn.disabled = true;

    // Restart camera
    startCamera();
  });

  // Analyze photo
  analyzePhotoBtn.addEventListener("click", () => {
    analyzePhotoBtn.disabled = true;
    analyzePhotoBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    // Simulate AI analysis
    setTimeout(() => {
      generateAISuggestions();
      aiSuggestions.style.display = "block";
      analyzePhotoBtn.disabled = false;
      analyzePhotoBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze Photo';
    }, 2000);
  });

  // Share photo
  sharePhotoBtn.addEventListener("click", () => {
    if (capturedPhotoData) {
      // Create a temporary link to download the image
      const link = document.createElement("a");
      link.download = "eco-photo.jpg";
      link.href = capturedPhotoData;
      link.click();
      showMessage("Photo saved successfully!", "success");
    }
  });

  // Save suggestions
  saveSuggestionsBtn.addEventListener("click", () => {
    const points = Math.floor(Math.random() * 20) + 10;
    completeTask("AI Photo Analysis", points);
    showMessage(`Great job! You earned ${points} eco-points!`, "success");
  });

  // Get more suggestions
  getMoreSuggestionsBtn.addEventListener("click", () => {
    generateAISuggestions();
    showMessage("New suggestions generated!", "info");
  });

  function startCamera() {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((stream) => {
        cameraVideo.srcObject = stream;
        capturePhotoBtn.disabled = false;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }

  function generateAISuggestions() {
    const suggestions = [
      {
        immediate: [
          "Turn off lights when not in use",
          "Use reusable water bottles",
          "Walk or bike for short distances",
          "Unplug electronics when not in use",
          "Use natural light during the day",
        ],
        longTerm: [
          "Install solar panels on your roof",
          "Switch to energy-efficient appliances",
          "Plant native trees in your garden",
          "Start a compost bin",
          "Use public transportation more often",
        ],
        impact: [
          "Reduce carbon footprint by 30%",
          "Save 500 kWh of electricity annually",
          "Prevent 200kg of CO2 emissions",
          "Save 1000 liters of water per year",
          "Create habitat for local wildlife",
        ],
      },
    ];

    const suggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)];

    document.getElementById("immediate-actions").innerHTML =
      suggestion.immediate.map((action) => `• ${action}`).join("<br>");
    document.getElementById("long-term-goals").innerHTML = suggestion.longTerm
      .map((goal) => `• ${goal}`)
      .join("<br>");
    document.getElementById("environmental-impact").innerHTML =
      suggestion.impact.map((impact) => `• ${impact}`).join("<br>");
  }

  function showCameraTips() {
    const tips = [
      "Hold your phone steady for better results",
      "Ensure good lighting for accurate analysis",
      "Point camera at waste items or environmental features",
      "Keep the camera at a reasonable distance",
    ];

    showMessage(
      `Tip: ${tips[Math.floor(Math.random() * tips.length)]}`,
      "info"
    );
  }
}

// Gallery Functions
function initializeGallery() {
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (galleryItems.length === 0) {
    console.warn("No gallery items found, skipping gallery initialization");
    return;
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Create modal for image viewing
      const modal = document.createElement("div");
      modal.className = "gallery-modal";
      modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
      `;

      const img = document.createElement("img");
      img.src = item.querySelector("img").src;
      img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
      `;

      modal.appendChild(img);
      document.body.appendChild(modal);

      // Close modal on click
      modal.addEventListener("click", () => {
        document.body.removeChild(modal);
      });

      // Close modal on escape key
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          document.body.removeChild(modal);
          document.removeEventListener("keydown", handleEscape);
        }
      };
      document.addEventListener("keydown", handleEscape);
    });
  });
}

// Contact Form Functions
function initializeContactForm() {
  const contactForm = document.querySelector(".contact-form");

  if (!contactForm) {
    console.warn("Contact form not found, skipping initialization");
    return;
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    // Simulate form submission
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    setTimeout(() => {
      showMessage(
        "Thank you for your message! We'll get back to you soon.",
        "success"
      );
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 2000);
  });
}

// Newsletter Functions
function initializeNewsletter() {
  const newsletterForm = document.querySelector(".newsletter-form");

  if (!newsletterForm) {
    console.warn("Newsletter form not found, skipping initialization");
    return;
  }

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = newsletterForm.querySelector("input[type='email']").value;

    if (email) {
      showMessage("Thank you for subscribing to our newsletter!", "success");
      newsletterForm.reset();
    }
  });
}

// Innovation & Impact Section Functions
function initializeInnovationSection() {
  // Demo tabs functionality
  const demoTabs = document.querySelectorAll(".demo-tab");
  const demoPanels = document.querySelectorAll(".demo-panel");

  if (demoTabs.length === 0) {
    console.warn(
      "No demo tabs found, skipping innovation section initialization"
    );
    return;
  }

  demoTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");

      // Remove active class from all tabs and panels
      demoTabs.forEach((t) => t.classList.remove("active"));
      demoPanels.forEach((p) => p.classList.remove("active"));

      // Add active class to clicked tab and corresponding panel
      tab.classList.add("active");
      const targetPanel = document.getElementById(target);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

// Debug and Validation Functions
function validateWebsiteElements() {
  const requiredElements = [
    { id: "game-selection", name: "Game Selection" },
    { id: "click-sort-game", name: "Click Sort Game" },
    { id: "drag-drop-game", name: "Drag Drop Game" },
    { id: "memory-match-game", name: "Memory Match Game" },
    { id: "start-camera", name: "Start Camera Button" },
    { id: "capture-photo", name: "Capture Photo Button" },
    { id: "quiz-title", name: "Quiz Title" },
    { id: "question-text", name: "Question Text" },
  ];

  const missingElements = [];
  requiredElements.forEach((element) => {
    if (!document.getElementById(element.id)) {
      missingElements.push(element.name);
    }
  });

  if (missingElements.length > 0) {
    console.warn("Missing elements:", missingElements);
  } else {
    console.log("✅ All required elements found");
  }
}

// Test Game Functions
function testGameFunctions() {
  console.log("🎮 Testing game functions...");

  // Test if game functions are defined
  const gameFunctions = [
    "startGame",
    "initClickSortGame",
    "initDragDropGame",
    "initMemoryMatchGame",
    "handleBinClick",
    "handleDragStart",
    "handleDragEnd",
    "handleCardClick",
  ];

  const missingFunctions = [];
  gameFunctions.forEach((funcName) => {
    if (typeof window[funcName] !== "function") {
      missingFunctions.push(funcName);
    }
  });

  if (missingFunctions.length > 0) {
    console.warn("Missing game functions:", missingFunctions);
  } else {
    console.log("✅ All game functions are defined");
  }

  // Test if GSAP animations are available
  if (typeof gsap !== "undefined") {
    console.log("✅ GSAP is loaded");
  } else {
    console.warn("❌ GSAP is not loaded");
  }

  // Test if ScrollTrigger is available
  if (typeof ScrollTrigger !== "undefined") {
    console.log("✅ ScrollTrigger is loaded");
  } else {
    console.warn("❌ ScrollTrigger is not loaded");
  }
}

// Utility Functions
function initializeUtilities() {
  // Validate website elements
  validateWebsiteElements();

  // Test game functions
  testGameFunctions();

  // Auto-hide messages after 5 seconds
  const messages = document.querySelectorAll(".message");
  messages.forEach((message) => {
    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }
    }, 5000);
  });

  // Add keyboard navigation support
  document.addEventListener("keydown", (e) => {
    // Escape key to close modals
    if (e.key === "Escape") {
      const modals = document.querySelectorAll(".gallery-modal");
      modals.forEach((modal) => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      });
    }
  });

  // Add loading states to buttons
  const buttons = document.querySelectorAll(
    "button, .cta-button, .feature-btn, .challenge-btn"
  );
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!this.disabled && !this.classList.contains("no-loading")) {
        this.classList.add("loading");
        setTimeout(() => {
          this.classList.remove("loading");
        }, 1000);
      }
    });
  });

  // Add smooth scroll to navigation links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // Add intersection observer for lazy loading
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, observerOptions);

  // Observe all sections
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => {
    observer.observe(section);
  });
}

// Profile Management
function updateProfileDisplay() {
  const currentUser = JSON.parse(localStorage.getItem('ecolearn_current_user') || 'null');
  const profileSection = document.getElementById('profile');

  if (!profileSection) return;

  if (currentUser) {
    // Show profile section
    profileSection.style.display = 'block';

    // Update profile information
    const profileName = document.getElementById('profile-name');
    const profilePoints = document.getElementById('profile-points');
    const profileQuizzes = document.getElementById('profile-quizzes');
    const profileBest = document.getElementById('profile-best');

    if (profileName) profileName.textContent = currentUser.name || 'User';
    if (profilePoints) profilePoints.textContent = currentUser.ecoPoints || 0;
    if (profileQuizzes) profileQuizzes.textContent = currentUser.completedChallenges?.length || 0;
    if (profileBest) profileBest.textContent = (currentUser.bestQuizScore || 0) + '%';

    // Update quiz history
    updateQuizHistory(currentUser);
  } else {
    // Hide profile section when not logged in
    profileSection.style.display = 'none';
  }
}

function updateQuizHistory(user) {
  const historyList = document.getElementById('profile-history-list');
  if (!historyList) return;

  const quizHistory = user.quizHistory || [];

  if (quizHistory.length === 0) {
    historyList.innerHTML = '<div class="history-item">No quiz history yet. Take a quiz to see your results here!</div>';
    return;
  }

  historyList.innerHTML = quizHistory.slice(-5).reverse().map(quiz => `
    <div class="history-item">
      <span>${quiz.date || 'Recent'}</span>
      <span>${quiz.score || 0}% - ${quiz.category || 'General Quiz'}</span>
    </div>
  `).join('');
}

// Initialize everything
document.addEventListener("DOMContentLoaded", function () {
  initializeFactorsToggle();
  initializeRoadmap();
  updatePointsDisplay();
  initializeInnovationSection();
  updateProfileDisplay();
  initializeAICamera();
  initializeGallery();
  initializeContactForm();
  initializeNewsletter();
  initializeUtilities();

  // Initialize GSAP animations
  initializeGSAPAnimations();
  initializeHoverEffects();
  enhanceGameAnimations();
  initializeNavigationAnimations();
  initializeMobileMenu();

  // Replace confetti function with GSAP version
  window.addConfetti = createGSAPConfetti;
  window.animateMilestoneCompletion = animateMilestoneCompletion;

  // Make game functions globally available
  window.startGame = startGame;
  window.backToSelection = backToSelection;
  window.initClickSortGame = initClickSortGame;
  window.initDragDropGame = initDragDropGame;
  window.initMemoryMatchGame = initMemoryMatchGame;
  window.initTrashSorterGame = initTrashSorterGame;
  window.initPlantTreeGame = initPlantTreeGame;
  window.initSaveOceanGame = initSaveOceanGame;
  window.initCleanCityGame = initCleanCityGame;
  window.initRainwaterCollectorGame = initRainwaterCollectorGame;
  window.initSolarPanelBuilderGame = initSolarPanelBuilderGame;
  window.initSaveTheForestGame = initSaveTheForestGame;

  // Make utility functions globally available
  window.showMessage = showMessage;
  window.completeTask = completeTask;
  window.completeDailyChallenge = completeDailyChallenge;
  window.updatePointsDisplay = updatePointsDisplay;
  window.updateProfileUI = updateProfileUI;

  console.log("🚀 EcoLearn website initialized successfully!");

  // Advanced Trash Sorter Game Implementation
  function initTrashSorterGame() {
    const gameState = {
      score: 0,
      timeLeft: 60,
      level: 1,
      streak: 0,
      isPlaying: false,
      isPaused: false,
      gameInterval: null,
      spawnInterval: null,
      fallSpeed: 2,
      spawnRate: 2000,
      fallingItems: []
    };

    const trashItems = [
      // Plastic items
      { type: "plastic", emoji: "🧴", name: "Bottle" },
      { type: "plastic", emoji: "🥤", name: "Cup" },
      { type: "plastic", emoji: "🛍️", name: "Bag" },
      { type: "plastic", emoji: "🍽️", name: "Plate" },

      // Paper items
      { type: "paper", emoji: "📄", name: "Paper" },
      { type: "paper", emoji: "📰", name: "Newspaper" },
      { type: "paper", emoji: "📦", name: "Box" },
      { type: "paper", emoji: "📚", name: "Book" },

      // Organic items
      { type: "organic", emoji: "🍎", name: "Apple" },
      { type: "organic", emoji: "🍌", name: "Banana" },
      { type: "organic", emoji: "🥕", name: "Carrot" },
      { type: "organic", emoji: "🍞", name: "Bread" },

      // Metal items
      { type: "metal", emoji: "🥫", name: "Can" },
      { type: "metal", emoji: "🔧", name: "Tool" },
      { type: "metal", emoji: "🪙", name: "Coin" },
      { type: "metal", emoji: "📎", name: "Clip" },

      // Glass items
      { type: "glass", emoji: "🍾", name: "Bottle" },
      { type: "glass", emoji: "🥛", name: "Glass" },
      { type: "glass", emoji: "💡", name: "Bulb" },
      { type: "glass", emoji: "🪟", name: "Mirror" }
    ];

    const elements = {
      scoreEl: document.getElementById('trash-score'),
      timerEl: document.getElementById('trash-timer'),
      levelEl: document.getElementById('trash-level'),
      streakEl: document.getElementById('trash-streak'),
      gameArea: document.getElementById('trash-game-area'),
      fallingZone: document.querySelector('.falling-items-zone'),
      bins: document.querySelectorAll('.trash-bin'),
      startBtn: document.getElementById('start-trash-game'),
      pauseBtn: document.getElementById('pause-trash-game'),
      resetBtn: document.getElementById('reset-trash-game'),
      binCounters: {}
    };

    // Initialize bin counters
    elements.bins.forEach(bin => {
      const type = bin.dataset.type;
      elements.binCounters[type] = bin.querySelector('.bin-counter');
    });

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.timerEl.textContent = gameState.timeLeft;
      elements.levelEl.textContent = gameState.level;
      elements.streakEl.textContent = gameState.streak;
    }

    function createFallingItem() {
      const randomItem = trashItems[Math.floor(Math.random() * trashItems.length)];
      const item = document.createElement('div');
      item.className = 'falling-item';
      item.textContent = randomItem.emoji;
      item.dataset.type = randomItem.type;
      item.dataset.name = randomItem.name;

      // Random horizontal position
      const maxX = elements.fallingZone.offsetWidth - 50;
      item.style.left = Math.random() * maxX + 'px';
      item.style.top = '0px';

      elements.fallingZone.appendChild(item);
      gameState.fallingItems.push({
        element: item,
        x: parseInt(item.style.left),
        y: 0,
        type: randomItem.type
      });

      // Make item draggable
      makeDraggable(item);

      return item;
    }

    function makeDraggable(item) {
      let isDragging = false;
      let startX, startY, offsetX, offsetY;

      item.addEventListener('mousedown', startDrag);
      item.addEventListener('touchstart', startDrag);

      function startDrag(e) {
        isDragging = true;
        item.classList.add('dragging');

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const rect = item.getBoundingClientRect();

        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);

        e.preventDefault();
      }

      function drag(e) {
        if (!isDragging) return;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        item.style.left = (clientX - offsetX) + 'px';
        item.style.top = (clientY - offsetY) + 'px';
        item.style.zIndex = '1000';
      }

      function stopDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        item.classList.remove('dragging');

        // Check if dropped on a bin
        const dropTarget = getDropTarget(e);
        if (dropTarget) {
          handleDrop(item, dropTarget);
        }

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
      }
    }

    function getDropTarget(e) {
      const clientX = e.clientX || e.changedTouches[0].clientX;
      const clientY = e.clientY || e.changedTouches[0].clientY;

      return document.elementFromPoint(clientX, clientY)?.closest('.trash-bin');
    }

    function handleDrop(item, bin) {
      const itemType = item.dataset.type;
      const binType = bin.dataset.type;
      const isCorrect = itemType === binType;

      if (isCorrect) {
        // Correct drop
        gameState.score += 10 + (gameState.streak * 2);
        gameState.streak++;
        bin.classList.add('correct-drop');

        // Update bin counter
        const currentCount = parseInt(elements.binCounters[binType].textContent);
        elements.binCounters[binType].textContent = currentCount + 1;

        // Show success message
        showFloatingMessage('+' + (10 + (gameState.streak * 2)), item, '#4CAF50');

      } else {
        // Wrong drop
        gameState.score = Math.max(0, gameState.score - 5);
        gameState.streak = 0;
        bin.classList.add('wrong-drop');

        // Show error message
        showFloatingMessage('-5', item, '#f44336');
      }

      // Remove item
      removeItem(item);

      // Remove animation class after animation
      setTimeout(() => {
        bin.classList.remove('correct-drop', 'wrong-drop');
      }, 600);

      // Check level progression
      checkLevelUp();
      updateUI();
    }

    function showFloatingMessage(text, item, color) {
      const message = document.createElement('div');
      message.textContent = text;
      message.style.cssText = `
      position: absolute;
      left: ${item.style.left};
      top: ${item.style.top};
      color: ${color};
      font-weight: bold;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 1001;
    `;

      elements.fallingZone.appendChild(message);

      // Animate message
      gsap.to(message, {
        duration: 1,
        y: -50,
        opacity: 0,
        scale: 1.5,
        ease: "power2.out",
        onComplete: () => message.remove()
      });
    }

    function removeItem(item) {
      const index = gameState.fallingItems.findIndex(fi => fi.element === item);
      if (index > -1) {
        gameState.fallingItems.splice(index, 1);
      }
      item.remove();
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.score / 100) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.fallSpeed += 0.5;
        gameState.spawnRate = Math.max(1000, gameState.spawnRate - 200);

        // Restart spawn interval with new rate
        if (gameState.spawnInterval) {
          clearInterval(gameState.spawnInterval);
          gameState.spawnInterval = setInterval(createFallingItem, gameState.spawnRate);
        }

        showMessage(`Level Up! Now Level ${gameState.level}`, 'success');
      }
    }

    function updateFallingItems() {
      gameState.fallingItems.forEach((item, index) => {
        item.y += gameState.fallSpeed;
        item.element.style.top = item.y + 'px';

        // Remove items that fall off screen
        if (item.y > elements.fallingZone.offsetHeight) {
          removeItem(item.element);
          gameState.streak = 0; // Reset streak for missed items
        }
      });
    }

    function startGame() {
      if (gameState.isPlaying) return;

      gameState.isPlaying = true;
      gameState.isPaused = false;
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;

      // Start game timer
      gameState.gameInterval = setInterval(() => {
        if (!gameState.isPaused) {
          gameState.timeLeft--;
          updateUI();
          updateFallingItems();

          if (gameState.timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);

      // Start spawning items
      gameState.spawnInterval = setInterval(() => {
        if (!gameState.isPaused) {
          createFallingItem();
        }
      }, gameState.spawnRate);

      showMessage('Game Started! Drag items to correct bins!', 'info');
    }

    function pauseGame() {
      gameState.isPaused = !gameState.isPaused;
      elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';

      if (gameState.isPaused) {
        showMessage('Game Paused', 'warning');
      } else {
        showMessage('Game Resumed', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);

      // Clear falling items
      gameState.fallingItems.forEach(item => item.element.remove());
      gameState.fallingItems = [];

      // Reset game state
      gameState.score = 0;
      gameState.timeLeft = 60;
      gameState.level = 1;
      gameState.streak = 0;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.fallSpeed = 2;
      gameState.spawnRate = 2000;

      // Reset UI
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.pauseBtn.textContent = '⏸️ Pause';

      // Reset bin counters
      Object.values(elements.binCounters).forEach(counter => {
        counter.textContent = '0';
      });

      updateUI();
      showMessage('Game Reset!', 'info');
    }

    function endGame() {
      gameState.isPlaying = false;

      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);

      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;

      // Calculate final score and award points
      const finalScore = gameState.score;
      const pointsEarned = Math.floor(finalScore / 10);

      if (pointsEarned > 0) {
        completeTask(`Trash Sorter Game (Score: ${finalScore})`, pointsEarned);
      }

      showMessage(`Game Over! Final Score: ${finalScore} | Points Earned: ${pointsEarned}`, 'success');

      // Show confetti for good scores
      if (finalScore >= 100) {
        addConfetti();
      }
    }

    // Event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.resetBtn.addEventListener('click', resetGame);

    // Initialize drag and drop for bins
    elements.bins.forEach(bin => {
      bin.addEventListener('dragover', e => e.preventDefault());
      bin.addEventListener('drop', e => {
        e.preventDefault();
        const draggedItem = document.querySelector('.falling-item.dragging');
        if (draggedItem) {
          handleDrop(draggedItem, bin);
        }
      });
    });

    // Initialize UI
    updateUI();
    showMessage('Advanced Trash Sorter loaded! Click Start to begin!', 'info');
  }

  // Plant the Tree Game Implementation
  function initPlantTreeGame() {
    const gameState = {
      score: 0,
      treesPlanted: 0,
      level: 1,
      co2Saved: 0,
      energy: 100,
      isPlaying: false,
      autoWaterEnabled: false,
      plants: [],
      achievements: {
        'first-tree': false,
        'forest-maker': false,
        'eco-warrior': false
      }
    };

    const plantStages = [
      { emoji: '🌰', name: 'Seed', stage: 0 },
      { emoji: '🌱', name: 'Sprout', stage: 1 },
      { emoji: '🌿', name: 'Sapling', stage: 2 },
      { emoji: '🌳', name: 'Tree', stage: 3 }
    ];

    const elements = {
      scoreEl: document.getElementById('plant-score'),
      treesEl: document.getElementById('trees-planted'),
      levelEl: document.getElementById('plant-level'),
      co2El: document.getElementById('co2-saved'),
      garden: document.getElementById('plant-garden'),
      plantsContainer: document.getElementById('plants-container'),
      waterBtn: document.getElementById('water-btn'),
      sunBtn: document.getElementById('sun-btn'),
      fertilizerBtn: document.getElementById('fertilizer-btn'),
      plantSeedBtn: document.getElementById('plant-seed-btn'),
      startBtn: document.getElementById('start-plant-game'),
      autoWaterBtn: document.getElementById('auto-water'),
      resetBtn: document.getElementById('reset-plant-game'),
      sunIndicator: document.getElementById('sun-indicator'),
      weatherEffects: document.getElementById('weather-effects'),
      achievementsContainer: document.getElementById('plant-achievements')
    };

    let selectedPlant = null;
    let autoWaterInterval = null;
    let weatherInterval = null;

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.treesEl.textContent = gameState.treesPlanted;
      elements.levelEl.textContent = gameState.level;
      elements.co2El.textContent = gameState.co2Saved;

      // Update button states based on energy
      elements.waterBtn.disabled = gameState.energy < 5;
      elements.sunBtn.disabled = gameState.energy < 3;
      elements.fertilizerBtn.disabled = gameState.energy < 10;
      elements.plantSeedBtn.disabled = gameState.energy < 15;
    }

    function createPlant(x, y) {
      const plant = {
        id: Date.now(),
        x: x,
        y: y,
        stage: 0,
        health: 100,
        waterLevel: 50,
        sunLevel: 50,
        growthTimer: 0,
        element: null
      };

      const plantElement = document.createElement('div');
      plantElement.className = 'plant';
      plantElement.textContent = plantStages[0].emoji;
      plantElement.style.left = x + 'px';
      plantElement.style.bottom = y + 'px';
      plantElement.dataset.plantId = plant.id;

      plantElement.addEventListener('click', () => selectPlant(plant));

      elements.plantsContainer.appendChild(plantElement);
      plant.element = plantElement;

      gameState.plants.push(plant);

      // Animation
      plantElement.classList.add('growing');
      setTimeout(() => plantElement.classList.remove('growing'), 1000);

      return plant;
    }

    function selectPlant(plant) {
      // Remove selection from other plants
      document.querySelectorAll('.plant').forEach(p => p.classList.remove('selected'));

      // Select current plant
      plant.element.classList.add('selected');
      selectedPlant = plant;

      showMessage(`Selected ${plantStages[plant.stage].name}`, 'info');
    }

    function plantSeed() {
      if (gameState.energy < 15) {
        showMessage('Not enough energy to plant seed!', 'warning');
        return;
      }

      // Random position in garden
      const maxX = elements.plantsContainer.offsetWidth - 50;
      const x = Math.random() * maxX;
      const y = 0;

      createPlant(x, y);
      gameState.energy -= 15;
      gameState.score += 5;

      updateUI();
      showMessage('Seed planted! 🌰', 'success');
    }

    function waterPlant() {
      if (!selectedPlant) {
        showMessage('Select a plant first!', 'warning');
        return;
      }

      if (gameState.energy < 5) {
        showMessage('Not enough energy!', 'warning');
        return;
      }

      selectedPlant.waterLevel = Math.min(100, selectedPlant.waterLevel + 30);
      selectedPlant.element.classList.add('watered');
      setTimeout(() => selectedPlant.element.classList.remove('watered'), 800);

      gameState.energy -= 5;
      gameState.score += 2;

      // Create water effect
      createWaterEffect(selectedPlant.element);

      updateUI();
      showMessage('Plant watered! 💧', 'success');

      // Check for growth
      checkPlantGrowth(selectedPlant);
    }

    function giveSunlight() {
      if (!selectedPlant) {
        showMessage('Select a plant first!', 'warning');
        return;
      }

      if (gameState.energy < 3) {
        showMessage('Not enough energy!', 'warning');
        return;
      }

      selectedPlant.sunLevel = Math.min(100, selectedPlant.sunLevel + 25);
      gameState.energy -= 3;
      gameState.score += 2;

      // Sun effect
      createSunEffect(selectedPlant.element);

      updateUI();
      showMessage('Sunlight provided! ☀️', 'success');

      // Check for growth
      checkPlantGrowth(selectedPlant);
    }

    function useFertilizer() {
      if (!selectedPlant) {
        showMessage('Select a plant first!', 'warning');
        return;
      }

      if (gameState.energy < 10) {
        showMessage('Not enough energy!', 'warning');
        return;
      }

      selectedPlant.waterLevel = Math.min(100, selectedPlant.waterLevel + 20);
      selectedPlant.sunLevel = Math.min(100, selectedPlant.sunLevel + 20);
      selectedPlant.health = Math.min(100, selectedPlant.health + 30);

      selectedPlant.element.classList.add('fertilized');
      setTimeout(() => selectedPlant.element.classList.remove('fertilized'), 1000);

      gameState.energy -= 10;
      gameState.score += 5;

      updateUI();
      showMessage('Fertilizer applied! 🧪', 'success');

      // Force growth check
      checkPlantGrowth(selectedPlant);
    }

    function checkPlantGrowth(plant) {
      if (plant.stage >= 3) return; // Already fully grown

      const canGrow = plant.waterLevel > 30 && plant.sunLevel > 30 && plant.health > 50;

      if (canGrow) {
        plant.stage++;
        plant.element.textContent = plantStages[plant.stage].emoji;
        plant.element.classList.add('growing');
        setTimeout(() => plant.element.classList.remove('growing'), 1000);

        // Reset levels after growth
        plant.waterLevel = Math.max(20, plant.waterLevel - 20);
        plant.sunLevel = Math.max(20, plant.sunLevel - 20);

        gameState.score += plant.stage * 10;

        if (plant.stage === 3) {
          // Fully grown tree
          gameState.treesPlanted++;
          gameState.co2Saved += 22; // Average CO2 absorbed by a tree per year

          showMessage('Tree fully grown! 🌳 +22kg CO₂ saved!', 'success');
          checkAchievements();

          // Confetti for tree completion
          addConfetti();
        } else {
          showMessage(`Plant grew to ${plantStages[plant.stage].name}!`, 'success');
        }

        updateUI();
        checkLevelUp();
      }
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.treesPlanted / 3) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.energy = 100; // Restore energy on level up
        showMessage(`Level Up! Now Level ${gameState.level}`, 'success');
        updateUI();
      }
    }

    function checkAchievements() {
      // First Tree
      if (gameState.treesPlanted >= 1 && !gameState.achievements['first-tree']) {
        unlockAchievement('first-tree', 'First Tree! 🌱');
      }

      // Forest Maker
      if (gameState.treesPlanted >= 5 && !gameState.achievements['forest-maker']) {
        unlockAchievement('forest-maker', 'Forest Maker! 🌲');
      }

      // Eco Warrior
      if (gameState.co2Saved >= 100 && !gameState.achievements['eco-warrior']) {
        unlockAchievement('eco-warrior', 'Eco Warrior! 🌍');
      }
    }

    function unlockAchievement(achievementId, message) {
      gameState.achievements[achievementId] = true;
      const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
      if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
      }

      showMessage(`Achievement Unlocked: ${message}`, 'success');
      gameState.score += 50; // Bonus points for achievements
      updateUI();
    }

    function createWaterEffect(plantElement) {
      for (let i = 0; i < 5; i++) {
        const drop = document.createElement('div');
        drop.textContent = '💧';
        drop.className = 'rain-drop';
        drop.style.left = (parseInt(plantElement.style.left) + Math.random() * 30) + 'px';
        drop.style.animationDelay = (i * 0.1) + 's';

        elements.weatherEffects.appendChild(drop);

        setTimeout(() => drop.remove(), 2000);
      }
    }

    function createSunEffect(plantElement) {
      const sunRay = document.createElement('div');
      sunRay.textContent = '✨';
      sunRay.style.cssText = `
      position: absolute;
      left: ${parseInt(plantElement.style.left) + 15}px;
      bottom: 50px;
      font-size: 1.5rem;
      animation: sunRayEffect 1s ease-out;
      pointer-events: none;
    `;

      elements.plantsContainer.appendChild(sunRay);

      setTimeout(() => sunRay.remove(), 1000);
    }

    function toggleAutoWater() {
      gameState.autoWaterEnabled = !gameState.autoWaterEnabled;

      if (gameState.autoWaterEnabled) {
        elements.autoWaterBtn.textContent = '🤖 Auto Water ON';
        elements.autoWaterBtn.style.background = '#4CAF50';

        autoWaterInterval = setInterval(() => {
          gameState.plants.forEach(plant => {
            if (plant.waterLevel < 40 && gameState.energy >= 5) {
              plant.waterLevel = Math.min(100, plant.waterLevel + 20);
              gameState.energy -= 5;
              createWaterEffect(plant.element);
              checkPlantGrowth(plant);
            }
          });
          updateUI();
        }, 3000);

        showMessage('Auto-watering enabled!', 'info');
      } else {
        elements.autoWaterBtn.textContent = '🤖 Auto Water';
        elements.autoWaterBtn.style.background = '';

        if (autoWaterInterval) {
          clearInterval(autoWaterInterval);
          autoWaterInterval = null;
        }

        showMessage('Auto-watering disabled!', 'info');
      }
    }

    function startGame() {
      gameState.isPlaying = true;
      elements.startBtn.disabled = true;

      // Start weather effects
      weatherInterval = setInterval(() => {
        // Random weather events
        if (Math.random() < 0.3) {
          createRandomWeather();
        }

        // Gradually decrease plant levels
        gameState.plants.forEach(plant => {
          plant.waterLevel = Math.max(0, plant.waterLevel - 2);
          plant.sunLevel = Math.max(0, plant.sunLevel - 1);

          if (plant.waterLevel < 20 || plant.sunLevel < 20) {
            plant.health = Math.max(0, plant.health - 1);
          }
        });

        // Restore energy slowly
        gameState.energy = Math.min(100, gameState.energy + 1);
        updateUI();
      }, 2000);

      showMessage('Game started! Plant seeds and grow your forest!', 'success');
    }

    function createRandomWeather() {
      const weatherTypes = ['rain', 'sun'];
      const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

      if (weather === 'rain') {
        // Create rain effect
        for (let i = 0; i < 10; i++) {
          const drop = document.createElement('div');
          drop.textContent = '💧';
          drop.className = 'rain-drop';
          drop.style.left = Math.random() * 100 + '%';
          drop.style.animationDelay = (i * 0.1) + 's';

          elements.weatherEffects.appendChild(drop);
          setTimeout(() => drop.remove(), 2000);
        }

        // Benefit all plants
        gameState.plants.forEach(plant => {
          plant.waterLevel = Math.min(100, plant.waterLevel + 10);
        });

        showMessage('Rain! All plants got water! 🌧️', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (autoWaterInterval) clearInterval(autoWaterInterval);
      if (weatherInterval) clearInterval(weatherInterval);

      // Clear plants
      gameState.plants.forEach(plant => plant.element.remove());

      // Reset state
      gameState.score = 0;
      gameState.treesPlanted = 0;
      gameState.level = 1;
      gameState.co2Saved = 0;
      gameState.energy = 100;
      gameState.isPlaying = false;
      gameState.autoWaterEnabled = false;
      gameState.plants = [];

      // Reset achievements
      Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
        const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
        if (achievementEl) {
          achievementEl.classList.remove('unlocked');
          achievementEl.classList.add('locked');
        }
      });

      selectedPlant = null;
      elements.startBtn.disabled = false;
      elements.autoWaterBtn.textContent = '🤖 Auto Water';
      elements.autoWaterBtn.style.background = '';

      updateUI();
      showMessage('Garden reset!', 'info');
    }

    // Event listeners
    elements.plantSeedBtn.addEventListener('click', plantSeed);
    elements.waterBtn.addEventListener('click', waterPlant);
    elements.sunBtn.addEventListener('click', giveSunlight);
    elements.fertilizerBtn.addEventListener('click', useFertilizer);
    elements.startBtn.addEventListener('click', startGame);
    elements.autoWaterBtn.addEventListener('click', toggleAutoWater);
    elements.resetBtn.addEventListener('click', resetGame);

    // Garden click to plant seeds
    elements.plantsContainer.addEventListener('click', (e) => {
      if (e.target === elements.plantsContainer && gameState.energy >= 15) {
        const rect = elements.plantsContainer.getBoundingClientRect();
        const x = e.clientX - rect.left - 25; // Center the plant
        const y = 0;

        if (x >= 0 && x <= rect.width - 50) {
          createPlant(x, y);
          gameState.energy -= 15;
          gameState.score += 5;
          updateUI();
          showMessage('Seed planted! 🌰', 'success');
        }
      }
    });

    // Add CSS for sun ray effect
    const style = document.createElement('style');
    style.textContent = `
    @keyframes sunRayEffect {
      0% { opacity: 0; transform: translateY(20px) scale(0.5); }
      50% { opacity: 1; transform: translateY(-10px) scale(1.2); }
      100% { opacity: 0; transform: translateY(-30px) scale(0.8); }
    }
    
    .plant.selected {
      border: 3px solid #FFD700;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
    }
  `;
    document.head.appendChild(style);

    // Initialize UI
    updateUI();
    showMessage('Plant the Tree game loaded! Click Start Growing to begin!', 'info');
  }

  // Save the Ocean Game Implementation
  function initSaveOceanGame() {
    const gameState = {
      score: 0,
      trashCollected: 0,
      level: 1,
      lives: 3,
      timeLeft: 60,
      isPlaying: false,
      isPaused: false,
      boatX: 0,
      gameSpeed: 1,
      spawnRate: 2000,
      gameInterval: null,
      spawnInterval: null,
      timerInterval: null,
      fallingItems: [],
      achievements: {
        'first-cleanup': false,
        'ocean-guardian': false,
        'marine-protector': false
      }
    };

    const trashTypes = [
      { emoji: '🧴', name: 'Plastic Bottle', points: 10, type: 'trash' },
      { emoji: '🥤', name: 'Soda Cup', points: 8, type: 'trash' },
      { emoji: '🛍️', name: 'Plastic Bag', points: 12, type: 'trash' },
      { emoji: '🍟', name: 'Food Container', points: 6, type: 'trash' },
      { emoji: '🥫', name: 'Metal Can', points: 15, type: 'trash' },
      { emoji: '📦', name: 'Cardboard', points: 5, type: 'trash' }
    ];

    const seaLife = [
      { emoji: '🐠', name: 'Fish', penalty: -10, type: 'animal' },
      { emoji: '🐟', name: 'Fish', penalty: -10, type: 'animal' },
      { emoji: '🦈', name: 'Shark', penalty: -20, type: 'animal' },
      { emoji: '🐙', name: 'Octopus', penalty: -15, type: 'animal' },
      { emoji: '🐢', name: 'Turtle', penalty: -25, type: 'animal' },
      { emoji: '🦀', name: 'Crab', penalty: -8, type: 'animal' }
    ];

    const powerUps = [
      { emoji: '⚡', name: 'Speed Boost', effect: 'speed', type: 'powerup' },
      { emoji: '🛡️', name: 'Shield', effect: 'shield', type: 'powerup' },
      { emoji: '💰', name: 'Double Points', effect: 'double', type: 'powerup' },
      { emoji: '❤️', name: 'Extra Life', effect: 'life', type: 'powerup' }
    ];

    const elements = {
      scoreEl: document.getElementById('ocean-score'),
      trashEl: document.getElementById('trash-collected'),
      levelEl: document.getElementById('ocean-level'),
      livesEl: document.getElementById('ocean-lives'),
      timerEl: document.getElementById('ocean-timer'),
      boat: document.getElementById('boat'),
      gameArea: document.getElementById('ocean-game-area'),
      trashContainer: document.getElementById('trash-items'),
      seaLifeContainer: document.getElementById('sea-life'),
      powerUpContainer: document.getElementById('power-ups'),
      startBtn: document.getElementById('start-ocean-game'),
      pauseBtn: document.getElementById('pause-ocean-game'),
      resetBtn: document.getElementById('reset-ocean-game'),
      moveLeftBtn: document.getElementById('move-left'),
      moveRightBtn: document.getElementById('move-right'),
      achievementsContainer: document.getElementById('ocean-achievements')
    };

    let activeEffects = {
      shield: false,
      doublePoints: false,
      speedBoost: false
    };

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.trashEl.textContent = gameState.trashCollected;
      elements.levelEl.textContent = gameState.level;
      elements.timerEl.textContent = gameState.timeLeft;

      // Update lives display
      const heartsArray = Array(gameState.lives).fill('❤️');
      const emptyHearts = Array(Math.max(0, 3 - gameState.lives)).fill('🖤');
      elements.livesEl.textContent = heartsArray.concat(emptyHearts).join('');
    }

    function initializeBoat() {
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      gameState.boatX = gameAreaRect.width / 2 - 25; // Center boat
      elements.boat.style.left = gameState.boatX + 'px';
    }

    function moveBoat(direction) {
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const boatWidth = 50;
      const moveSpeed = activeEffects.speedBoost ? 40 : 25;

      if (direction === 'left') {
        gameState.boatX = Math.max(0, gameState.boatX - moveSpeed);
        elements.boat.classList.add('moving-left');
        setTimeout(() => elements.boat.classList.remove('moving-left'), 300);
      } else if (direction === 'right') {
        gameState.boatX = Math.min(gameAreaRect.width - boatWidth, gameState.boatX + moveSpeed);
        elements.boat.classList.add('moving-right');
        setTimeout(() => elements.boat.classList.remove('moving-right'), 300);
      }

      elements.boat.style.left = gameState.boatX + 'px';
    }

    function createFallingItem(itemData) {
      const item = document.createElement('div');
      item.className = itemData.type === 'trash' ? 'trash-item' :
        itemData.type === 'animal' ? 'sea-animal' : 'power-up';
      item.textContent = itemData.emoji;
      item.dataset.type = itemData.type;
      item.dataset.points = itemData.points || itemData.penalty || 0;
      item.dataset.effect = itemData.effect || '';

      // Random horizontal position
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const x = Math.random() * (gameAreaRect.width - 50);
      item.style.left = x + 'px';
      item.style.top = '0px';

      // Add to appropriate container
      if (itemData.type === 'trash') {
        elements.trashContainer.appendChild(item);
      } else if (itemData.type === 'animal') {
        elements.seaLifeContainer.appendChild(item);
      } else {
        elements.powerUpContainer.appendChild(item);
      }

      gameState.fallingItems.push({
        element: item,
        x: x,
        y: 0,
        speed: (2 + gameState.level * 0.5) * gameState.gameSpeed,
        data: itemData
      });

      return item;
    }

    function spawnRandomItem() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      const rand = Math.random();
      let itemData;

      if (rand < 0.6) {
        // 60% chance for trash
        itemData = trashTypes[Math.floor(Math.random() * trashTypes.length)];
      } else if (rand < 0.85) {
        // 25% chance for sea life
        itemData = seaLife[Math.floor(Math.random() * seaLife.length)];
      } else {
        // 15% chance for power-ups
        itemData = powerUps[Math.floor(Math.random() * powerUps.length)];
      }

      createFallingItem(itemData);
    }

    function updateFallingItems() {
      gameState.fallingItems.forEach((item, index) => {
        item.y += item.speed;
        item.element.style.top = item.y + 'px';

        // Check collision with boat
        const boatRect = elements.boat.getBoundingClientRect();
        const itemRect = item.element.getBoundingClientRect();

        if (checkCollision(boatRect, itemRect)) {
          handleItemCollection(item, index);
          return;
        }

        // Remove items that fall off screen
        if (item.y > elements.gameArea.offsetHeight) {
          if (item.data.type === 'trash') {
            // Penalty for missing trash
            gameState.lives--;
            elements.livesEl.classList.add('life-lost');
            setTimeout(() => elements.livesEl.classList.remove('life-lost'), 500);

            if (gameState.lives <= 0) {
              endGame();
              return;
            }
          }

          removeItem(item, index);
        }
      });
    }

    function checkCollision(rect1, rect2) {
      return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
    }

    function handleItemCollection(item, index) {
      const itemData = item.data;

      if (itemData.type === 'trash') {
        // Collect trash
        const points = activeEffects.doublePoints ? itemData.points * 2 : itemData.points;
        gameState.score += points;
        gameState.trashCollected++;

        createScorePopup(item.element, `+${points}`, '#FFD700');
        createSplashEffect(item.element);

        checkLevelUp();
        checkAchievements();

      } else if (itemData.type === 'animal') {
        // Penalty for hitting sea life
        if (!activeEffects.shield) {
          gameState.score = Math.max(0, gameState.score + itemData.penalty);
          gameState.lives--;

          createScorePopup(item.element, `${itemData.penalty}`, '#ff4444');
          elements.livesEl.classList.add('life-lost');
          setTimeout(() => elements.livesEl.classList.remove('life-lost'), 500);

          if (gameState.lives <= 0) {
            endGame();
            return;
          }
        } else {
          createScorePopup(item.element, 'PROTECTED!', '#00BFFF');
        }

      } else if (itemData.type === 'powerup') {
        // Apply power-up effect
        applyPowerUp(itemData.effect);
        createScorePopup(item.element, itemData.name, '#FFD700');
      }

      // Add collection effect
      item.element.classList.add('collected-effect');

      setTimeout(() => {
        removeItem(item, index);
      }, 500);

      updateUI();
    }

    function applyPowerUp(effect) {
      switch (effect) {
        case 'speed':
          activeEffects.speedBoost = true;
          setTimeout(() => { activeEffects.speedBoost = false; }, 5000);
          showMessage('Speed Boost activated! ⚡', 'info');
          break;

        case 'shield':
          activeEffects.shield = true;
          setTimeout(() => { activeEffects.shield = false; }, 8000);
          showMessage('Shield activated! 🛡️', 'info');
          break;

        case 'double':
          activeEffects.doublePoints = true;
          setTimeout(() => { activeEffects.doublePoints = false; }, 10000);
          showMessage('Double Points activated! 💰', 'info');
          break;

        case 'life':
          gameState.lives = Math.min(3, gameState.lives + 1);
          showMessage('Extra Life! ❤️', 'success');
          break;
      }
    }

    function createScorePopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'score-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.style.left;
      popup.style.top = element.style.top;

      elements.gameArea.appendChild(popup);

      setTimeout(() => popup.remove(), 1000);
    }

    function createSplashEffect(element) {
      const splash = document.createElement('div');
      splash.className = 'splash-effect';
      splash.textContent = '💦';
      splash.style.left = element.style.left;
      splash.style.top = element.style.top;

      elements.gameArea.appendChild(splash);

      setTimeout(() => splash.remove(), 800);
    }

    function removeItem(item, index) {
      if (item.element && item.element.parentNode) {
        item.element.remove();
      }
      gameState.fallingItems.splice(index, 1);
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.trashCollected / 20) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.gameSpeed += 0.2;
        gameState.spawnRate = Math.max(1000, gameState.spawnRate - 200);

        // Restart spawn interval with new rate
        if (gameState.spawnInterval) {
          clearInterval(gameState.spawnInterval);
          gameState.spawnInterval = setInterval(spawnRandomItem, gameState.spawnRate);
        }

        showMessage(`Level Up! Now Level ${gameState.level}`, 'success');
        addConfetti();
      }
    }

    function checkAchievements() {
      // First Cleanup
      if (gameState.trashCollected >= 10 && !gameState.achievements['first-cleanup']) {
        unlockAchievement('first-cleanup', 'First Cleanup! 🧹');
      }

      // Ocean Guardian
      if (gameState.trashCollected >= 50 && !gameState.achievements['ocean-guardian']) {
        unlockAchievement('ocean-guardian', 'Ocean Guardian! 🌊');
      }

      // Marine Protector
      if (gameState.score >= 500 && !gameState.achievements['marine-protector']) {
        unlockAchievement('marine-protector', 'Marine Protector! 🐋');
      }
    }

    function unlockAchievement(achievementId, message) {
      gameState.achievements[achievementId] = true;
      const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
      if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
      }

      showMessage(`Achievement Unlocked: ${message}`, 'success');
      gameState.score += 100; // Bonus points for achievements
      updateUI();
    }

    function startGame() {
      gameState.isPlaying = true;
      gameState.isPaused = false;
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;

      initializeBoat();

      // Start game timer
      gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
          gameState.timeLeft--;
          updateUI();

          if (gameState.timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);

      // Start spawning items
      gameState.spawnInterval = setInterval(spawnRandomItem, gameState.spawnRate);

      // Start game loop
      gameState.gameInterval = setInterval(() => {
        if (!gameState.isPaused) {
          updateFallingItems();
        }
      }, 50);

      showMessage('Ocean cleanup started! Collect trash and avoid sea life!', 'info');
    }

    function pauseGame() {
      gameState.isPaused = !gameState.isPaused;
      elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';

      if (gameState.isPaused) {
        showMessage('Game Paused', 'warning');
      } else {
        showMessage('Game Resumed', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);

      // Clear falling items
      gameState.fallingItems.forEach(item => {
        if (item.element && item.element.parentNode) {
          item.element.remove();
        }
      });
      gameState.fallingItems = [];

      // Reset game state
      gameState.score = 0;
      gameState.trashCollected = 0;
      gameState.level = 1;
      gameState.lives = 3;
      gameState.timeLeft = 60;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.gameSpeed = 1;
      gameState.spawnRate = 2000;

      // Reset achievements
      Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
        const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
        if (achievementEl) {
          achievementEl.classList.remove('unlocked');
          achievementEl.classList.add('locked');
        }
      });

      // Reset active effects
      activeEffects = { shield: false, doublePoints: false, speedBoost: false };

      // Reset UI
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.pauseBtn.textContent = '⏸️ Pause';

      initializeBoat();
      updateUI();
      showMessage('Ocean game reset!', 'info');
    }

    function endGame() {
      gameState.isPlaying = false;

      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);

      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;

      // Calculate final score and award points
      const finalScore = gameState.score;
      const pointsEarned = Math.floor(finalScore / 10);

      if (pointsEarned > 0) {
        completeTask(`Ocean Cleanup (Score: ${finalScore})`, pointsEarned);
      }

      showMessage(`Game Over! Final Score: ${finalScore} | Trash Collected: ${gameState.trashCollected} | Points Earned: ${pointsEarned}`, 'success');

      // Show confetti for good scores
      if (finalScore >= 200) {
        addConfetti();
      }
    }

    // Event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.resetBtn.addEventListener('click', resetGame);

    // Mobile controls
    elements.moveLeftBtn.addEventListener('click', () => moveBoat('left'));
    elements.moveRightBtn.addEventListener('click', () => moveBoat('right'));

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveBoat('left');
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveBoat('right');
        e.preventDefault();
      }
    });

    // Initialize UI
    initializeBoat();
    updateUI();
    showMessage('Save the Ocean game loaded! Click Start Cleaning to begin!', 'info');
  }

  // Clean the City Game Implementation
  function initCleanCityGame() {
    const gameState = {
      score: 0,
      trashCleaned: 0,
      level: 1,
      timeLeft: 60,
      combo: 0,
      maxCombo: 0,
      isPlaying: false,
      isPaused: false,
      playerX: 0,
      playerY: 0,
      gameInterval: null,
      spawnInterval: null,
      timerInterval: null,
      comboTimer: null,
      trashItems: [],
      obstacles: [],
      npcs: [],
      achievements: {
        'street-sweeper': false,
        'city-hero': false,
        'clean-machine': false
      }
    };

    const trashTypes = [
      { emoji: '🍌', name: 'Banana Peel', points: 5, type: 'organic' },
      { emoji: '🧴', name: 'Plastic Bottle', points: 8, type: 'plastic' },
      { emoji: '🍟', name: 'Food Container', points: 6, type: 'food' },
      { emoji: '🛍️', name: 'Plastic Bag', points: 10, type: 'plastic' },
      { emoji: '🥤', name: 'Soda Cup', points: 7, type: 'plastic' },
      { emoji: '🍕', name: 'Pizza Box', points: 4, type: 'cardboard' },
      { emoji: '🚬', name: 'Cigarette', points: 12, type: 'toxic' },
      { emoji: '📰', name: 'Newspaper', points: 3, type: 'paper' }
    ];

    const obstacleTypes = [
      { emoji: '🚗', name: 'Car', type: 'vehicle' },
      { emoji: '🚙', name: 'SUV', type: 'vehicle' },
      { emoji: '🌳', name: 'Tree', type: 'nature' },
      { emoji: '🚧', name: 'Construction', type: 'barrier' }
    ];

    const npcTypes = [
      { emoji: '🚶‍♂️', name: 'Man Walking', type: 'pedestrian' },
      { emoji: '🚶‍♀️', name: 'Woman Walking', type: 'pedestrian' },
      { emoji: '🏃‍♂️', name: 'Man Running', type: 'runner' },
      { emoji: '👮‍♂️', name: 'Police Officer', type: 'authority' }
    ];

    const elements = {
      scoreEl: document.getElementById('city-score'),
      trashEl: document.getElementById('trash-cleaned'),
      levelEl: document.getElementById('city-level'),
      timerEl: document.getElementById('city-timer'),
      comboEl: document.getElementById('city-combo'),
      player: document.getElementById('city-player'),
      gameArea: document.getElementById('city-game-area'),
      trashContainer: document.getElementById('city-trash-items'),
      obstacleContainer: document.getElementById('city-obstacles'),
      npcContainer: document.getElementById('city-npcs'),
      startBtn: document.getElementById('start-city-game'),
      pauseBtn: document.getElementById('pause-city-game'),
      resetBtn: document.getElementById('reset-city-game'),
      moveUpBtn: document.getElementById('city-move-up'),
      moveDownBtn: document.getElementById('city-move-down'),
      moveLeftBtn: document.getElementById('city-move-left'),
      moveRightBtn: document.getElementById('city-move-right'),
      achievementsContainer: document.getElementById('city-achievements')
    };

    let keys = {};
    let lastComboTime = 0;

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.trashEl.textContent = gameState.trashCleaned;
      elements.levelEl.textContent = gameState.level;
      elements.timerEl.textContent = gameState.timeLeft;
      elements.comboEl.textContent = gameState.combo;

      // Add combo glow effect
      if (gameState.combo > 0) {
        elements.comboEl.parentElement.classList.add('combo-active');
      } else {
        elements.comboEl.parentElement.classList.remove('combo-active');
      }
    }

    function initializePlayer() {
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      gameState.playerX = gameAreaRect.width / 2 - 25;
      gameState.playerY = gameAreaRect.height - 60;
      elements.player.style.left = gameState.playerX + 'px';
      elements.player.style.top = gameState.playerY + 'px';
    }

    function movePlayer(direction) {
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const playerSize = 50;
      const moveSpeed = 20;

      let newX = gameState.playerX;
      let newY = gameState.playerY;

      switch (direction) {
        case 'up':
          newY = Math.max(0, gameState.playerY - moveSpeed);
          elements.player.classList.add('moving-up');
          setTimeout(() => elements.player.classList.remove('moving-up'), 300);
          break;
        case 'down':
          newY = Math.min(gameAreaRect.height - playerSize, gameState.playerY + moveSpeed);
          elements.player.classList.add('moving-down');
          setTimeout(() => elements.player.classList.remove('moving-down'), 300);
          break;
        case 'left':
          newX = Math.max(0, gameState.playerX - moveSpeed);
          elements.player.classList.add('moving-left');
          setTimeout(() => elements.player.classList.remove('moving-left'), 300);
          break;
        case 'right':
          newX = Math.min(gameAreaRect.width - playerSize, gameState.playerX + moveSpeed);
          elements.player.classList.add('moving-right');
          setTimeout(() => elements.player.classList.remove('moving-right'), 300);
          break;
      }

      gameState.playerX = newX;
      gameState.playerY = newY;
      elements.player.style.left = gameState.playerX + 'px';
      elements.player.style.top = gameState.playerY + 'px';

      checkCollisions();
    }

    function createTrashItem() {
      const trashData = trashTypes[Math.floor(Math.random() * trashTypes.length)];
      const item = document.createElement('div');
      item.className = 'city-trash-item';
      item.textContent = trashData.emoji;
      item.dataset.points = trashData.points;
      item.dataset.type = trashData.type;
      item.dataset.name = trashData.name;

      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const x = Math.random() * (gameAreaRect.width - 50);
      const y = Math.random() * (gameAreaRect.height - 100) + 50; // Avoid bottom area

      item.style.left = x + 'px';
      item.style.top = y + 'px';

      elements.trashContainer.appendChild(item);

      gameState.trashItems.push({
        element: item,
        x: x,
        y: y,
        data: trashData
      });

      return item;
    }

    function createObstacle() {
      const obstacleData = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const item = document.createElement('div');
      item.className = 'city-obstacle';
      item.textContent = obstacleData.emoji;
      item.dataset.type = obstacleData.type;
      item.dataset.name = obstacleData.name;

      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const x = Math.random() * (gameAreaRect.width - 50);
      const y = Math.random() * (gameAreaRect.height - 150) + 100;

      item.style.left = x + 'px';
      item.style.top = y + 'px';

      elements.obstacleContainer.appendChild(item);

      gameState.obstacles.push({
        element: item,
        x: x,
        y: y,
        data: obstacleData
      });

      return item;
    }

    function createNPC() {
      const npcData = npcTypes[Math.floor(Math.random() * npcTypes.length)];
      const item = document.createElement('div');
      item.className = 'city-npc';
      item.textContent = npcData.emoji;
      item.dataset.type = npcData.type;
      item.dataset.name = npcData.name;

      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const x = Math.random() * (gameAreaRect.width - 50);
      const y = Math.random() * (gameAreaRect.height - 150) + 100;

      item.style.left = x + 'px';
      item.style.top = y + 'px';

      elements.npcContainer.appendChild(item);

      gameState.npcs.push({
        element: item,
        x: x,
        y: y,
        data: npcData
      });

      return item;
    }

    function checkCollisions() {
      const playerRect = elements.player.getBoundingClientRect();

      // Check trash collection
      gameState.trashItems.forEach((item, index) => {
        const itemRect = item.element.getBoundingClientRect();
        if (checkCollision(playerRect, itemRect)) {
          collectTrash(item, index);
        }
      });
    }

    function checkCollision(rect1, rect2) {
      return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
    }

    function collectTrash(item, index) {
      const points = parseInt(item.data.points);
      const comboMultiplier = Math.min(gameState.combo + 1, 5);
      const totalPoints = points * comboMultiplier;

      gameState.score += totalPoints;
      gameState.trashCleaned++;
      gameState.combo++;
      gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);

      // Reset combo timer
      if (gameState.comboTimer) {
        clearTimeout(gameState.comboTimer);
      }

      gameState.comboTimer = setTimeout(() => {
        gameState.combo = 0;
        updateUI();
      }, 3000);

      // Create visual effects
      createScorePopup(item.element, `+${totalPoints}`, '#FFD700');
      if (gameState.combo > 1) {
        createComboPopup(item.element, `${gameState.combo}x COMBO!`, '#FF6B6B');
      }

      // Add collection effect
      item.element.classList.add('city-collected-effect');

      setTimeout(() => {
        if (item.element && item.element.parentNode) {
          item.element.remove();
        }
        gameState.trashItems.splice(index, 1);
      }, 600);

      checkLevelUp();
      checkAchievements();
      updateUI();
    }

    function createScorePopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'city-score-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.style.left;
      popup.style.top = element.style.top;

      elements.gameArea.appendChild(popup);

      setTimeout(() => popup.remove(), 1000);
    }

    function createComboPopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'city-combo-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.style.left;
      popup.style.top = (parseInt(element.style.top) - 30) + 'px';

      elements.gameArea.appendChild(popup);

      setTimeout(() => popup.remove(), 1200);
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.trashCleaned / 15) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;

        // Show level up effect
        const levelUpEffect = document.createElement('div');
        levelUpEffect.className = 'level-up-effect';
        levelUpEffect.textContent = `LEVEL ${gameState.level}!`;
        elements.gameArea.appendChild(levelUpEffect);

        setTimeout(() => levelUpEffect.remove(), 2000);

        showMessage(`Level Up! Now Level ${gameState.level}`, 'success');
        addConfetti();
      }
    }

    function checkAchievements() {
      // Street Sweeper
      if (gameState.trashCleaned >= 20 && !gameState.achievements['street-sweeper']) {
        unlockAchievement('street-sweeper', 'Street Sweeper! 🧹');
      }

      // City Hero
      if (gameState.score >= 300 && !gameState.achievements['city-hero']) {
        unlockAchievement('city-hero', 'City Hero! 🦸');
      }

      // Clean Machine
      if (gameState.maxCombo >= 10 && !gameState.achievements['clean-machine']) {
        unlockAchievement('clean-machine', 'Clean Machine! ⚡');
      }
    }

    function unlockAchievement(achievementId, message) {
      gameState.achievements[achievementId] = true;
      const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
      if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
      }

      showMessage(`Achievement Unlocked: ${message}`, 'success');
      gameState.score += 50; // Bonus points for achievements
      updateUI();
    }

    function spawnItems() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      // Spawn trash (main objective)
      if (Math.random() < 0.8) {
        createTrashItem();
      }

      // Spawn obstacles occasionally
      if (Math.random() < 0.2 && gameState.obstacles.length < 3) {
        createObstacle();
      }

      // Spawn NPCs occasionally
      if (Math.random() < 0.3 && gameState.npcs.length < 2) {
        createNPC();
      }
    }

    function startGame() {
      gameState.isPlaying = true;
      gameState.isPaused = false;
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;

      initializePlayer();

      // Start game timer
      gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
          gameState.timeLeft--;
          updateUI();

          if (gameState.timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);

      // Start spawning items
      gameState.spawnInterval = setInterval(spawnItems, 2000);

      // Initial spawn
      for (let i = 0; i < 5; i++) {
        createTrashItem();
      }

      showMessage('City cleanup started! Collect trash to clean the city!', 'info');
    }

    function pauseGame() {
      gameState.isPaused = !gameState.isPaused;
      elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';

      if (gameState.isPaused) {
        showMessage('Game Paused', 'warning');
      } else {
        showMessage('Game Resumed', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.comboTimer) clearTimeout(gameState.comboTimer);

      // Clear items
      gameState.trashItems.forEach(item => {
        if (item.element && item.element.parentNode) {
          item.element.remove();
        }
      });
      gameState.obstacles.forEach(item => {
        if (item.element && item.element.parentNode) {
          item.element.remove();
        }
      });
      gameState.npcs.forEach(item => {
        if (item.element && item.element.parentNode) {
          item.element.remove();
        }
      });

      // Reset game state
      gameState.score = 0;
      gameState.trashCleaned = 0;
      gameState.level = 1;
      gameState.timeLeft = 60;
      gameState.combo = 0;
      gameState.maxCombo = 0;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.trashItems = [];
      gameState.obstacles = [];
      gameState.npcs = [];

      // Reset achievements
      Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
        const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
        if (achievementEl) {
          achievementEl.classList.remove('unlocked');
          achievementEl.classList.add('locked');
        }
      });

      // Reset UI
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.pauseBtn.textContent = '⏸️ Pause';

      initializePlayer();
      updateUI();
      showMessage('City game reset!', 'info');
    }

    function endGame() {
      gameState.isPlaying = false;

      // Clear intervals
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.comboTimer) clearTimeout(gameState.comboTimer);

      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;

      // Calculate final score and award points
      const finalScore = gameState.score;
      const pointsEarned = Math.floor(finalScore / 10);

      if (pointsEarned > 0) {
        completeTask(`City Cleanup (Score: ${finalScore})`, pointsEarned);
      }

      showMessage(`Game Over! Final Score: ${finalScore} | Trash Cleaned: ${gameState.trashCleaned} | Max Combo: ${gameState.maxCombo}x | Points Earned: ${pointsEarned}`, 'success');

      // Show confetti for good scores
      if (finalScore >= 200) {
        addConfetti();
      }
    }

    // Event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.resetBtn.addEventListener('click', resetGame);

    // Mobile controls
    elements.moveUpBtn.addEventListener('click', () => movePlayer('up'));
    elements.moveDownBtn.addEventListener('click', () => movePlayer('down'));
    elements.moveLeftBtn.addEventListener('click', () => movePlayer('left'));
    elements.moveRightBtn.addEventListener('click', () => movePlayer('right'));

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      keys[e.key] = true;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        movePlayer('up');
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        movePlayer('down');
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        movePlayer('left');
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        movePlayer('right');
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    // Initialize UI
    initializePlayer();
    updateUI();
    showMessage('Clean the City game loaded! Click Start Cleaning to begin!', 'info');
  }

  // Rainwater Collector Game Implementation
  function initRainwaterCollectorGame() {
    const gameState = {
      score: 0,
      waterCollected: 0,
      level: 1,
      timeLeft: 60,
      streak: 0,
      maxStreak: 0,
      isPlaying: false,
      isPaused: false,
      bucketX: 0,
      gameSpeed: 1,
      dropSpawnRate: 1500,
      gameInterval: null,
      spawnInterval: null,
      timerInterval: null,
      streakTimer: null,
      lightningTimer: null,
      fallingDrops: [],
      achievements: {
        'water-saver': false,
        'rain-master': false,
        'conservation-hero': false
      }
    };

    const dropTypes = [
      { emoji: '💧', name: 'Regular Drop', points: 5, water: 1, type: 'regular', probability: 0.7 },
      { emoji: '💎', name: 'Pure Drop', points: 15, water: 3, type: 'special', probability: 0.15 },
      { emoji: '🌟', name: 'Golden Drop', points: 25, water: 5, type: 'special', probability: 0.05 },
      { emoji: '☠️', name: 'Contaminated', points: -10, water: -2, type: 'contaminated', probability: 0.1 }
    ];

    const obstacleTypes = [
      { emoji: '🍃', name: 'Leaf', type: 'debris' },
      { emoji: '🪨', name: 'Stone', type: 'debris' },
      { emoji: '🗑️', name: 'Trash', type: 'pollution' }
    ];

    const elements = {
      scoreEl: document.getElementById('rainwater-score'),
      waterEl: document.getElementById('water-collected'),
      levelEl: document.getElementById('rainwater-level'),
      timerEl: document.getElementById('rainwater-timer'),
      streakEl: document.getElementById('rainwater-streak'),
      bucket: document.getElementById('rainwater-bucket'),
      gameArea: document.getElementById('rainwater-game-area'),
      raindropsContainer: document.getElementById('raindrops-container'),
      specialDrops: document.getElementById('special-drops'),
      obstaclesContainer: document.getElementById('rain-obstacles'),
      lightningEffects: document.getElementById('lightning-effects'),
      startBtn: document.getElementById('start-rainwater-game'),
      pauseBtn: document.getElementById('pause-rainwater-game'),
      resetBtn: document.getElementById('reset-rainwater-game'),
      moveLeftBtn: document.getElementById('rainwater-move-left'),
      moveRightBtn: document.getElementById('rainwater-move-right'),
      achievementsContainer: document.getElementById('rainwater-achievements')
    };

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.waterEl.textContent = gameState.waterCollected;
      elements.levelEl.textContent = gameState.level;
      elements.timerEl.textContent = gameState.timeLeft;
      elements.streakEl.textContent = gameState.streak;

      // Add streak glow effect
      if (gameState.streak > 0) {
        elements.streakEl.parentElement.classList.add('streak-active');
      } else {
        elements.streakEl.parentElement.classList.remove('streak-active');
      }
    }

    function initializeBucket() {
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      gameState.bucketX = gameAreaRect.width / 2 - 25;
      elements.bucket.style.left = gameState.bucketX + 'px';
    }

    function moveBucket(direction) {
      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const bucketWidth = 50;
      const moveSpeed = 25;

      if (direction === 'left') {
        gameState.bucketX = Math.max(0, gameState.bucketX - moveSpeed);
      } else if (direction === 'right') {
        gameState.bucketX = Math.min(gameAreaRect.width - bucketWidth, gameState.bucketX + moveSpeed);
      }

      elements.bucket.style.left = gameState.bucketX + 'px';
    }

    function createDrop() {
      // Determine drop type based on probability
      const rand = Math.random();
      let cumulativeProbability = 0;
      let selectedDrop = dropTypes[0];

      for (const dropType of dropTypes) {
        cumulativeProbability += dropType.probability;
        if (rand <= cumulativeProbability) {
          selectedDrop = dropType;
          break;
        }
      }

      const drop = document.createElement('div');
      drop.className = `raindrop ${selectedDrop.type}`;
      drop.textContent = selectedDrop.emoji;
      drop.dataset.points = selectedDrop.points;
      drop.dataset.water = selectedDrop.water;
      drop.dataset.type = selectedDrop.type;
      drop.dataset.name = selectedDrop.name;

      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const x = Math.random() * (gameAreaRect.width - 30);
      drop.style.left = x + 'px';
      drop.style.top = '0px';

      if (selectedDrop.type === 'special') {
        elements.specialDrops.appendChild(drop);
      } else {
        elements.raindropsContainer.appendChild(drop);
      }

      gameState.fallingDrops.push({
        element: drop,
        x: x,
        y: 0,
        speed: (2 + gameState.level * 0.3) * gameState.gameSpeed,
        data: selectedDrop
      });

      return drop;
    }

    function createObstacle() {
      const obstacleData = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const obstacle = document.createElement('div');
      obstacle.className = 'obstacle';
      obstacle.textContent = obstacleData.emoji;
      obstacle.dataset.type = obstacleData.type;
      obstacle.dataset.name = obstacleData.name;

      const gameAreaRect = elements.gameArea.getBoundingClientRect();
      const x = Math.random() * (gameAreaRect.width - 30);
      obstacle.style.left = x + 'px';
      obstacle.style.top = '0px';

      elements.obstaclesContainer.appendChild(obstacle);

      gameState.fallingDrops.push({
        element: obstacle,
        x: x,
        y: 0,
        speed: 1.5 * gameState.gameSpeed,
        data: { ...obstacleData, points: -5, water: 0, type: 'obstacle' }
      });

      return obstacle;
    }

    function updateFallingDrops() {
      gameState.fallingDrops.forEach((drop, index) => {
        drop.y += drop.speed;
        drop.element.style.top = drop.y + 'px';

        // Check collision with bucket
        const bucketRect = elements.bucket.getBoundingClientRect();
        const dropRect = drop.element.getBoundingClientRect();

        if (checkCollision(bucketRect, dropRect)) {
          handleDropCollection(drop, index);
          return;
        }

        // Remove drops that fall off screen
        if (drop.y > elements.gameArea.offsetHeight) {
          if (drop.data.type === 'regular' || drop.data.type === 'special') {
            // Reset streak for missed water drops
            gameState.streak = 0;
            updateUI();
          }
          removeDrop(drop, index);
        }
      });
    }

    function checkCollision(rect1, rect2) {
      return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
    }

    function handleDropCollection(drop, index) {
      const dropData = drop.data;

      if (dropData.type === 'obstacle') {
        // Hit obstacle - lose points and reset streak
        gameState.score = Math.max(0, gameState.score + dropData.points);
        gameState.streak = 0;

        createScorePopup(drop.element, `${dropData.points}`, '#ff4444');

      } else {
        // Collect water drop
        const streakMultiplier = Math.min(Math.floor(gameState.streak / 5) + 1, 3);
        const points = dropData.points * streakMultiplier;
        const water = Math.max(0, dropData.water);

        gameState.score += points;
        gameState.waterCollected += water;

        if (dropData.type !== 'contaminated') {
          gameState.streak++;
          gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);

          // Reset streak timer
          if (gameState.streakTimer) {
            clearTimeout(gameState.streakTimer);
          }

          gameState.streakTimer = setTimeout(() => {
            gameState.streak = 0;
            updateUI();
          }, 3000);
        } else {
          gameState.streak = 0;
        }

        // Visual effects
        createScorePopup(drop.element, `+${points}`, dropData.type === 'contaminated' ? '#ff4444' : '#FFD700');
        createWaterSplash(drop.element);

        if (gameState.streak > 1 && gameState.streak % 5 === 0) {
          createStreakPopup(drop.element, `${gameState.streak} STREAK!`, '#4FC3F7');
        }

        // Bucket bounce effect
        elements.bucket.classList.add('collecting');
        setTimeout(() => elements.bucket.classList.remove('collecting'), 300);
      }

      // Add collection effect
      drop.element.classList.add('collected-drop');

      setTimeout(() => {
        removeDrop(drop, index);
      }, 600);

      checkLevelUp();
      checkAchievements();
      updateUI();
    }

    function createScorePopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'rainwater-score-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.style.left;
      popup.style.top = element.style.top;

      elements.gameArea.appendChild(popup);

      setTimeout(() => popup.remove(), 1000);
    }

    function createWaterSplash(element) {
      const splash = document.createElement('div');
      splash.className = 'water-splash';
      splash.textContent = '💦';
      splash.style.left = element.style.left;
      splash.style.top = element.style.top;

      elements.gameArea.appendChild(splash);

      setTimeout(() => splash.remove(), 800);
    }

    function createStreakPopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'streak-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.style.left;
      popup.style.top = (parseInt(element.style.top) - 30) + 'px';

      elements.gameArea.appendChild(popup);

      setTimeout(() => popup.remove(), 1200);
    }

    function removeDrop(drop, index) {
      if (drop.element && drop.element.parentNode) {
        drop.element.remove();
      }
      gameState.fallingDrops.splice(index, 1);
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.waterCollected / 20) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.gameSpeed += 0.2;
        gameState.dropSpawnRate = Math.max(800, gameState.dropSpawnRate - 100);

        // Restart spawn interval with new rate
        if (gameState.spawnInterval) {
          clearInterval(gameState.spawnInterval);
          gameState.spawnInterval = setInterval(spawnItems, gameState.dropSpawnRate);
        }

        showMessage(`Level Up! Now Level ${gameState.level}`, 'success');
        createLightningEffect();
        addConfetti();
      }
    }

    function checkAchievements() {
      // Water Saver
      if (gameState.waterCollected >= 30 && !gameState.achievements['water-saver']) {
        unlockAchievement('water-saver', 'Water Saver! 💧');
      }

      // Rain Master
      if (gameState.maxStreak >= 15 && !gameState.achievements['rain-master']) {
        unlockAchievement('rain-master', 'Rain Master! 🌧️');
      }

      // Conservation Hero
      if (gameState.score >= 500 && !gameState.achievements['conservation-hero']) {
        unlockAchievement('conservation-hero', 'Conservation Hero! 🏆');
      }
    }

    function unlockAchievement(achievementId, message) {
      gameState.achievements[achievementId] = true;
      const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
      if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
      }

      showMessage(`Achievement Unlocked: ${message}`, 'success');
      gameState.score += 100; // Bonus points for achievements
      updateUI();
    }

    function spawnItems() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      // Spawn raindrops (main objective)
      if (Math.random() < 0.8) {
        createDrop();
      }

      // Spawn obstacles occasionally
      if (Math.random() < 0.15) {
        createObstacle();
      }
    }

    function createLightningEffect() {
      const lightning = document.createElement('div');
      lightning.className = 'lightning-flash';
      elements.lightningEffects.appendChild(lightning);

      setTimeout(() => lightning.remove(), 300);
    }

    function startGame() {
      gameState.isPlaying = true;
      gameState.isPaused = false;
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;

      initializeBucket();

      // Start game timer
      gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
          gameState.timeLeft--;
          updateUI();

          if (gameState.timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);

      // Start spawning drops
      gameState.spawnInterval = setInterval(spawnItems, gameState.dropSpawnRate);

      // Start game loop
      gameState.gameInterval = setInterval(() => {
        if (!gameState.isPaused) {
          updateFallingDrops();
        }
      }, 50);

      // Random lightning effects
      gameState.lightningTimer = setInterval(() => {
        if (!gameState.isPaused && Math.random() < 0.3) {
          createLightningEffect();
        }
      }, 5000);

      showMessage('Rainwater collection started! Catch the drops!', 'info');
    }

    function pauseGame() {
      gameState.isPaused = !gameState.isPaused;
      elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';

      if (gameState.isPaused) {
        showMessage('Game Paused', 'warning');
      } else {
        showMessage('Game Resumed', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.streakTimer) clearTimeout(gameState.streakTimer);
      if (gameState.lightningTimer) clearInterval(gameState.lightningTimer);

      // Clear falling drops
      gameState.fallingDrops.forEach(drop => {
        if (drop.element && drop.element.parentNode) {
          drop.element.remove();
        }
      });
      gameState.fallingDrops = [];

      // Reset game state
      gameState.score = 0;
      gameState.waterCollected = 0;
      gameState.level = 1;
      gameState.timeLeft = 60;
      gameState.streak = 0;
      gameState.maxStreak = 0;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.gameSpeed = 1;
      gameState.dropSpawnRate = 1500;

      // Reset achievements
      Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
        const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
        if (achievementEl) {
          achievementEl.classList.remove('unlocked');
          achievementEl.classList.add('locked');
        }
      });

      // Reset UI
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.pauseBtn.textContent = '⏸️ Pause';

      initializeBucket();
      updateUI();
      showMessage('Rainwater game reset!', 'info');
    }

    function endGame() {
      gameState.isPlaying = false;

      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.streakTimer) clearTimeout(gameState.streakTimer);
      if (gameState.lightningTimer) clearInterval(gameState.lightningTimer);

      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;

      // Calculate final score and award points
      const finalScore = gameState.score;
      const pointsEarned = Math.floor(finalScore / 10);

      if (pointsEarned > 0) {
        completeTask(`Rainwater Collection (Score: ${finalScore})`, pointsEarned);
      }

      showMessage(`Game Over! Final Score: ${finalScore} | Water Collected: ${gameState.waterCollected}L | Max Streak: ${gameState.maxStreak} | Points Earned: ${pointsEarned}`, 'success');

      // Show confetti for good scores
      if (finalScore >= 300) {
        addConfetti();
      }
    }

    // Event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.resetBtn.addEventListener('click', resetGame);

    // Mobile controls
    elements.moveLeftBtn.addEventListener('click', () => moveBucket('left'));
    elements.moveRightBtn.addEventListener('click', () => moveBucket('right'));

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveBucket('left');
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveBucket('right');
        e.preventDefault();
      }
    });

    // Initialize UI
    initializeBucket();
    updateUI();
    showMessage('Rainwater Collector game loaded! Click Start Collecting to begin!', 'info');
  }

  // Solar Panel Builder Game Implementation
  function initSolarPanelBuilderGame() {
    const gameState = {
      score: 0,
      energyGenerated: 0,
      panelsPlaced: 0,
      level: 1,
      timeLeft: 60,
      sunIntensity: 100,
      isPlaying: false,
      isPaused: false,
      gameInterval: null,
      timerInterval: null,
      sunInterval: null,
      energyInterval: null,
      placedPanels: [],
      roofCapacities: {
        house: { max: 2, current: 0 },
        office: { max: 4, current: 0 },
        factory: { max: 6, current: 0 }
      },
      achievements: {
        'solar-starter': false,
        'energy-master': false,
        'green-builder': false
      }
    };

    const panelTypes = {
      basic: { emoji: '🔋', power: 5, points: 10, name: 'Basic Panel' },
      advanced: { emoji: '⚡', power: 10, points: 20, name: 'Advanced Panel' },
      premium: { emoji: '💎', power: 15, points: 30, name: 'Premium Panel' }
    };

    const elements = {
      scoreEl: document.getElementById('solar-score'),
      energyEl: document.getElementById('energy-generated'),
      panelsEl: document.getElementById('panels-placed'),
      levelEl: document.getElementById('solar-level'),
      timerEl: document.getElementById('solar-timer'),
      sunIntensityEl: document.getElementById('sun-intensity'),
      sunMeterFill: document.getElementById('sun-meter-fill'),
      sunPosition: document.getElementById('sun-position'),
      gameArea: document.getElementById('solar-game-area'),
      buildingsContainer: document.getElementById('buildings-container'),
      energyIndicators: document.getElementById('energy-indicators'),
      startBtn: document.getElementById('start-solar-game'),
      pauseBtn: document.getElementById('pause-solar-game'),
      resetBtn: document.getElementById('reset-solar-game'),
      achievementsContainer: document.getElementById('solar-achievements')
    };

    let draggedPanel = null;

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.energyEl.textContent = gameState.energyGenerated;
      elements.panelsEl.textContent = gameState.panelsPlaced;
      elements.levelEl.textContent = gameState.level;
      elements.timerEl.textContent = gameState.timeLeft;
      elements.sunIntensityEl.textContent = gameState.sunIntensity + '%';
      elements.sunMeterFill.style.width = gameState.sunIntensity + '%';

      // Update sun intensity visual effects
      const container = document.getElementById('solar-container');
      container.classList.remove('high-intensity', 'medium-intensity', 'low-intensity');

      if (gameState.sunIntensity >= 80) {
        container.classList.add('high-intensity');
      } else if (gameState.sunIntensity >= 50) {
        container.classList.add('medium-intensity');
      } else {
        container.classList.add('low-intensity');
      }
    }

    function initializeDragAndDrop() {
      const panelItems = document.querySelectorAll('.solar-panel-item');
      const roofAreas = document.querySelectorAll('.roof-area');

      panelItems.forEach(panel => {
        panel.addEventListener('dragstart', handleDragStart);
        panel.addEventListener('dragend', handleDragEnd);
      });

      roofAreas.forEach(roof => {
        roof.addEventListener('dragover', handleDragOver);
        roof.addEventListener('dragenter', handleDragEnter);
        roof.addEventListener('dragleave', handleDragLeave);
        roof.addEventListener('drop', handleDrop);
      });
    }

    function handleDragStart(e) {
      if (!gameState.isPlaying || gameState.isPaused) {
        e.preventDefault();
        return;
      }

      draggedPanel = {
        type: e.target.dataset.panel,
        element: e.target
      };

      e.target.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
      e.target.style.opacity = '1';
      draggedPanel = null;
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
      e.preventDefault();
      e.target.classList.add('drag-over');
    }

    function handleDragLeave(e) {
      e.target.classList.remove('drag-over');
    }

    function handleDrop(e) {
      e.preventDefault();
      e.target.classList.remove('drag-over');

      if (!draggedPanel || !gameState.isPlaying || gameState.isPaused) return;

      const roofType = e.target.dataset.roof;
      const capacity = gameState.roofCapacities[roofType];

      if (capacity.current >= capacity.max) {
        showMessage(`${roofType} roof is full! (${capacity.current}/${capacity.max})`, 'warning');
        return;
      }

      placePanelOnRoof(e.target, roofType, draggedPanel.type);
    }

    function placePanelOnRoof(roofElement, roofType, panelType) {
      const panelData = panelTypes[panelType];
      const capacity = gameState.roofCapacities[roofType];

      // Create placed panel element
      const placedPanel = document.createElement('div');
      placedPanel.className = 'placed-panel';
      placedPanel.textContent = panelData.emoji;
      placedPanel.dataset.panelType = panelType;
      placedPanel.dataset.roofType = roofType;

      // Position panel within roof area
      const panelSize = 20;
      const cols = Math.floor(roofElement.offsetWidth / (panelSize + 2));
      const currentIndex = capacity.current;
      const row = Math.floor(currentIndex / cols);
      const col = currentIndex % cols;

      placedPanel.style.left = (col * (panelSize + 2) + 2) + 'px';
      placedPanel.style.top = (row * (panelSize + 2) + 2) + 'px';
      placedPanel.style.width = panelSize + 'px';
      placedPanel.style.height = panelSize + 'px';

      roofElement.appendChild(placedPanel);

      // Update game state
      capacity.current++;
      gameState.panelsPlaced++;
      gameState.score += panelData.points;

      // Add to placed panels array
      gameState.placedPanels.push({
        element: placedPanel,
        type: panelType,
        roof: roofType,
        power: panelData.power
      });

      // Visual effects
      createScorePopup(placedPanel, `+${panelData.points}`, '#FFD700');
      createEnergyFlow(placedPanel);

      checkLevelUp();
      checkAchievements();
      updateUI();

      showMessage(`${panelData.name} placed on ${roofType}! (+${panelData.power}kW)`, 'success');
    }

    function createScorePopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'solar-score-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.offsetLeft + 'px';
      popup.style.top = element.offsetTop + 'px';

      element.parentElement.appendChild(popup);

      setTimeout(() => popup.remove(), 1000);
    }

    function createEnergyFlow(panelElement) {
      const flow = document.createElement('div');
      flow.className = 'energy-flow';
      flow.textContent = '⚡';
      flow.style.left = panelElement.offsetLeft + 'px';
      flow.style.top = panelElement.offsetTop + 'px';

      elements.energyIndicators.appendChild(flow);

      setTimeout(() => flow.remove(), 2000);
    }

    function updateSunIntensity() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      // Simulate sun intensity changes (clouds, time of day)
      const change = (Math.random() - 0.5) * 20;
      gameState.sunIntensity = Math.max(20, Math.min(100, gameState.sunIntensity + change));

      updateUI();
    }

    function generateEnergy() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      let totalEnergy = 0;
      const intensityMultiplier = gameState.sunIntensity / 100;

      gameState.placedPanels.forEach(panel => {
        const energy = panel.power * intensityMultiplier;
        totalEnergy += energy;

        // Create energy flow animation occasionally
        if (Math.random() < 0.3) {
          createEnergyFlow(panel.element);
        }
      });

      gameState.energyGenerated += totalEnergy;
      gameState.score += Math.floor(totalEnergy);

      updateUI();
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.panelsPlaced / 5) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;

        // Show level up effect
        const levelUpEffect = document.createElement('div');
        levelUpEffect.className = 'solar-level-up';
        levelUpEffect.textContent = `LEVEL ${gameState.level}!`;
        elements.gameArea.appendChild(levelUpEffect);

        setTimeout(() => levelUpEffect.remove(), 2000);

        showMessage(`Level Up! Now Level ${gameState.level}`, 'success');
        addConfetti();
      }
    }

    function checkAchievements() {
      // Solar Starter
      if (gameState.panelsPlaced >= 5 && !gameState.achievements['solar-starter']) {
        unlockAchievement('solar-starter', 'Solar Starter! 🔋');
      }

      // Energy Master
      if (gameState.energyGenerated >= 200 && !gameState.achievements['energy-master']) {
        unlockAchievement('energy-master', 'Energy Master! ⚡');
      }

      // Green Builder
      if (gameState.score >= 500 && !gameState.achievements['green-builder']) {
        unlockAchievement('green-builder', 'Green Builder! 🌱');
      }
    }

    function unlockAchievement(achievementId, message) {
      gameState.achievements[achievementId] = true;
      const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
      if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
      }

      showMessage(`Achievement Unlocked: ${message}`, 'success');
      gameState.score += 100; // Bonus points for achievements
      updateUI();
    }

    function startGame() {
      gameState.isPlaying = true;
      gameState.isPaused = false;
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;

      // Start game timer
      gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
          gameState.timeLeft--;
          updateUI();

          if (gameState.timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);

      // Start sun intensity changes
      gameState.sunInterval = setInterval(updateSunIntensity, 3000);

      // Start energy generation
      gameState.energyInterval = setInterval(generateEnergy, 1000);

      showMessage('Solar panel building started! Drag panels to roofs!', 'info');
    }

    function pauseGame() {
      gameState.isPaused = !gameState.isPaused;
      elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';

      if (gameState.isPaused) {
        showMessage('Game Paused', 'warning');
      } else {
        showMessage('Game Resumed', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.sunInterval) clearInterval(gameState.sunInterval);
      if (gameState.energyInterval) clearInterval(gameState.energyInterval);

      // Clear placed panels
      gameState.placedPanels.forEach(panel => {
        if (panel.element && panel.element.parentNode) {
          panel.element.remove();
        }
      });
      gameState.placedPanels = [];

      // Reset roof capacities
      Object.keys(gameState.roofCapacities).forEach(roof => {
        gameState.roofCapacities[roof].current = 0;
      });

      // Reset game state
      gameState.score = 0;
      gameState.energyGenerated = 0;
      gameState.panelsPlaced = 0;
      gameState.level = 1;
      gameState.timeLeft = 60;
      gameState.sunIntensity = 100;
      gameState.isPlaying = false;
      gameState.isPaused = false;

      // Reset achievements
      Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
        const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
        if (achievementEl) {
          achievementEl.classList.remove('unlocked');
          achievementEl.classList.add('locked');
        }
      });

      // Reset UI
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.pauseBtn.textContent = '⏸️ Pause';

      updateUI();
      showMessage('Solar panel game reset!', 'info');
    }

    function endGame() {
      gameState.isPlaying = false;

      // Clear intervals
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.sunInterval) clearInterval(gameState.sunInterval);
      if (gameState.energyInterval) clearInterval(gameState.energyInterval);

      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;

      // Calculate final score and award points
      const finalScore = gameState.score;
      const pointsEarned = Math.floor(finalScore / 10);

      if (pointsEarned > 0) {
        completeTask(`Solar Panel Building (Score: ${finalScore})`, pointsEarned);
      }

      showMessage(`Game Over! Final Score: ${finalScore} | Energy Generated: ${Math.floor(gameState.energyGenerated)}kW | Panels Placed: ${gameState.panelsPlaced} | Points Earned: ${pointsEarned}`, 'success');

      // Show confetti for good scores
      if (finalScore >= 400) {
        addConfetti();
      }
    }

    // Event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.resetBtn.addEventListener('click', resetGame);

    // Initialize drag and drop
    initializeDragAndDrop();

    // Initialize UI
    updateUI();
    showMessage('Solar Panel Builder game loaded! Click Start Building to begin!', 'info');
  }

  // Save the Forest Game Implementation
  function initSaveTheForestGame() {
    const gameState = {
      score: 0,
      treesSaved: 0,
      firesExtinguished: 0,
      level: 1,
      timeLeft: 60,
      fireDanger: 30,
      isPlaying: false,
      isPaused: false,
      gameInterval: null,
      timerInterval: null,
      fireSpreadInterval: null,
      helicopterInterval: null,
      forestGrid: [],
      activeFires: [],
      tools: {
        waterHose: { ready: true, cooldown: 0 },
        fireExtinguisher: { ready: true, cooldown: 0 },
        helicopter: { ready: false, cooldown: 10 }
      },
      achievements: {
        'fire-fighter': false,
        'forest-guardian': false,
        'eco-hero': false
      }
    };

    const GRID_SIZE = { rows: 4, cols: 8 };
    const TREE_STATES = {
      HEALTHY: 'healthy',
      BURNING: 'burning',
      BURNT: 'burnt',
      SAVED: 'saved'
    };

    const elements = {
      scoreEl: document.getElementById('forest-score'),
      treesSavedEl: document.getElementById('trees-saved'),
      firesExtinguishedEl: document.getElementById('fires-extinguished'),
      levelEl: document.getElementById('forest-level'),
      timerEl: document.getElementById('forest-timer'),
      fireDangerEl: document.getElementById('fire-danger'),
      dangerMeterFill: document.getElementById('danger-meter-fill'),
      forestGrid: document.getElementById('forest-grid'),
      waterDrops: document.getElementById('water-drops'),
      fireEffects: document.getElementById('fire-effects'),
      smokeEffects: document.getElementById('smoke-effects'),
      helicopter: document.getElementById('rescue-helicopter'),
      startBtn: document.getElementById('start-forest-game'),
      pauseBtn: document.getElementById('pause-forest-game'),
      resetBtn: document.getElementById('reset-forest-game'),
      waterHoseTool: document.getElementById('water-hose'),
      fireExtinguisherTool: document.getElementById('fire-extinguisher'),
      helicopterTool: document.getElementById('helicopter-water'),
      achievementsContainer: document.getElementById('forest-achievements')
    };

    function updateUI() {
      elements.scoreEl.textContent = gameState.score;
      elements.treesSavedEl.textContent = gameState.treesSaved;
      elements.firesExtinguishedEl.textContent = gameState.firesExtinguished;
      elements.levelEl.textContent = gameState.level;
      elements.timerEl.textContent = gameState.timeLeft;
      elements.dangerMeterFill.style.width = gameState.fireDanger + '%';

      // Update fire danger level text
      if (gameState.fireDanger < 40) {
        elements.fireDangerEl.textContent = 'Low';
        elements.fireDangerEl.style.color = '#4CAF50';
      } else if (gameState.fireDanger < 70) {
        elements.fireDangerEl.textContent = 'Medium';
        elements.fireDangerEl.style.color = '#FFC107';
      } else {
        elements.fireDangerEl.textContent = 'High';
        elements.fireDangerEl.style.color = '#FF5722';
      }

      updateToolStatus();
    }

    function updateToolStatus() {
      // Update tool visual states
      Object.keys(gameState.tools).forEach(toolName => {
        const tool = gameState.tools[toolName];
        const toolElement = elements[toolName + 'Tool'];
        const statusElement = toolElement.querySelector('.tool-status');

        toolElement.classList.remove('ready', 'charging');

        if (tool.ready) {
          toolElement.classList.add('ready');
          statusElement.textContent = 'Ready';
        } else {
          toolElement.classList.add('charging');
          statusElement.textContent = `${tool.cooldown}s`;
        }
      });
    }

    function initializeForest() {
      elements.forestGrid.innerHTML = '';
      gameState.forestGrid = [];

      for (let row = 0; row < GRID_SIZE.rows; row++) {
        gameState.forestGrid[row] = [];
        for (let col = 0; col < GRID_SIZE.cols; col++) {
          const cell = document.createElement('div');
          cell.className = 'forest-cell';
          cell.dataset.row = row;
          cell.dataset.col = col;

          const tree = document.createElement('div');
          tree.className = 'tree healthy';
          tree.textContent = '🌳';
          tree.addEventListener('click', () => handleTreeClick(row, col));

          cell.appendChild(tree);
          elements.forestGrid.appendChild(cell);

          gameState.forestGrid[row][col] = {
            element: tree,
            state: TREE_STATES.HEALTHY,
            fireIntensity: 0
          };
        }
      }
    }

    function handleTreeClick(row, col) {
      if (!gameState.isPlaying || gameState.isPaused) return;

      const tree = gameState.forestGrid[row][col];

      if (tree.state === TREE_STATES.BURNING) {
        extinguishFire(row, col);
      }
    }

    function extinguishFire(row, col) {
      const tree = gameState.forestGrid[row][col];

      if (tree.state !== TREE_STATES.BURNING) return;

      // Change tree back to healthy
      tree.state = TREE_STATES.SAVED;
      tree.element.className = 'tree saved';
      tree.element.textContent = '🌳';
      tree.fireIntensity = 0;

      // Remove from active fires
      gameState.activeFires = gameState.activeFires.filter(
        fire => !(fire.row === row && fire.col === col)
      );

      // Update stats
      gameState.firesExtinguished++;
      gameState.treesSaved++;
      gameState.score += 20;

      // Visual effects
      createWaterDropEffect(row, col);
      createScorePopup(tree.element, '+20', '#4CAF50');

      // Reset to healthy after animation
      setTimeout(() => {
        if (tree.state === TREE_STATES.SAVED) {
          tree.state = TREE_STATES.HEALTHY;
          tree.element.className = 'tree healthy';
        }
      }, 1000);

      checkLevelUp();
      checkAchievements();
      updateUI();
    }

    function startFire() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      // Find healthy trees
      const healthyTrees = [];
      for (let row = 0; row < GRID_SIZE.rows; row++) {
        for (let col = 0; col < GRID_SIZE.cols; col++) {
          if (gameState.forestGrid[row][col].state === TREE_STATES.HEALTHY) {
            healthyTrees.push({ row, col });
          }
        }
      }

      if (healthyTrees.length === 0) return;

      // Start fire on random healthy tree
      const randomTree = healthyTrees[Math.floor(Math.random() * healthyTrees.length)];
      igniteTree(randomTree.row, randomTree.col);
    }

    function igniteTree(row, col) {
      const tree = gameState.forestGrid[row][col];

      if (tree.state !== TREE_STATES.HEALTHY) return;

      tree.state = TREE_STATES.BURNING;
      tree.element.className = 'tree burning';
      tree.element.textContent = '🔥';
      tree.fireIntensity = 1;

      gameState.activeFires.push({ row, col, startTime: Date.now() });

      createSmokeEffect(row, col);
      createFireSpreadEffect(row, col);

      // Increase fire danger
      gameState.fireDanger = Math.min(100, gameState.fireDanger + 5);
      updateUI();
    }

    function spreadFires() {
      if (!gameState.isPlaying || gameState.isPaused) return;

      const newFires = [];

      gameState.activeFires.forEach(fire => {
        const { row, col } = fire;
        const tree = gameState.forestGrid[row][col];

        // Check if fire should burn out the tree
        if (Date.now() - fire.startTime > 5000) {
          tree.state = TREE_STATES.BURNT;
          tree.element.className = 'tree burnt';
          tree.element.textContent = '🪵';
          gameState.score = Math.max(0, gameState.score - 10);
          return;
        }

        // Spread to adjacent trees
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;

          if (newRow >= 0 && newRow < GRID_SIZE.rows &&
            newCol >= 0 && newCol < GRID_SIZE.cols) {

            const adjacentTree = gameState.forestGrid[newRow][newCol];

            if (adjacentTree.state === TREE_STATES.HEALTHY &&
              Math.random() < 0.1 * (gameState.level * 0.5)) {
              newFires.push({ row: newRow, col: newCol });
            }
          }
        });
      });

      // Remove burnt trees from active fires
      gameState.activeFires = gameState.activeFires.filter(fire => {
        const tree = gameState.forestGrid[fire.row][fire.col];
        return tree.state === TREE_STATES.BURNING;
      });

      // Ignite new fires
      newFires.forEach(fire => {
        igniteTree(fire.row, fire.col);
      });
    }

    function createWaterDropEffect(row, col) {
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      drop.textContent = '💧';

      const cell = elements.forestGrid.children[row * GRID_SIZE.cols + col];
      const rect = cell.getBoundingClientRect();
      const containerRect = elements.forestGrid.getBoundingClientRect();

      drop.style.left = (rect.left - containerRect.left + 20) + 'px';
      drop.style.top = (rect.top - containerRect.top + 20) + 'px';

      elements.waterDrops.appendChild(drop);

      setTimeout(() => drop.remove(), 1000);
    }

    function createSmokeEffect(row, col) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-cloud';
      smoke.textContent = '💨';

      const cell = elements.forestGrid.children[row * GRID_SIZE.cols + col];
      const rect = cell.getBoundingClientRect();
      const containerRect = elements.forestGrid.getBoundingClientRect();

      smoke.style.left = (rect.left - containerRect.left + 15) + 'px';
      smoke.style.top = (rect.top - containerRect.top + 10) + 'px';

      elements.smokeEffects.appendChild(smoke);

      setTimeout(() => smoke.remove(), 3000);
    }

    function createFireSpreadEffect(row, col) {
      const spread = document.createElement('div');
      spread.className = 'fire-spread';
      spread.textContent = '🔥';

      const cell = elements.forestGrid.children[row * GRID_SIZE.cols + col];
      const rect = cell.getBoundingClientRect();
      const containerRect = elements.forestGrid.getBoundingClientRect();

      spread.style.left = (rect.left - containerRect.left + 20) + 'px';
      spread.style.top = (rect.top - containerRect.top + 20) + 'px';

      elements.fireEffects.appendChild(spread);

      setTimeout(() => spread.remove(), 800);
    }

    function createScorePopup(element, text, color) {
      const popup = document.createElement('div');
      popup.className = 'forest-score-popup';
      popup.textContent = text;
      popup.style.color = color;
      popup.style.left = element.offsetLeft + 'px';
      popup.style.top = element.offsetTop + 'px';

      element.parentElement.appendChild(popup);

      setTimeout(() => popup.remove(), 1000);
    }

    function useHelicopter() {
      if (!gameState.tools.helicopter.ready || !gameState.isPlaying) return;

      // Extinguish all fires
      gameState.activeFires.forEach(fire => {
        const tree = gameState.forestGrid[fire.row][fire.col];
        tree.state = TREE_STATES.SAVED;
        tree.element.className = 'tree saved';
        tree.element.textContent = '🌳';
        tree.fireIntensity = 0;

        gameState.firesExtinguished++;
        gameState.treesSaved++;
        gameState.score += 50;

        createHelicopterDropEffect(fire.row, fire.col);
      });

      gameState.activeFires = [];
      gameState.fireDanger = Math.max(0, gameState.fireDanger - 30);

      // Set helicopter on cooldown
      gameState.tools.helicopter.ready = false;
      gameState.tools.helicopter.cooldown = 15;

      showMessage('Helicopter water drop successful! All fires extinguished!', 'success');
      updateUI();
    }

    function createHelicopterDropEffect(row, col) {
      const drop = document.createElement('div');
      drop.className = 'helicopter-drop';
      drop.textContent = '💧';

      const cell = elements.forestGrid.children[row * GRID_SIZE.cols + col];
      const rect = cell.getBoundingClientRect();
      const containerRect = elements.forestGrid.getBoundingClientRect();

      drop.style.left = (rect.left - containerRect.left + 10) + 'px';
      drop.style.top = (rect.top - containerRect.top - 20) + 'px';

      elements.waterDrops.appendChild(drop);

      setTimeout(() => drop.remove(), 2000);
    }

    function updateCooldowns() {
      Object.keys(gameState.tools).forEach(toolName => {
        const tool = gameState.tools[toolName];
        if (!tool.ready && tool.cooldown > 0) {
          tool.cooldown--;
          if (tool.cooldown <= 0) {
            tool.ready = true;
          }
        }
      });
      updateToolStatus();
    }

    function checkLevelUp() {
      const newLevel = Math.floor(gameState.firesExtinguished / 10) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;

        // Show level up effect
        const levelUpEffect = document.createElement('div');
        levelUpEffect.className = 'forest-level-up';
        levelUpEffect.textContent = `LEVEL ${gameState.level}!`;
        elements.forestGrid.appendChild(levelUpEffect);

        setTimeout(() => levelUpEffect.remove(), 2000);

        showMessage(`Level Up! Now Level ${gameState.level} - Fires spread faster!`, 'success');
        addConfetti();
      }
    }

    function checkAchievements() {
      // Fire Fighter
      if (gameState.firesExtinguished >= 15 && !gameState.achievements['fire-fighter']) {
        unlockAchievement('fire-fighter', 'Fire Fighter! 🚒');
      }

      // Forest Guardian
      if (gameState.treesSaved >= 25 && !gameState.achievements['forest-guardian']) {
        unlockAchievement('forest-guardian', 'Forest Guardian! 🌳');
      }

      // Eco Hero
      if (gameState.score >= 600 && !gameState.achievements['eco-hero']) {
        unlockAchievement('eco-hero', 'Eco Hero! 🏆');
      }
    }

    function unlockAchievement(achievementId, message) {
      gameState.achievements[achievementId] = true;
      const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
      if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
      }

      showMessage(`Achievement Unlocked: ${message}`, 'success');
      gameState.score += 100; // Bonus points for achievements
      updateUI();
    }

    function startGame() {
      gameState.isPlaying = true;
      gameState.isPaused = false;
      elements.startBtn.disabled = true;
      elements.pauseBtn.disabled = false;

      initializeForest();

      // Start game timer
      gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
          gameState.timeLeft--;
          updateUI();

          if (gameState.timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);

      // Start fire spawning
      gameState.gameInterval = setInterval(() => {
        if (!gameState.isPaused) {
          startFire();
          updateCooldowns();
        }
      }, 3000 - (gameState.level * 200));

      // Start fire spreading
      gameState.fireSpreadInterval = setInterval(() => {
        if (!gameState.isPaused) {
          spreadFires();
        }
      }, 2000);

      showMessage('Forest firefighting started! Click on fires to extinguish them!', 'info');
    }

    function pauseGame() {
      gameState.isPaused = !gameState.isPaused;
      elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';

      if (gameState.isPaused) {
        showMessage('Game Paused', 'warning');
      } else {
        showMessage('Game Resumed', 'info');
      }
    }

    function resetGame() {
      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.fireSpreadInterval) clearInterval(gameState.fireSpreadInterval);

      // Reset game state
      gameState.score = 0;
      gameState.treesSaved = 0;
      gameState.firesExtinguished = 0;
      gameState.level = 1;
      gameState.timeLeft = 60;
      gameState.fireDanger = 30;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.activeFires = [];

      // Reset tools
      gameState.tools = {
        waterHose: { ready: true, cooldown: 0 },
        fireExtinguisher: { ready: true, cooldown: 0 },
        helicopter: { ready: false, cooldown: 10 }
      };

      // Reset achievements
      Object.keys(gameState.achievements).forEach(key => {
        gameState.achievements[key] = false;
        const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
        if (achievementEl) {
          achievementEl.classList.remove('unlocked');
          achievementEl.classList.add('locked');
        }
      });

      // Reset UI
      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;
      elements.pauseBtn.textContent = '⏸️ Pause';

      initializeForest();
      updateUI();
      showMessage('Forest game reset!', 'info');
    }

    function endGame() {
      gameState.isPlaying = false;

      // Clear intervals
      if (gameState.gameInterval) clearInterval(gameState.gameInterval);
      if (gameState.timerInterval) clearInterval(gameState.timerInterval);
      if (gameState.fireSpreadInterval) clearInterval(gameState.fireSpreadInterval);

      elements.startBtn.disabled = false;
      elements.pauseBtn.disabled = true;

      // Calculate final score and award points
      const finalScore = gameState.score;
      const pointsEarned = Math.floor(finalScore / 10);

      if (pointsEarned > 0) {
        completeTask(`Forest Protection (Score: ${finalScore})`, pointsEarned);
      }

      showMessage(`Game Over! Final Score: ${finalScore} | Trees Saved: ${gameState.treesSaved} | Fires Extinguished: ${gameState.firesExtinguished} | Points Earned: ${pointsEarned}`, 'success');

      // Show confetti for good scores
      if (finalScore >= 500) {
        addConfetti();
      }
    }

    // Event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.helicopterTool.addEventListener('click', useHelicopter);

    // Initialize forest and UI
    initializeForest();
    updateUI();
    showMessage('Save the Forest game loaded! Click Start Firefighting to begin!', 'info');
  }

  // Add error handling for any remaining issues
  window.addEventListener("error", (e) => {
    console.error("Website error:", e.error);
    showMessage("An error occurred. Please refresh the page.", "error");
  });

  // Add unhandled promise rejection handling
  window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled promise rejection:", e.reason);
    showMessage("An error occurred. Please try again.", "error");
  });
});

// Profile UI rendering
function updateProfileUI() {
  const email = localStorage.getItem("ecoUserEmail") || "guest";
  const name = localStorage.getItem("ecoUserName") || "Guest";
  const profileKey = `profile_${email}`;
  const data = JSON.parse(localStorage.getItem(profileKey) || "{}");
  const points = localStorage.getItem("ecoPoints") || "0";

  const nameEl = document.getElementById("profile-name");
  const pointsEl = document.getElementById("profile-points");
  const quizzesEl = document.getElementById("profile-quizzes");
  const bestEl = document.getElementById("profile-best");
  const historyList = document.getElementById("profile-history-list");

  if (nameEl) nameEl.textContent = name;
  if (pointsEl) pointsEl.textContent = points;
  if (quizzesEl) quizzesEl.textContent = data.quizzesCompleted || 0;
  if (bestEl) bestEl.textContent = `${data.bestPercentage || 0}%`;
  if (historyList) {
    historyList.innerHTML = "";
    (data.history || []).slice(0, 5).forEach((h) => {
      const div = document.createElement("div");
      div.className = "history-item";
      const date = new Date(h.ts).toLocaleString();
      div.innerHTML = `<span>${h.title}</span><span>${h.percentage}% (${h.correct}/${h.total}) · ${date}</span>`;
      historyList.appendChild(div);
    });
  }
}

// Smooth scrolling for all internal links
document.addEventListener("DOMContentLoaded", function () {
  // Function to handle smooth scrolling
  function smoothScrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Calculate offset for fixed navbar
      const navbarHeight = document.querySelector(".navbar").offsetHeight;
      const targetPosition = targetElement.offsetTop - navbarHeight - 20;

      // Smooth scroll to target
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Close mobile menu if open
      const navMenu = document.querySelector(".nav-menu");
      const hamburger = document.querySelector(".hamburger");
      if (navMenu && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
      }
    }
  }

  // Add click event listeners to all navbar links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Only handle internal links (starting with #)
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        smoothScrollToSection(targetId);
      }
    });
  });

  // Add click event listeners to all other internal links (buttons, CTAs, etc.)
  const allInternalLinks = document.querySelectorAll('a[href^="#"]');
  allInternalLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        smoothScrollToSection(targetId);
      }
    });
  });

  // Handle CTA buttons that scroll to sections
  const ctaButtons = document.querySelectorAll('.cta-button[href^="#"]');
  ctaButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        smoothScrollToSection(targetId);
      }
    });
  });
});

// Login/Register Functionality
document.addEventListener('DOMContentLoaded', function () {
  // Get modal elements
  const loginModal = document.getElementById('login-modal');
  const loginBtn = document.getElementById('login-btn');
  const closeModal = document.querySelector('.close-modal');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const authForms = document.querySelectorAll('.auth-form');
  const switchLinks = document.querySelectorAll('.switch-link');

  // Get forms
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Check if user is already logged in
  checkLoginStatus();

  // Open modal
  loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  // Close modal
  closeModal.addEventListener('click', function () {
    closeLoginModal();
  });

  // Close modal when clicking outside
  window.addEventListener('click', function (e) {
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Switch links
  switchLinks.forEach(link => {
    link.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Login form submission
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleLogin();
  });

  // Register form submission
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleRegister();
  });

  function closeLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    clearMessages();
  }

  function switchTab(targetTab) {
    // Update tab buttons
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === targetTab) {
        btn.classList.add('active');
      }
    });

    // Update forms
    authForms.forEach(form => {
      form.classList.remove('active');
      if (form.id === targetTab + '-form') {
        form.classList.add('active');
      }
    });

    clearMessages();
  }

  function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    // Get stored users
    const users = JSON.parse(localStorage.getItem('ecolearn_users') || '[]');

    // Find user by email or user ID
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() ||
      u.userId.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      showMessage('User not found. Please check your email/user ID or register first.', 'error');
      return;
    }

    if (user.password !== password) {
      showMessage('Incorrect password. Please try again.', 'error');
      return;
    }

    // Login successful
    localStorage.setItem('ecolearn_current_user', JSON.stringify(user));
    showMessage('Login successful! Welcome back, ' + user.name + '!', 'success');

    setTimeout(() => {
      closeLoginModal();
      updateLoginStatus();
      updateProfileDisplay();
    }, 1500);
  }

  function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const userId = document.getElementById('register-userid').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validation
    if (!name || !email || !userId || !password || !confirmPassword) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    if (userId.length < 3) {
      showMessage('User ID must be at least 3 characters long', 'error');
      return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('ecolearn_users') || '[]');

    const existingUser = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() ||
      u.userId.toLowerCase() === userId.toLowerCase()
    );

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        showMessage('An account with this email already exists', 'error');
      } else {
        showMessage('This user ID is already taken', 'error');
      }
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      userId: userId,
      password: password,
      registeredAt: new Date().toISOString(),
      ecoPoints: 0,
      level: 1,
      badges: [],
      completedChallenges: []
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('ecolearn_users', JSON.stringify(users));
    localStorage.setItem('ecolearn_current_user', JSON.stringify(newUser));

    showMessage('Registration successful! Welcome to EcoLearn, ' + name + '!', 'success');

    setTimeout(() => {
      closeLoginModal();
      updateLoginStatus();
      updateProfileDisplay();
    }, 1500);
  }

  function showMessage(text, type) {
    // Remove existing messages
    clearMessages();

    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    // Insert message at the top of the active form
    const activeForm = document.querySelector('.auth-form.active');
    activeForm.insertBefore(message, activeForm.firstChild);
  }

  function clearMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('ecolearn_current_user') || 'null');
    if (currentUser) {
      updateLoginStatus();
    }
    updateProfileDisplay();
  }

  function updateLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('ecolearn_current_user') || 'null');
    const loginBtn = document.getElementById('login-btn');

    if (currentUser) {
      // User is logged in - show user info
      loginBtn.innerHTML = `
                <div class="user-info show">
                    <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                    <span>${currentUser.name}</span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            `;
      loginBtn.style.pointerEvents = 'none'; // Disable click on login button
    } else {
      // User is not logged in - show login button
      loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
      loginBtn.style.pointerEvents = 'auto';
    }
  }

  // Make logout function global
  window.logout = function () {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('ecolearn_current_user');
      updateLoginStatus();
      updateProfileDisplay();
      showNotification('You have been logged out successfully', 'info');
    }
  };

  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 4000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Add CSS for notifications
  const notificationStyles = document.createElement('style');
  notificationStyles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
  document.head.appendChild(notificationStyles);
});

