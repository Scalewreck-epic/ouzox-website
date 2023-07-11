const games_list_api =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E:v1/products";
const games_prices_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";
const genre_list_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/genres";
const update_product_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id

const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id

import { getCookie } from "./exportuser.js";

const urlParams = new URLSearchParams(window.location.search);
const search_query = urlParams.get("q");

const gamesPerCategory = 20;
//let lastGame;

let prices = [];
let games = [];
let genres = [];

function getGamePrice(game_id) {
  const result = prices.find((item) => item.product === game_id);
  if (result) {
    return {
      price: result.unit_amount,
      currency: result.currency,
      id: result.id,
    };
  }
}

function calculateDiffDays(timestamp) {
  const createdTimestamp = new Date(timestamp * 1000);
  const currentDate = new Date();

  const createdTimeDiff = Math.abs(
    currentDate.getTime() - createdTimestamp.getTime()
  );
  const createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

  return createdDiffDays;
}

function createGenrePage(name, amount) {
  const genre_button = document.createElement("button");
  genre_button.className = "genre-button";

  const genre_name = document.createElement("h2");
  const genre_games_amount = document.createElement("h4");

  genre_name.innerHTML = name;
  genre_games_amount.innerHTML = amount + " games";

  genre_button.appendChild(genre_name);
  genre_button.appendChild(genre_games_amount);

  document.getElementById("genres").appendChild(genre_button);
}

function createGamePage(game, game_price, editable, market) {
  const price = game_price.price / 100;
  const currency = game_price.currency;

  const gamesDiv = document.createElement("div");
  gamesDiv.className = "game";

  const gameImage = document.createElement("img");
  gameImage.className = "product-image";
  gameImage.setAttribute("src", game.images[0]);

  const gameLink = document.createElement("a");

  const priceId = game_price.id.replace(/^price_/, "");

  gameLink.setAttribute("href", `game.html?g=${priceId}`);

  const gameTitle = document.createElement("div");
  gameTitle.className = "product-title";
  gameTitle.innerHTML = game.name;

  const gameSummary = document.createElement("div");
  gameSummary.className = "product-summary";
  gameSummary.innerHTML = game.metadata.summary;

  const gamePrice = document.createElement("div");
  gamePrice.className = "product-price";
  gamePrice.innerHTML = price + " " + currency.toUpperCase();

  const diffDaysCreated = calculateDiffDays(game.created);
  const diffDaysUpdated = calculateDiffDays(game.updated);

  if (diffDaysCreated <= 7) {
    const createdLabel = document.createElement("span");
    createdLabel.className = "new-label";
    createdLabel.innerHTML = "NEW";
    createdLabel.setAttribute("data-days", diffDaysCreated);
    gamesDiv.appendChild(createdLabel);

    createdLabel.addEventListener("mouseenter", function () {
      if (diffDaysUpdated > 1) {
        createdLabel.innerHTML = `${diffDaysCreated} DAYS AGO`;
      } else if (diffDaysUpdated == 1) {
        createdLabel.innerHTML = `1 DAY AGO`;
      } else {
        createdLabel.innerHTML = "TODAY";
      }
    });

    createdLabel.addEventListener("mouseleave", function () {
      createdLabel.innerHTML = "NEW";
    });
  } else if (diffDaysUpdated <= 7) {
    const updatedLabel = document.createElement("span");
    updatedLabel.className = "updated-label";
    updatedLabel.innerHTML = "UPDATED";
    updatedLabel.setAttribute("data-days", diffDaysUpdated);
    gamesDiv.appendChild(updatedLabel);

    updatedLabel.addEventListener("mouseenter", function () {
      if (diffDaysUpdated > 1) {
        updatedLabel.innerHTML = `${diffDaysUpdated} DAYS AGO`;
      } else if (diffDaysUpdated == 1) {
        updatedLabel.innerHTML = `1 DAY AGO`;
      } else {
        updatedLabel.innerHTML = "TODAY";
      }
    });

    updatedLabel.addEventListener("mouseleave", function () {
      updatedLabel.innerHTML = "UPDATED";
    });
  }

  gameLink.appendChild(gameImage);
  gameLink.appendChild(gameTitle);
  gamesDiv.appendChild(gameLink);
  gamesDiv.appendChild(gameSummary);
  gamesDiv.appendChild(gamePrice);

  if (editable) {
    gameTitle.contentEditable = true;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "DELETE";

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    deleteButton.addEventListener("click", async function () {
      const deactivate_product_options = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
        body: JSON.stringify({
          product: {
            active: "false",
          },
          id: game.id,
        }),
      };

      async function deactivate_product() {
        try {
          const response = await fetch(
            update_product_url + game.id,
            deactivate_product_options
          );
          await response.text();
          gamesDiv.remove();
        } catch (error) {
          console.warn(
            "There was an error trying to deactivate product: ",
            err
          );
        }
      }

      await deactivate_product();
      await update_genre();
    });

    gamesDiv.appendChild(deleteButton);
  }

  market.appendChild(gamesDiv);
}

function levenshteinDistance(a, b) {
  const dp = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const indicator = a[i - 1] == b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + indicator
      );
    }
  }

  return dp[a.length][b.length];
}

function calculateSimilarity(a, b) {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

function removePrivateGames() {
  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    if (game.active) {
      continue;
    } else {
      let index = games.indexOf(game);
      games.splice(index, 1);
    }
  }
}

function removeIrrelevantGames() {
  const similarityThreshold = 0.15;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    if (search_query != null) {
      const game_name = game.name;
      const game_summary = game.metadata.summary;

      const title_similarity = calculateSimilarity(search_query, game_name);
      const summary_similarity = calculateSimilarity(
        search_query,
        game_summary
      );

      const game_similarity = 0.7 * title_similarity + 0.3 * summary_similarity;

      if (game_similarity < similarityThreshold) {
        let index = games.indexOf(game);
        games.splice(index, 1);
      }
    }
  }
}

async function verifyUser() {
  const data = getCookie("session_id");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const get_user_options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  if (data.Valid) {
    async function get_user() {
      try {
        const response = await fetch(
          get_user_url + data.Data,
          get_user_options
        );
        const result = await response.text();
        const result_parse = JSON.parse(result);
        return result_parse;
      } catch (error) {
        console.warn("There was an error trying to get user: ", err);
      }
    }

    const user = await get_user();
    return user;
  }
}

function loadGamesWithList(list, isDashboard, category) {
  let gamesInList = 0;
  for (let i = 0; i < gamesPerCategory; i++) {
    const game = games[i];

    if (game && game.active) {
      const game_price = getGamePrice(game.id.toString());

      if (game_price) {
        createGamePage(game, game_price, isDashboard, list);
        gamesInList += 1;
      }
    }
  }

  if (gamesInList > 0) {
    const categoryNoneElement = category.querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
  }
}

function sortGames(gameSortType) {
  if (gameSortType == "newest") {
    games.sort((a, b) => (a.created > b.created ? -1 : 1));
  } else if (gameSortType == "upToDate") {
    games.sort((a, b) => (a.updated > b.updated ? -1 : 1));
  } else if (gameSortType == "price") {
    games.sort((a, b) =>
      getGamePrice(a.id.toString()).price / 100 >
      getGamePrice(b.id.toString()).price / 100
        ? -1
        : 1
    );
  }
}

function loadGenres() {
  let genresOnList = 0;

  for (let i = 0; i < 5; i++) {
    const genre = genres[i];

    if (genre && genre.games_with_genre > 0) {
      createGenrePage(genre.genre_name, genre.games_with_genre);
      genresOnList += 1;
    }
  }

  if (genresOnList > 0) {
    const categoryNoneElement = document
      .getElementById("genres")
      .querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
  }
}

function loadGames() {
  sortGames("newest");
  loadGamesWithList(
    document.getElementById("newest-games-list"),
    false,
    document.getElementById("new-games")
  );

  sortGames("upToDate");
  loadGamesWithList(
    document.getElementById("updated-games-list"),
    false,
    document.getElementById("fresh-games")
  );
}

async function loadDashboard() {
  const category = document.getElementById("dashboard-market")
  const user = await verifyUser();

  if (user != undefined) {
    sortGames("newest");

    let gamesInList = 0;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      if (game && game.active) {
        const game_price = getGamePrice(game.id.toString());

        if (game_price && game.metadata.developer_name == user.name) {
          createGamePage(game, game_price, true, category);
          gamesInList += 1;
        }
      }
    }

    if (gamesInList > 0) {
      const categoryNoneElement = category.querySelector(".category-none");

      if (categoryNoneElement) {
        categoryNoneElement.remove();
      }
    }
  }
}

async function fetchGamesRequest(isDashboard) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestGamesOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    params: JSON.stringify({
      limit: 10000,
      active: "true",
    }),
  };

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  async function setPrices() {
    try {
      const response = await fetch(games_prices_url, requestOptions);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      prices = result_parse.data;

      if (prices.length > 0) {
        prices.sort((a, b) => (a.unit_amount > b.unit_amount ? 1 : -1));
      }
    } catch (error) {
      console.warn("There was an error trying to set prices: ", error);
    }
  }

  async function setGenres() {
    try {
      const response = await fetch(genre_list_url, requestOptions);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      genres = result_parse;

      if (genres.length > 0) {
        genres.sort((a, b) =>
          a.games_with_genre > b.games_with_genre ? 1 : -1
        );
        loadGenres();
      }
    } catch (error) {
      console.warn("There was an error trying to set genres: ", error);
    }
  }

  async function fetchData() {
    try {
      const response = await fetch(games_list_api, requestGamesOptions);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      games = result_parse.data;

      if (games.length > 0) {
        removePrivateGames();
        removeIrrelevantGames();

        if (isDashboard) {
          loadDashboard();
        } else {
          loadGames();
        }
      }
    } catch (error) {
      console.warn("There was an error trying to get games: ", error);
    }
  }

  if (!isDashboard) {
    await setGenres();
  }

  await setPrices();
  await fetchData();
}

async function fetchGames(isDashboard) {
  prices = [];
  fetchGamesRequest(isDashboard);
}

function isPathDashboard() {
  if (window.location.pathname.includes("/dashboard.html")) {
    return true;
  }

  return false;
}

if (!isPathDashboard()) {
  document.getElementById("search-query").value = search_query;
}
fetchGames(isPathDashboard());
