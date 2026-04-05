/* ---------------- TROOP DATA ---------------- */
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

/* ---------------- GAME STATE ---------------- */
const GAME = {
  lanes: [],
  troops: [],
  playerCastleHP: 20000,
  enemyCastleHP: 20000,
  maxCastleHP: 20000,
  playerPoints: 100, // Initial player points
  botPoints: 100, // Initial bot points
  running: true,
  idCounter: 0,
};

/* ---------------- INIT ---------------- */
const laneElements = document.querySelectorAll(".lane");
const troopCards = document.querySelectorAll(".troop-card");

GAME.lanes = [...laneElements].map(() => ({
  player: [],
  enemy: [],
}));

initDragSystem();
startIncomeTimer(); // Start 10 points per second timer
startBotSpawner();
requestAnimationFrame(gameLoop);

/* =====================================================
   INCOME SYSTEM (10 points per second)
===================================================== */
function startIncomeTimer() {
  setInterval(() => {
    if (!GAME.running) return;

    GAME.playerPoints += 10;
    GAME.botPoints += 10;

    updateUI();
  }, 1000);
}

function updateUI() {
  // Update point display
  const pointDisplay = document.querySelector(".points-value");
  if (pointDisplay) pointDisplay.innerText = Math.floor(GAME.playerPoints);

  // Disable/Enable cards based on cost
  troopCards.forEach((card) => {
    const type = getTroopType(card);
    if (TROOPS[type].COST > GAME.playerPoints) {
      card.classList.add("disabled");
    } else {
      card.classList.remove("disabled");
    }
  });
}

/* =====================================================
   DRAG & DROP SYSTEM
===================================================== */
function initDragSystem() {
  troopCards.forEach((card) => {
    const img = card.querySelector("img");
    const troopType = getTroopType(card);

    img.draggable = true;
    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("troopType", troopType);
    });
  });

  laneElements.forEach((lane, laneIndex) => {
    lane.addEventListener("dragover", (e) => e.preventDefault());
    lane.addEventListener("drop", (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("troopType");
      if (!type) return;

      // Deduct points on deployment
      if (GAME.playerPoints >= TROOPS[type].COST) {
        GAME.playerPoints -= TROOPS[type].COST;
        updateUI();
        spawnTroop(type, laneIndex, "player");
      }
    });
  });
}

/* =====================================================
   SPAWN TROOP
===================================================== */
function spawnTroop(type, laneIndex, side) {
  const data = TROOPS[type];
  const lane = laneElements[laneIndex];

  const troopEl = document.createElement("img");
  troopEl.className = `battle-troop ${side}-troop`;
  troopEl.src = data.SPAWN;

  lane.appendChild(troopEl);

  const startPos = side === "player" ? 10 : lane.offsetWidth - 70;

  const troop = {
    id: GAME.idCounter++,
    type,
    lane: laneIndex,
    side,
    hp: data.HP,
    damage: data.DAMAGE,
    speed: data.MOVEMENT / 100,
    attackSpeed: data.ATTACK_SPEED,
    element: troopEl,
    position: startPos,
    state: "spawn",
    lastAttack: 0,
  };

  troopEl.style.left = troop.position + "px";
  GAME.troops.push(troop);

  setTimeout(() => {
    if (troop.state === "dead") return;
    troop.state = "walk";
    troopEl.src = data.WALK;
  }, data.SPAWN_TIME);
}

/* =====================================================
   BOT AI & SPAWNER
===================================================== */
function startBotSpawner() {
  setInterval(() => {
    if (!GAME.running) return;

    const troopNames = Object.keys(TROOPS);
    const randomTroop =
      troopNames[Math.floor(Math.random() * troopNames.length)];
    const randomLane = Math.floor(Math.random() * 3);

    // Bot also checks points before spawning
    if (GAME.botPoints >= TROOPS[randomTroop].COST) {
      GAME.botPoints -= TROOPS[randomTroop].COST;
      spawnTroop(randomTroop, randomLane, "enemy");
    }
  }, 2000); // Check every 2 seconds
}

/* =====================================================
   MAIN GAME LOOP
===================================================== */
function gameLoop(timestamp) {
  if (!GAME.running) return;
  updateTroops(timestamp);
  requestAnimationFrame(gameLoop);
}

/* =====================================================
   TROOP UPDATE
===================================================== */
function updateTroops(time) {
  GAME.troops.forEach((troop) => {
    if (troop.state === "spawn" || troop.state === "dead") return;

    const laneWidth = laneElements[troop.lane].offsetWidth;
    const enemy = findEnemyInLane(troop);

    if (enemy) {
      attack(troop, enemy, time);
      return;
    }

    moveTroop(troop);

    if (troop.side === "player" && troop.position > laneWidth - 80) {
      damageCastle("enemy", troop.damage);
      destroyTroop(troop);
    } else if (troop.side === "enemy" && troop.position < 10) {
      damageCastle("player", troop.damage);
      destroyTroop(troop);
    }

    troop.element.style.left = troop.position + "px";
  });
}

/* =====================================================
   MOVEMENT
===================================================== */
function moveTroop(troop) {
  if (troop.state !== "walk") {
    troop.state = "walk";
    troop.element.src = TROOPS[troop.type].WALK;
  }

  if (troop.side === "player") troop.position += troop.speed;
  else troop.position -= troop.speed;
}

/* =====================================================
   COLLISION
===================================================== */
function findEnemyInLane(troop) {
  return GAME.troops.find(
    (other) =>
      other.lane === troop.lane &&
      other.side !== troop.side &&
      other.state !== "dead" &&
      Math.abs(other.position - troop.position) < 55,
  );
}

/* =====================================================
   COMBAT
===================================================== */
function attack(attacker, defender, time) {
  if (time - attacker.lastAttack < attacker.attackSpeed) return;

  attacker.lastAttack = time;
  attacker.state = "attacking";
  attacker.element.src = TROOPS[attacker.type].ATTACK;

  defender.hp -= attacker.damage;

  if (TROOPS[attacker.type].LIFE_STEAL) {
    attacker.hp += attacker.damage * TROOPS[attacker.type].LIFE_STEAL;
  }

  if (defender.hp <= 0) {
    destroyTroop(defender);
    attacker.state = "walk";
  }

  setTimeout(() => {
    if (attacker.state === "attacking") {
      attacker.element.src = TROOPS[attacker.type].WALK;
    }
  }, 500);
}

/* =====================================================
   DESTROY TROOP
===================================================== */
function destroyTroop(troop) {
  if (troop.state === "dead") return;
  troop.state = "dead";
  troop.element.src = TROOPS[troop.type].DIE;

  setTimeout(() => {
    troop.element.remove();
    GAME.troops = GAME.troops.filter((t) => t.id !== troop.id);
  }, TROOPS[troop.type].DIE_TIME);
}

/* =====================================================
   CASTLE DAMAGE & UI UPDATE
===================================================== */
function damageCastle(side, dmg) {
  const isEnemy = side === "enemy";

  if (isEnemy) {
    GAME.enemyCastleHP = Math.max(0, GAME.enemyCastleHP - dmg);
  } else {
    GAME.playerCastleHP = Math.max(0, GAME.playerCastleHP - dmg);
  }

  const castleClass = isEnemy ? ".enemy" : ".player";
  const hpText = document.querySelector(`${castleClass} .castle-hp-text`);
  const hpBarFill = document.querySelector(`${castleClass} .hp-bar-fill`);

  const currentHP = isEnemy ? GAME.enemyCastleHP : GAME.playerCastleHP;
  const percentage = (currentHP / GAME.maxCastleHP) * 100;

  if (hpText) hpText.innerText = Math.floor(currentHP).toLocaleString();
  if (hpBarFill) hpBarFill.style.width = percentage + "%";

  checkGameState();
}

/* =====================================================
   GAME END
===================================================== */
function checkGameState() {
  if (GAME.enemyCastleHP <= 0 && GAME.running) {
    GAME.running = false;
    setTimeout(() => alert("VICTORY!"), 100);
  }

  if (GAME.playerCastleHP <= 0 && GAME.running) {
    GAME.running = false;
    setTimeout(() => alert("DEFEAT!"), 100);
  }
}

/* =====================================================
   UTIL
===================================================== */
function getTroopType(card) {
  if (card.classList.contains("troop-zombie")) return "ZOMBIE";
  if (card.classList.contains("troop-skeleton")) return "SKELETON";
  if (card.classList.contains("troop-golem")) return "GOLEM";
  if (card.classList.contains("troop-vampire")) return "VAMPIRE";
  if (card.classList.contains("troop-machine")) return "MACHINE";
  return null;
}
