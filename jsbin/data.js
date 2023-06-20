const games_list_api =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E:v1/products";
const games_prices_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";

const update_product_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id

const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id

import { getCookie } from "./exportuser.js";

const urlParams = new URLSearchParams(window.location.search);
const search_query = urlParams.get("q");

const gamesPerCategory = 20;
//let lastGame;

var prices = [];
var games = [];

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
  var createdTimestamp = new Date(timestamp * 1000);
  var currentDate = new Date();

  var createdTimeDiff = Math.abs(
    currentDate.getTime() - createdTimestamp.getTime()
  );
  var createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

  return createdDiffDays;
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
  const gameId = game.id.replace(/^prod_/, "");

  gameLink.setAttribute("href", `game.html?j=${gameId}`);

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
          console.warn("There was an error trying to deactivate product: ", err);
        };
      };

      await deactivate_product();
    });

    gamesDiv.appendChild(deleteButton);
  }

  market.appendChild(gamesDiv);
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
    };
  };
};

function removeGameFromList(game) {
  let index = games.indexOf(game);
  games.splice(index, 1);
};

function removeIrrelevantGames() {
  const similarityThreshold = 0.15;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    if (search_query != null) {
      const game_name = game.name;
      const game_summary = game.metadata.summary;
  
      const title_similarity = calculateSimilarity(search_query, game_name);
      const summary_similarity = calculateSimilarity(search_query, game_summary);
  
      const game_similarity = 0.7 * title_similarity + 0.3 * summary_similarity;
  
      if (game_similarity < similarityThreshold) {
        removeGameFromList(game);
      };
    };
  };
};

async function verifyUser() {
  var data = getCookie("session_id");

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var get_user_options = {
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

    var user = await get_user();
    return user;
  }
}

function loadGamesWithList(list, isDashboard) {
  for (
    let i = 0; i < gamesPerCategory;
    i++
  ) {
    var game = games[i];

    if (game && game.active) {
      var game_price = getGamePrice(game.id.toString());

      if (game_price) {
        createGamePage(game, game_price, isDashboard, list);
      };
    };
  };
};

function loadGames() {
  const newest_games_list = document.getElementById("newest-games-list");
  const updated_games_list = document.getElementById("updated-games-list");
  //const genre_list = document.getElementById("genre-list");

  sortGames("newest");
  loadGamesWithList(newest_games_list, false);

  sortGames("upToDate");
  loadGamesWithList(updated_games_list, false);
};

async function loadDashboard() {
  const market = document.getElementById("market");
  const username = await verifyUser();

  if (username != undefined) {
    sortGames("newest");
    loadGamesWithList(market, false);
  }
}

async function fetchGamesRequest(isDashboard) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
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
      prices.sort((a, b) => (a.unit_amount > b.unit_amount ? 1 : -1));
    } catch (error) {
      console.warn("There was an error trying to set prices: ", err);
    }
  }

  async function fetchData() {
    try {
      const response = await fetch(games_list_api, requestOptions);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      games = result_parse.data;
      removePrivateGames();
      removeIrrelevantGames();

      if (isDashboard) {
        loadDashboard();
      } else {
        loadGames();
      }
    } catch (error) {
      console.warn("There was an error trying to get games: ", err);
    }
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
};
fetchGames(isPathDashboard());
