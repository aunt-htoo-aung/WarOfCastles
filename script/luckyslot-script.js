const SYMBOLS = [
  { icon: "💎", weight: 0.5, three: 100, two: 10 },
  { icon: "🔔", weight: 1.5, three: 50, two: 5 },
  { icon: "⭐", weight: 4, three: 20, two: 3 },
  { icon: "🍉", weight: 9, three: 10, two: 2 },
  { icon: "🍋", weight: 35, three: 5, two: 1 },
  { icon: "🍒", weight: 50, three: 2, two: 0.5 },
];
const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
];

const resultText = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");
const betInput = document.getElementById("betAmount");
const victoryCoinsText = document.getElementById("victoryCoins");

const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

const amountBtn = document.querySelectorAll(".amount-box .btn");
const clearBtn = document.querySelector(".clear-btn");
amountBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    let amount = Number(btn.getAttribute("data-amount"));
    let current = Number(betInput.value) || 0;
    betInput.value = current + amount;
  });
});

clearBtn.addEventListener("click", () => {
  betInput.value = 0;
});

function syncCurrency() {
  localStorage.setItem("data", JSON.stringify(localData));
  if (currencyEl) {
    currencyEl.textContent = `🪙 ${localData.coins.toLocaleString()}`;
  }
}

function getWeightedSymbol() {
  let random = Math.random() * totalWeight;
  for (const symbol of SYMBOLS) {
    if (random < symbol.weight) return symbol;
    random -= symbol.weight;
  }
}

function spinReel(reel, duration) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      reel.textContent = getWeightedSymbol().icon;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalSymbol = getWeightedSymbol();
      reel.textContent = finalSymbol.icon;
      resolve(finalSymbol);
    }, duration);
  });
}

function calculateResult(r1, r2, r3, currentBet) {
  const a = r1.icon;
  const b = r2.icon;
  const c = r3.icon;
  let winAmount = 0;

  // --- 3 MATCH ---
  if (a === b && b === c) {
    winAmount = currentBet * r1.three;
    resultText.textContent = `WIN x${r1.three} (${a}${a}${a})`;
  }
  // --- 2 MATCH ---
  else if (a === b || a === c) {
    winAmount = currentBet * r1.two;
    resultText.textContent = `WIN x${r1.two} (${a}${a})`;
  } else if (b === c) {
    winAmount = currentBet * r2.two;
    resultText.textContent = `WIN x${r2.two} (${b}${b})`;
  }
  // --- LOSE ---
  else {
    resultText.textContent = "No Win";
  }

  // Update victory display and persist new balance[cite: 1]
  victoryCoinsText.textContent = winAmount.toLocaleString();
  localData.coins += winAmount;
  syncCurrency();
}

async function startSpin() {
  const currentBet = parseInt(betInput.value);

  // Validation[cite: 1]
  if (isNaN(currentBet) || currentBet <= 0) {
    alert("Enter a valid bet!");
    return;
  }

  if (currentBet > localData.coins) {
    alert("Insufficient coins in your castle!");
    return;
  }

  // Deduct bet and start animation[cite: 1]
  localData.coins -= currentBet;
  syncCurrency();

  victoryCoinsText.textContent = "0";
  spinBtn.disabled = true;
  resultText.textContent = "Spinning...";

  const [r1, r2, r3] = await Promise.all([
    spinReel(reels[0], 1000),
    spinReel(reels[1], 1500),
    spinReel(reels[2], 2000),
  ]);

  calculateResult(r1, r2, r3, currentBet);
  spinBtn.disabled = false;
}

spinBtn.addEventListener("click", startSpin);

// Initialize Victory display
if (victoryCoinsText) victoryCoinsText.textContent = "0";
