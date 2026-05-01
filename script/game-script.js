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

const GAME = {
  lanes: [],
  troops: [],
  playerCastleHP: 2000,
  enemyCastleHP: 2000,
  maxCastleHP: 2000,
  playerPoints: 100,
  botPoints: 100,
  running: true,
  idCounter: 0,
};

const laneElements = document.querySelectorAll(".lane");
const troopCards = document.querySelectorAll(".troop-card");
const castleHP = document.querySelector(".player .castle-hp-text");
const enemyCastleHP = document.querySelector(".enemy .castle-hp-text");
GAME.lanes = [...laneElements].map(() => ({ player: [], enemy: [] }));

initDragSystem();
startIncomeTimer();
startBotSpawner();
requestAnimationFrame(gameLoop);
let localData = JSON.parse(localStorage.getItem("data"));

//set background image
document.querySelector(".battlefield").style.backgroundImage =
  `url("assets/map/map${localData.defaultMap + 1}.png")`;
castleHP.textContent = GAME.playerCastleHP.toLocaleString();
enemyCastleHP.textContent = GAME.enemyCastleHP.toLocaleString();
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
  troop.container.className = `${troop.type.toLowerCase()} ${troop.side}-troop ${newState}`;
  const hpPercent = Math.max(0, (troop.hp / troop.maxHp) * 100);
  troop.hpBarFill.style.width = hpPercent + "%";
}

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

function spawnTroop(type, laneIndex, side) {
  const data = TROOPS[type];
  const lane = laneElements[laneIndex];

  const container = document.createElement("div");
  container.className = `${type.toLowerCase()} ${side}-troop spawn`;

  const hpContainer = document.createElement("div");
  hpContainer.className = "troop-hp-bar-container";
  const hpFill = document.createElement("div");
  hpFill.className = "troop-hp-bar-fill";
  hpContainer.appendChild(hpFill);

  const img = document.createElement("img");
  img.className = "battle-troop-img";
  if (type === "MACHINE") {
    img.src = data.WALK;
  } else {
    img.src = data.SPAWN;
  }

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
      handleCombat(troop, enemy, null, time);
    } else {
      // Check if troop reached the castle
      const isAtPlayerCastle = troop.side === "enemy" && troop.position < 20;
      const isAtEnemyCastle =
        troop.side === "player" && troop.position > laneWidth - 80;

      if (isAtPlayerCastle || isAtEnemyCastle) {
        handleCombat(troop, null, isAtPlayerCastle ? "player" : "enemy", time);
      } else {
        moveTroop(troop);
      }
    }

    troop.container.style.left = troop.position + "px";
  });
}

function moveTroop(troop) {
  if (troop.state !== "walk") {
    updateTroopVisuals(troop, "walk");
    troop.element.src = TROOPS[troop.type].WALK;
  }
  if (troop.side === "player") troop.position += troop.speed;
  else troop.position -= troop.speed;
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

function handleCombat(attacker, defender, castleSide, time) {
  if (!defender && !castleSide) {
    if (attacker.state !== "walk") {
      updateTroopVisuals(attacker, "walk");
      attacker.element.src = TROOPS[attacker.type].WALK;
    }
    return;
  }

  // Attack Speed Check
  if (time - attacker.lastAttack < attacker.attackSpeed) return;
  attacker.lastAttack = time;

  // Set Animation
  if (attacker.state !== "attacking") {
    updateTroopVisuals(attacker, "attacking");
    attacker.element.src = TROOPS[attacker.type].ATTACK;
  }

  // Apply Damage
  if (defender) {
    defender.hp -= attacker.damage;
    updateTroopVisuals(defender, defender.state);

    if (defender.hp <= 0) {
      destroyTroop(defender);
      updateTroopVisuals(attacker, "walk");
      attacker.element.src = TROOPS[attacker.type].WALK;
    }
  } else if (castleSide) {
    damageCastle(castleSide, attacker.damage);
  }

  // Life Steal
  if (TROOPS[attacker.type].LIFE_STEAL && attacker.hp < attacker.maxHp) {
    attacker.hp = Math.min(
      attacker.maxHp,
      attacker.hp + attacker.damage * TROOPS[attacker.type].LIFE_STEAL,
    );
    updateTroopVisuals(attacker, attacker.state);
  }
}

function destroyTroop(troop) {
  if (troop.state === "dead") return;
  updateTroopVisuals(troop, "dead");
  troop.element.src = TROOPS[troop.type].DIE;

  GAME.troops = GAME.troops.filter((t) => t.id !== troop.id);

  setTimeout(() => {
    troop.container.remove();
  }, TROOPS[troop.type].DIE_TIME);
}

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

  if (hp <= 0)
    endGame(isEnemy ? "VICTORY!" : "DEFEAT!", isEnemy ? true : false);
}

function getTroopType(card) {
  const types = ["zombie", "skeleton", "golem", "vampire", "machine"];
  const found = types.find((t) => card.classList.contains(`troop-${t}`));
  return found ? found.toUpperCase() : null;
}

const resultContent = document.querySelector(".result-content");
const resultOverlay = document.querySelector(".game-result-overlay");
const mainMenuBtn = document.querySelector(".main-menu-btn");
const playAgainBtn = document.querySelector(".play-again-btn");
const coinRewardEl = document.querySelector(".coin-reward");

playAgainBtn.addEventListener("click", () => location.reload());
mainMenuBtn.addEventListener(
  "click",
  () => (window.location.href = "./index.html"),
);

function endGame(msg, isVictory) {
  if (!GAME.running) return;
  GAME.running = false;
  resultOverlay.style.display = "flex";
  resultContent.querySelector("h2").innerText = msg;
  resultContent.querySelector("h2").className = isVictory
    ? "result-title victory"
    : "result-title defeat";
  coinRewardEl.textContent = isVictory ? "+ 🪙1,000" : "+ 🪙500";
  localData.coins += isVictory ? 1000 : 500;
  localStorage.setItem("data", JSON.stringify(localData));
}
