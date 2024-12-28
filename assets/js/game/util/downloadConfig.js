const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");
const priceIdParam = urlParams.get("p");

import { request } from "../../base/apiManager.js";
import { endpoints } from "../../other/endpoints.js";

async function setGameData(gameId) {
  const response = await request(`${endpoints.game.get_product}${gameId}`, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });

  if (response.ok) {
    const gameData = await response.json();
    const title = document.getElementById("title");
    const devname = document.getElementById("dev-name");
    const returnButton = document.getElementById("game-page");
    const fileName = document.getElementById("file-name");
    const navTitle = document.getElementById("navigation-title");

    title.textContent = `Download: "${gameData.name}"`;
    navTitle.textContent = `Download ${gameData.name}`;
    devname.textContent = `By: ${gameData.metadata.developer_name}`;
    fileName.textContent = `${gameData.metadata.file_name} (${gameData.metadata.size} MB)`;
    returnButton.setAttribute("href", `game?g=${priceIdParam}`);
  } else {
    throw new Error(`Failed to fetch game data: ${response.status}`);
  }
}

if (gameIdParam && priceIdParam) {
  setGameData(`prod_${gameIdParam}`);
} else {
  window.location.assign("404?code=404");
}