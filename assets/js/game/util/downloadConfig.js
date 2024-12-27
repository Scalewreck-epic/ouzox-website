const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");
const priceIdParam = urlParams.get("p");

import { request } from "../../base/apiManager.js";
import { endpoints } from "../../other/endpoints.js";

async function set_game_data(gameId) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: myHeaders,
  };

  async function fetch_game_data() {
    const result = await request(
      `${endpoints.game.get_product}${gameId}`,
      options,
      true,
    );

    if (result.ok == true) {
      return result.response;
    }
  }

  const gameData = await fetch_game_data();

  const title = document.getElementById("title");
  const devname = document.getElementById("dev-name");
  const return_button = document.getElementById("game-page");
  const file_name = document.getElementById("file-name");
  const nav_title = document.getElementById("navigation-title");

  title.textContent = `Download: "${gameData.name}"`;
  nav_title.textContent = `Download ${gameData.name}`;
  devname.textContent = `By: ${gameData.metadata.developer_name}`;
  file_name.textContent = `${gameData.metadata.file_name} (${gameData.metadata.size} MB)`;
  return_button.setAttribute("href", `game?g=${priceIdParam}`);
}

if (gameIdParam && priceIdParam) {
  set_game_data(`prod_${gameIdParam}`);
} else {
  window.location.assign("404?code=404");
}
