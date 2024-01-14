const get_product =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");
const priceIdParam = urlParams.get("p");

import { request } from "../../base/apiManager.js";

async function set_game_data(gameId) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: myHeaders,
  };

  async function fetch_game_data() {
    const result = await request(`${get_product}${gameId}`, options, true, "game data");

    if (result.Success) {
      return result.Result;
    } else {
      throw new Error(`Unable to fetch game data: ${result.Result}`);
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
  console.warn("There are no params.");
  window.location.assign(`404?er=${error.response.status ? error.response.status : 500}`);
}
