//validate localstorage profile data
let localData = JSON.parse(localStorage.getItem("data"));
!localData && (window.location.href = "./profile.html");

let currencyEl = document.querySelector(".currency-box p");
if (localData && localData.coins) {
  currencyEl.textContent = `🪙 ${localData.coins.toLocaleString()}`;
}
