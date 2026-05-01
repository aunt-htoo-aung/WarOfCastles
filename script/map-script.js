const MAPS = [
  { name: "High King's Valley", src: "./assets/map/map1.png", price: 0 },
  { name: "Abyssal Hollow", src: "./assets/map/map2.png", price: 5000 },
  { name: "Steam-Hollow Valley", src: "./assets/map/map3.png", price: 5000 },
  { name: "Frozen Tundra", src: "./assets/map/map4.png", price: 5000 },
  { name: "Underwater Kingdom", src: "./assets/map/map5.png", price: 5000 },
];

let currentIndex = 0;

// Selectors
const nameEl = document.querySelector(".map-name");
const mapImg = document.querySelector(".map-img img");
const priceTag = document.querySelector(".price-overlay");
const actionBtn = document.querySelector(".map-container button");
const [prevBtn, nextBtn] = document.querySelectorAll(".nav-btn");

// // Initialize Data from LocalStorage
// let gameData = JSON.parse(localStorage.getItem("warOfCastleData")) || {
//   currency: 10000, // Starting currency for testing
//   ownedMap: [0],
//   defaultMap: 0,
// };

function saveData() {
  localStorage.setItem("data", JSON.stringify(localData));
}

function updateDisplay() {
  const map = MAPS[currentIndex];
  const isOwned = localData.ownedMap.includes(currentIndex);
  const isDefault = localData.defaultMap === currentIndex;

  nameEl.textContent = map.name;
  mapImg.src = map.src;
  currencyEl.textContent = `🪙 ${localData.coins}`;

  // Price Tag Visibility
  if (isOwned) {
    priceTag.style.display = "none";
  } else {
    priceTag.style.display = "block";
    priceTag.textContent = "🪙 " + map.price;
  }

  // Button Logic
  if (isDefault) {
    actionBtn.textContent = "Active";
    actionBtn.style.background = "#4CAF50"; // Green for active
    actionBtn.disabled = true;
  } else if (isOwned) {
    actionBtn.textContent = "Set Default";
    actionBtn.style.background = "#ffd700"; // Gold
    actionBtn.disabled = false;
  } else {
    actionBtn.textContent = "Purchase";
    actionBtn.style.background = "#ffd700";
    actionBtn.disabled = false;
  }
}

// Action Button Logic (Purchase or Set Default)
actionBtn.addEventListener("click", () => {
  const map = MAPS[currentIndex];
  const isOwned = localData.ownedMap.includes(currentIndex);

  if (!isOwned) {
    // Purchase Logic
    if (localData.coins >= map.price) {
      localData.coins -= map.price;
      localData.ownedMap.push(currentIndex);
      saveData();
      alert(`Purchased ${map.name}!`);
      updateDisplay();
    } else {
      alert("Not enough coins!");
    }
  } else {
    // Set Default Logic
    localData.defaultMap = currentIndex;
    saveData();
    updateDisplay();
  }
});

// Navigation Logic
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % MAPS.length;
  updateDisplay();
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + MAPS.length) % MAPS.length;
  updateDisplay();
});

// Initial Load
updateDisplay();
