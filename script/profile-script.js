const avatarData = [
  { id: 1, name: "Skeleton", url: "assets/avatar/skeleton_avatar.png" },
  { id: 2, name: "Vampire", url: "assets/avatar/vampire_avatar.png" },
  { id: 3, name: "Golem", url: "assets/avatar/golem_avatar.png" },
  { id: 4, name: "Wizard", url: "assets/avatar/wizard_avatar.png" },
  { id: 5, name: "Knight", url: "assets/avatar/knight_avatar.png" },
];

const randomNames = [
  "IronClad",
  "ShadowStep",
  "StormBringer",
  "BloodMoon",
  "StoneHeart",
  "NightBlade",
];

let currentIndex = 0;
let activeAvatar = avatarData[0].url;

let localData = JSON.parse(localStorage.getItem("data")) || null;

document.addEventListener("DOMContentLoaded", () => {
  const avatarContainer = document.querySelector(".avatars");
  const nameInput = document.getElementById("name");
  const previewName = document.querySelector(".preview-name");
  const avatarCircle = document.querySelector(".avatar-circle");

  const navBtns = document.querySelectorAll(".nav-btn");
  const randomBtn = document.querySelector(".random-btn");
  const saveBtn = document.querySelector(".save-btn");

  if (localData) {
    nameInput.value = localData.name;
    previewName.textContent = localData.name;

    activeAvatar = localData.avatar;

    // set currentIndex based on saved avatar
    const foundIndex = avatarData.findIndex((a) => a.url === localData.avatar);
    if (foundIndex !== -1) currentIndex = foundIndex;

    avatarCircle.innerHTML = `
      <img src="${localData.avatar}"
      style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
    `;
  }

  saveBtn.addEventListener("click", () => {
    const profileName = nameInput.value.trim();

    if (!profileName) {
      alert("Please enter a name for your warrior!");
      return;
    }

    let data = JSON.parse(localStorage.getItem("data"));

    if (data) {
      data.name = profileName;
      data.avatar = activeAvatar;
    } else {
      data = {
        name: profileName,
        avatar: activeAvatar,
        coins: 1000,
        defaultMap: 0,
        ownedMap: [0],
        createdAt: new Date().toLocaleString(),
      };
    }

    localStorage.setItem("data", JSON.stringify(data));

    console.log("Saved Data:", data);

    window.location.href = "./index.html";
  });

  randomBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    const selectedName = randomNames[randomIndex];

    nameInput.value = selectedName;
    previewName.textContent = selectedName;

    const spins = Math.floor(Math.random() * 8) + 5;
    let count = 0;

    const spinInterval = setInterval(() => {
      moveNext();
      count++;
      if (count >= spins) clearInterval(spinInterval);
    }, 100);
  });

  function initAvatars() {
    avatarContainer.innerHTML = `
      <div class="avatar-box"></div>
      <div class="avatar-box"></div>
      <div class="avatar-box"></div>
    `;

    updateCarousel();
  }

  function updateCarousel() {
    const boxes = avatarContainer.children;

    const getIndex = (offset) =>
      (currentIndex + offset + avatarData.length) % avatarData.length;

    const left = avatarData[getIndex(-1)];
    const center = avatarData[getIndex(0)];
    const right = avatarData[getIndex(1)];

    const visible = [left, center, right];

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const avatar = visible[i];

      box.classList.remove("large", "small");

      box.innerHTML = `<img src="${avatar.url}">`;

      if (i === 1) {
        box.classList.add("large");

        activeAvatar = avatar.url;

        avatarCircle.innerHTML = `
          <img src="${avatar.url}"
          style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
        `;
      } else {
        box.classList.add("small");
      }
    }
  }

  function moveNext() {
    currentIndex = (currentIndex + 1) % avatarData.length;
    updateCarousel();
  }

  function movePrev() {
    currentIndex = (currentIndex - 1 + avatarData.length) % avatarData.length;
    updateCarousel();
  }

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.textContent.trim() === "<" ? movePrev() : moveNext();
    });
  });

  nameInput.addEventListener("input", (e) => {
    previewName.textContent = e.target.value.trim() || "Name";
  });

  initAvatars();
});
