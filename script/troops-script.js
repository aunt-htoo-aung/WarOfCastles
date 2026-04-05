const TROOPS = {
  ZOMBIE: {
    SPAWN: "assets/zombie/zombie_spawn.gif",
    SPAWN_TIME: 2200,
    WALK: "assets/zombie/zombie_walk.gif",
    ATTACK: "assets/zombie/zombie_attack.gif",
    DIE: "assets/zombie/zombie_die.gif",
    DIE_TIME: 1600,
    HP: 1200,
    DAMAGE: 60,
    ATTACK_SPEED: 800,
    MOVEMENT: 40,
    LIFE_STEAL: 0.05,
    COST: 80,
  },
  SKELETON: {
    SPAWN: "assets/skeleton/skeleton_spawn.gif",
    SPAWN_TIME: 2000,
    WALK: "assets/skeleton/skeleton_walk.gif",
    ATTACK: "assets/skeleton/skeleton_attack.gif",
    DIE: "assets/skeleton/skeleton_die.gif",
    DIE_TIME: 2000,
    HP: 450,
    DAMAGE: 55,
    ATTACK_SPEED: 1600,
    MOVEMENT: 90,
    COST: 60,
  },
  GOLEM: {
    SPAWN: "assets/golem/golem_spawn.gif",
    SPAWN_TIME: 3000,
    WALK: "assets/golem/golem_walk.gif",
    ATTACK: "assets/golem/golem_attack.gif",
    DIE: "assets/golem/golem_die.gif",
    DIE_TIME: 1750,
    HP: 2500,
    DAMAGE: 120,
    ATTACK_SPEED: 400,
    MOVEMENT: 20,
    COST: 150,
  },
  VAMPIRE: {
    SPAWN: "assets/vampire/vampire_spawn.gif",
    SPAWN_TIME: 2400,
    WALK: "assets/vampire/vampire_walk.gif",
    ATTACK: "assets/vampire/vampire_attack.gif",
    DIE: "assets/vampire/vampire_die.gif",
    DIE_TIME: 2400,
    HP: 850,
    DAMAGE: 130,
    ATTACK_SPEED: 1200,
    MOVEMENT: 85,
    LIFE_STEAL: 0.25,
    RANGE: 15,
    COST: 140,
  },
  MACHINE: {
    SPAWN: "assets/machine/machine_spawn.gif",
    SPAWN_TIME: 3000,
    WALK: "assets/machine/machine_walk.gif",
    ATTACK: "assets/machine/machine_attack.gif",
    DIE: "assets/machine/machine_die.gif",
    DIE_TIME: 2250,
    HP: 1000,
    DAMAGE: 110,
    ATTACK_SPEED: 1000,
    MOVEMENT: 65,
    COST: 120,
  },
};

// State management
const troopKeys = Object.keys(TROOPS);
let currentIndex = 0;

// Selectors
const titleEl = document.querySelector(".title");
const troopImg = document.querySelector(".troops-container img");
const statsLeft = document.querySelectorAll(".left-side p");
const statsRight = document.querySelectorAll(".right-side p");
const [prevBtn, nextBtn] = document.querySelectorAll(".nav-btn");

function updateDisplay() {
  const key = troopKeys[currentIndex];
  const troop = TROOPS[key];

  // Update Title and Image (Using ATTACK gif as requested)
  titleEl.textContent = key;
  troopImg.src = troop.ATTACK;
  troopImg.alt = key;

  // Update Stats Left: Health, Damage, Cost
  statsLeft[0].textContent = `Health: ${troop.HP}`;
  statsLeft[1].textContent = `Damage: ${troop.DAMAGE}`;
  statsLeft[2].textContent = `Cost: ${troop.COST}`;

  // Update Stats Right: Attack Speed, Movement Speed
  // Note: Added a check for Life Steal or Range since some troops have them
  statsRight[0].textContent = `Attack Speed: ${troop.ATTACK_SPEED}`;
  statsRight[1].textContent = `Movement: ${troop.MOVEMENT}`;

  // Optional: Handle the vampire/zombie life steal if you want it visible
  if (troop.LIFE_STEAL) {
    statsRight[1].innerHTML += `<br>Life Steal: ${Math.round(troop.LIFE_STEAL * 100)}%`;
  }
}

// Navigation Logic
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % troopKeys.length;
  updateDisplay();
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + troopKeys.length) % troopKeys.length;
  updateDisplay();
});

// Initial Load
updateDisplay();
