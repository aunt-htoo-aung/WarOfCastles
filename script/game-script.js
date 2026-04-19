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
  playerCastleHP: 20,
  enemyCastleHP: 20,
  maxCastleHP: 20000,
  playerPoints: 100,
  botPoints: 100,
  running: true,
  idCounter: 0,
};

/* ---------------- INIT ---------------- */
const laneElements = document.querySelectorAll(".lane");
const troopCards = document.querySelectorAll(".troop-card");

GAME.lanes = [...laneElements].map(() => ({ player: [], enemy: [] }));

initDragSystem();
startIncomeTimer();
startBotSpawner();
requestAnimationFrame(gameLoop);

/* =====================================================
   CORE SYSTEMS (INCOME & UI)
===================================================== */
function startIncomeTimer() {
  setInterval(() => {
    if (!GAME.running) return;
    GAME.playerPoints += 10;
    GAME.botPoints += 10;
    updateGlobalUI();
  }, 1000);
}

function updateGlobalUI() {
  const pointDisplay = document.querySelector(".points-value");
  if (pointDisplay) pointDisplay.innerText = Math.floor(GAME.playerPoints);

  troopCards.forEach((card) => {
    const type = getTroopType(card);
    if (TROOPS[type].COST > GAME.playerPoints) card.classList.add("disabled");
    else card.classList.remove("disabled");
  });
}

function updateTroopVisuals(troop, newState) {
  troop.state = newState;
  // Dynamic class name: e.g., "zombie player-troop attack"
  troop.container.className = `${troop.type.toLowerCase()} ${troop.side}-troop ${newState}`;

  // Update Health Bar Width
  const hpPercent = Math.max(0, (troop.hp / troop.maxHp) * 100);
  troop.hpBarFill.style.width = hpPercent + "%";
}

/* =====================================================
   DRAG & DROP
===================================================== */
function initDragSystem() {
  troopCards.forEach((card) => {
    const img = card.querySelector("img");
    const troopType = getTroopType(card);
    img.draggable = true;
    img.addEventListener("dragstart", (e) =>
      e.dataTransfer.setData("troopType", troopType),
    );
  });

  laneElements.forEach((lane, laneIndex) => {
    lane.addEventListener("dragover", (e) => e.preventDefault());
    lane.addEventListener("drop", (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("troopType");
      if (type && GAME.playerPoints >= TROOPS[type].COST) {
        GAME.playerPoints -= TROOPS[type].COST;
        updateGlobalUI();
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

  // Container
  const container = document.createElement("div");
  container.className = `${type.toLowerCase()} ${side}-troop spawn`;

  // Health Bar
  const hpContainer = document.createElement("div");
  hpContainer.className = "troop-hp-bar-container";
  const hpFill = document.createElement("div");
  hpFill.className = "troop-hp-bar-fill";
  hpContainer.appendChild(hpFill);

  // Image
  const img = document.createElement("img");
  img.className = "battle-troop-img";
  img.src = data.SPAWN;

  container.appendChild(hpContainer);
  container.appendChild(img);
  lane.appendChild(container);

  const startPos = side === "player" ? 10 : lane.offsetWidth - 70;

  const troop = {
    id: GAME.idCounter++,
    type,
    lane: laneIndex,
    side,
    maxHp: data.HP,
    hp: data.HP,
    damage: data.DAMAGE,
    speed: data.MOVEMENT / 100,
    attackSpeed: data.ATTACK_SPEED,
    container: container,
    element: img,
    hpBarFill: hpFill,
    position: startPos,
    state: "spawn",
    lastAttack: 0,
  };

  container.style.left = startPos + "px";
  GAME.troops.push(troop);

  setTimeout(() => {
    if (troop.state === "dead") return;
    img.src = data.WALK;
    updateTroopVisuals(troop, "walk");
  }, data.SPAWN_TIME);
}

/* =====================================================
   BOT AI
===================================================== */
function startBotSpawner() {
  setInterval(() => {
    if (!GAME.running) return;
    const types = Object.keys(TROOPS);
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);

    if (GAME.botPoints >= TROOPS[type].COST) {
      GAME.botPoints -= TROOPS[type].COST;
      spawnTroop(type, lane, "enemy");
    }
  }, 3500);
}

/* =====================================================
   GAME LOOP & LOGIC
===================================================== */
function gameLoop(timestamp) {
  if (!GAME.running) return;
  updateTroops(timestamp);
  requestAnimationFrame(gameLoop);
}

function updateTroops(time) {
  GAME.troops.forEach((troop) => {
    if (troop.state === "spawn" || troop.state === "dead") return;

    const laneWidth = laneElements[troop.lane].offsetWidth;
    const enemy = findEnemy(troop);

    if (enemy) {
      handleCombat(troop, enemy, time);
    } else {
      moveTroop(troop, laneWidth);
    }

    troop.container.style.left = troop.position + "px";
  });
}

function moveTroop(troop, laneWidth) {
  if (troop.state !== "walk") {
    updateTroopVisuals(troop, "walk");
    troop.element.src = TROOPS[troop.type].WALK;
  }

  if (troop.side === "player") troop.position += troop.speed;
  else troop.position -= troop.speed;

  // Castle Collision
  if (troop.side === "player" && troop.position > laneWidth - 80) {
    damageCastle("enemy", troop.damage);
    destroyTroop(troop);
  } else if (troop.side === "enemy" && troop.position < 10) {
    damageCastle("player", troop.damage);
    destroyTroop(troop);
  }
}

function findEnemy(troop) {
  return GAME.troops.find(
    (t) =>
      t.lane === troop.lane &&
      t.side !== troop.side &&
      t.state !== "dead" &&
      Math.abs(t.position - troop.position) < 55,
  );
}

/* --- Updated Combat: Force state reset if enemy is gone --- */
function handleCombat(attacker, defender, time) {
  // 1. If the defender is already dead/removed, reset attacker immediately
  if (!defender || defender.hp <= 0 || defender.state === "dead") {
    if (attacker.state !== "walk") {
      updateTroopVisuals(attacker, "walk");
      attacker.element.src = TROOPS[attacker.type].WALK;
    }
    return;
  }

  // 2. Attack timing logic
  if (time - attacker.lastAttack < attacker.attackSpeed) return;

  attacker.lastAttack = time;

  // 3. Set Attacking State
  if (attacker.state !== "attacking") {
    updateTroopVisuals(attacker, "attacking");
    attacker.element.src = TROOPS[attacker.type].ATTACK;
  }

  // 4. Apply Damage
  defender.hp -= attacker.damage;
  updateTroopVisuals(defender, defender.state);

  // 5. Life Steal Logic
  if (TROOPS[attacker.type].LIFE_STEAL) {
    attacker.hp = Math.min(
      attacker.maxHp,
      attacker.hp + attacker.damage * TROOPS[attacker.type].LIFE_STEAL,
    );
    updateTroopVisuals(attacker, attacker.state);
  }

  // 6. Check if defender died from this hit
  if (defender.hp <= 0) {
    destroyTroop(defender);

    // CRITICAL: Immediately tell the attacker to move again
    updateTroopVisuals(attacker, "walk");
    attacker.element.src = TROOPS[attacker.type].WALK;
  }
}

/* --- Updated Destroy: Ensure clean removal --- */
function destroyTroop(troop) {
  if (troop.state === "dead") return;

  updateTroopVisuals(troop, "dead");
  troop.element.src = TROOPS[troop.type].DIE;

  // Clear the container from the game logic array immediately
  // so other troops stop "seeing" it as a target
  setTimeout(() => {
    troop.container.remove();
    GAME.troops = GAME.troops.filter((t) => t.id !== troop.id);
  }, TROOPS[troop.type].DIE_TIME);
}

/* =====================================================
   CASTLE & GAME OVER
===================================================== */
function damageCastle(side, dmg) {
  const isEnemy = side === "enemy";
  if (isEnemy) GAME.enemyCastleHP = Math.max(0, GAME.enemyCastleHP - dmg);
  else GAME.playerCastleHP = Math.max(0, GAME.playerCastleHP - dmg);

  const root = isEnemy ? ".enemy" : ".player";
  const text = document.querySelector(`${root} .castle-hp-text`);
  const bar = document.querySelector(`${root} .hp-bar-fill`);
  const hp = isEnemy ? GAME.enemyCastleHP : GAME.playerCastleHP;

  if (text) text.innerText = Math.floor(hp).toLocaleString();
  if (bar) bar.style.width = (hp / GAME.maxCastleHP) * 100 + "%";

  if (hp <= 0) endGame(isEnemy ? "VICTORY!" : "DEFEAT!");
}

function endGame(msg) {
  if (!GAME.running) return;
  GAME.running = false;
  setTimeout(() => alert(msg), 200);
}

function getTroopType(card) {
  const types = ["zombie", "skeleton", "golem", "vampire", "machine"];
  const found = types.find((t) => card.classList.contains(`troop-${t}`));
  return found ? found.toUpperCase() : null;
}
