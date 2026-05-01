// Game State
let deck = [];
let playerCards = [];
let botCards = [];
let gameOver = false;
let balance = localData.coins;
let currentBet = 0;

const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const betInput = document.getElementById("betAmount");
function showBettingArea() {
  document.getElementById("betting-area").style.display = "block";
  document.getElementById("gameBoard").style.display = "none";
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("hitBtn").style.display = "inline-block";
  document.getElementById("standBtn").style.display = "inline-block";
  document.getElementById("result").textContent = "";
}

function placeBet() {
  currentBet = parseInt(betInput.value);

  if (currentBet > balance || currentBet <= 0) {
    alert("Invalid bet amount! Check your balance.");
    return;
  }
  localData.coins;
  balance -= currentBet;

  startGame();
  syncCurrency();
}

function syncCurrency() {
  localData.coins = balance;
  localStorage.setItem("data", JSON.stringify(localData));
  if (currencyEl) {
    currencyEl.textContent = `🪙 ${localData.coins.toLocaleString()}`;
  }
}
// Core Game Logic
function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      let numericValue = ["J", "Q", "K"].includes(value)
        ? 10
        : value === "A"
          ? 11
          : parseInt(value);
      deck.push({ suit, value, numericValue });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function startGame() {
  createDeck();
  shuffleDeck();
  playerCards = [deck.pop(), deck.pop()];
  botCards = [deck.pop(), deck.pop()];
  gameOver = false;
  document.getElementById("hitBtn").style.display = "inline-block";
  document.getElementById("standBtn").style.display = "inline-block";
  render();
}

function calculateTotal(cards) {
  let total = cards.reduce((sum, card) => sum + card.numericValue, 0);
  let aces = cards.filter((c) => c.value === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function render() {
  const renderContainer = (cards, id) => {
    const el = document.getElementById(id);
    el.innerHTML = "";
    cards.forEach((card) => {
      const div = document.createElement("div");
      div.className = `card ${["♥", "♦"].includes(card.suit) ? "red" : ""}`;
      div.innerHTML = `<div class="top">${card.value}${card.suit}</div><div class="bottom">${card.value}${card.suit}</div>`;
      el.appendChild(div);
    });
  };

  renderContainer(playerCards, "player-cards");
  renderContainer(botCards, "bot-cards");
  document.getElementById("player-total").textContent =
    calculateTotal(playerCards);
  document.getElementById("bot-total").textContent = calculateTotal(botCards);
}

function hit() {
  if (gameOver) return;
  playerCards.push(deck.pop());
  render();
  if (calculateTotal(playerCards) > 21) endGame();
}

function stand() {
  if (gameOver) return;
  while (calculateTotal(botCards) < 17) botCards.push(deck.pop());
  endGame();
}

function endGame() {
  gameOver = true;
  const pTotal = calculateTotal(playerCards);
  const bTotal = calculateTotal(botCards);
  let res = "";
  let winCoin = 0;
  if (pTotal > 21) {
    res = "Bust! You Lose.";
  } else if (bTotal > 21 || pTotal > bTotal) {
    res = "You Win!";
    winCoin = currentBet * 2;
  } else if (pTotal < bTotal) {
    res = "Dealer Wins!";
  } else {
    res = "Push (Draw)";
    winCoin = currentBet;
  }
  balance += winCoin;

  document.getElementById("victoryCoins").textContent = winCoin;
  document.getElementById("result").textContent = res;
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("hitBtn").style.display = "none";
  document.getElementById("standBtn").style.display = "none";
  syncCurrency();
  render();
}

const amountBtn = document.querySelectorAll(".amount-box .btn");
const clearBtn = document.querySelector(".clear-btn");
amountBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    let amount = Number(btn.getAttribute("data-amount"));
    let current = Number(betInput.value) || 0;
    betInput.value = current + amount;
  });
});
