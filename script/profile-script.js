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

document.addEventListener("DOMContentLoaded", () => {
  const avatarContainer = document.querySelector(".avatars");
  const nameInput = document.getElementById("name");
  const previewName = document.querySelector(".preview-name");
  const avatarCircle = document.querySelector(".avatar-circle");
  const navBtns = document.querySelectorAll(".nav-btn");
  const randomBtn = document.querySelector(".random-btn");
  const saveBtn = document.querySelector(".save-btn");

  saveBtn.addEventListener("click", () => {
    const finalName = nameInput.value.trim();

    if (!finalName) {
      alert("Please enter a name for your warrior!");
      return;
    }

    const activeBox = avatarContainer.children[1];
    const activeImg = activeBox.querySelector("img").src;

    const profile = {
      name: finalName,
      avatar: activeImg,
      coins: 1000,
      createdAt: new Date().toLocaleString(),
    };

    // Save to LocalStorage
    localStorage.setItem("data", JSON.stringify(profile));

    window.location.href = "./landing.html";
    console.log("Saved Data:", profile);
  });

  //random profile name and avatar
  randomBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    const selectedName = randomNames[randomIndex];

    nameInput.value = selectedName;
    previewName.textContent = selectedName;

    // Spin effect
    const spins = Math.floor(Math.random() * 10) + 5;
    let count = 0;

    const spinInterval = setInterval(() => {
      moveNext();
      count++;
      if (count >= spins) clearInterval(spinInterval);
    }, 100);
  });

  function initAvatars() {
    avatarContainer.innerHTML = "";
    avatarData.forEach((data) => {
      const div = document.createElement("div");
      div.className = "avatar-box";
      div.innerHTML = `<img src="${data.url}" alt="${data.name}" data-id="${data.id}">`;
      avatarContainer.appendChild(div);
    });
    updateCarousel();
  }

  function updateCarousel() {
    const boxes = avatarContainer.children;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      box.classList.remove("large", "small");

      if (i === 1) {
        box.classList.add("large");
        const activeImg = box.querySelector("img").src;
        avatarCircle.innerHTML = `<img src="${activeImg}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      } else {
        box.classList.add("small");
      }

      box.style.display = i < 3 ? "flex" : "none";
    }
  }

  const moveNext = () => {
    avatarContainer.appendChild(avatarContainer.firstElementChild);
    updateCarousel();
  };

  const movePrev = () => {
    avatarContainer.insertBefore(
      avatarContainer.lastElementChild,
      avatarContainer.firstElementChild,
    );
    updateCarousel();
  };

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
