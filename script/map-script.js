const MAPS = [
  {
    name: "High King's Valley",
    src: "./assets/map/map1.png",
    price: 0,
  },
  {
    name: "Abyssal Hollow",
    src: "./assets/map/map2.png",
    price: 5000,
  },
  {
    name: "Steam-Hollow Valley",
    src: "./assets/map/map3.png",
    price: 5000,
  },
  {
    name: "Frozen Tundra",
    src: "./assets/map/map4.png",
    price: 5000,
  },
  {
    name: "Underwater Kingdom",
    src: "./assets/map/map5.png",
    price: 5000,
  },
];

let currentIndex = 0;

// Selectors
const nameEl = document.querySelector(".map-name");
const mapImg = document.querySelector(".map-img img");
const priceTag = document.querySelector(".price-overlay");
const purchaseBtn = document.querySelector(".map-container button");
const [prevBtn, nextBtn] = document.querySelectorAll(".nav-btn");
function updateDisplay() {
  const map = MAPS[currentIndex];

  nameEl.textContent = map.name;
  mapImg.src = map.src;
  if (map.price > 0) {
    // purchaseBtn.style.display = "block";
    priceTag.style.display = "block";
    priceTag.textContent = "🪙 " + map.price;
    purchaseBtn.textContent = "Purchase";
  } else {
    priceTag.style.display = "none";
    // purchaseBtn.style.display = "none";
    purchaseBtn.textContent = "Default Map";
  }
}

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
