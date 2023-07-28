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
const category_name = urlParams.get("n");

let gamesPerCategory = 20;
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
  const genre_button = document.createElement("a");
  genre_button.className = "genre-button";

  const genre_name = document.createElement("div");
  const genre_games_amount = document.createElement("h4");

  genre_name.textContent = name;
  genre_name.className = "genre-name";
  genre_button.setAttribute("href", `category?n=${name}`);

  genre_games_amount.textContent = amount > 1 ? `${amount} games` : `${amount} game`

  genre_button.appendChild(genre_name);
  genre_button.appendChild(genre_games_amount);

  document.getElementById("genres-list").appendChild(genre_button);
}

function createGamePage(game, game_price, market) {
  const price = game_price.price / 100;
  const currency = game_price.currency;

  const gamesDiv = document.createElement("div");
  gamesDiv.className = "game";

  const gameImage = document.createElement("img");
  gameImage.className = "product-image";
  gameImage.setAttribute("src", game.images[0]);

  const gameLink = document.createElement("a");
  gameLink.className = "link-container";

  const gameImageContainer = document.createElement("div");
  gameImageContainer.className = "product-image-container";

  const priceId = game_price.id.replace(/^price_/, "");

  gameLink.setAttribute("href", `game?g=${priceId}`);

  const gameTitle = document.createElement("div");
  gameTitle.className = "product-title";
  gameTitle.textContent = game.name;

  const gameSummary = document.createElement("div");
  gameSummary.className = "product-summary";
  gameSummary.textContent = game.metadata.summary;

  const gamePrice = document.createElement("div");
  gamePrice.className = "product-price";

  const gamePriceText = document.createElement("span");
  gamePriceText.innerHTML = `${price} ${currency.toUpperCase()}`;

  const diffDaysCreated = calculateDiffDays(game.created);
  const diffDaysUpdated = calculateDiffDays(game.updated);

  gamePrice.appendChild(gamePriceText);

  gameImageContainer.appendChild(gameImage);
  gameImageContainer.appendChild(gamePrice);

  if (diffDaysCreated <= 7) {
    const createdLabel = document.createElement("div");
    createdLabel.className = "new-label";

    const createdText = document.createElement("span");
    createdText.innerHTML = "NEW";

    createdLabel.appendChild(createdText);
    gameImageContainer.appendChild(createdLabel);

    createdLabel.addEventListener("mouseenter", function () {
      if (diffDaysUpdated > 1) {
        createdText.innerHTML = `${diffDaysCreated} DAYS AGO`;
      } else if (diffDaysUpdated == 1) {
        createdText.innerHTML = `1 DAY AGO`;
      } else {
        createdText.innerHTML = "TODAY";
      }
    });

    createdLabel.addEventListener("mouseleave", function () {
      createdText.innerHTML = "NEW";
    });
  } else if (diffDaysUpdated <= 7) {
    const updatedLabel = document.createElement("div");
    updatedLabel.className = "updated-label";

    const updatedText = document.createElement("span");
    updatedText.innerHTML = "UPDATED";

    updatedLabel.appendChild(updatedText);
    gameImageContainer.appendChild(updatedLabel);

    updatedLabel.addEventListener("mouseenter", function () {
      if (diffDaysUpdated > 1) {
        updatedText.innerHTML = `${diffDaysUpdated} DAYS AGO`;
      } else if (diffDaysUpdated == 1) {
        updatedText.innerHTML = `1 DAY AGO`;
      } else {
        updatedText.innerHTML = "TODAY";
      }
    });

    updatedLabel.addEventListener("mouseleave", function () {
      updatedText.innerHTML = "UPDATED";
    });
  }
  gameLink.appendChild(gameImageContainer);
  gameLink.appendChild(gameTitle);
  gamesDiv.appendChild(gameLink);
  gamesDiv.appendChild(gameSummary);

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

  if (category_name != null) {
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const game_genre = game.metadata.genre;
  
      if (game_genre == category_name) {
        continue;
      } else {
        let index = games.indexOf(game);
        games.splice(index, 1);
      }
    }
  }

  if (search_query != null) {
    for (let i = 0; i < genres.length; i++) {
      const genre = genres[i];

      if (search_query != null) {
        const genre_name = genre.genre_name;
        const genre_similarity = calculateSimilarity(search_query, genre_name);

        if (genre_similarity < similarityThreshold) {
          let index = genres.indexOf(genre);
          genres.splice(index, 1);
        } else {
          genres.relevance = genre_similarity;
        }
      }
    }

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
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
      } else {
        games.relevance = game_similarity;
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
        console.error("There was an error trying to get user: ", err);
      }
    }

    const user = await get_user();
    return user;
  }
}

function loadGamesWithList(list, category) {
  let gamesInList = 0;
  for (let i = 0; i < gamesPerCategory; i++) {
    const game = games[i];

    if (game && game.active) {
      const game_price = getGamePrice(game.id.toString());

      if (game_price) {
        createGamePage(game, game_price, list);
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

function sortList(gameSortType, list) {
  if (gameSortType == "newest") {
    list.sort((a, b) => (a.created > b.created ? -1 : 1));
  } else if (gameSortType == "upToDate") {
    list.sort((a, b) => (a.updated > b.updated ? -1 : 1));
  } else if (gameSortType == "relevance") {
    list.sort((a, b) => (a.relevance > b.relevance ? -1 : 1));
  } else if (gameSortType == "price") {
    list.sort((a, b) =>
      getGamePrice(a.id.toString()).price > getGamePrice(b.id.toString()).price
        ? -1
        : 1
    );
  }
}

function loadGenres() {
  let genresOnList = 0;

  if (window.location.pathname.includes("/category")) {
    sortList("relevance", genres);
  } else {
    genres.sort((a, b) =>
      a.games_with_genre > b.games_with_genre ? 1 : -1
    );
  }

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
  if (
    window.location.pathname.includes("/search") ||
    window.location.pathname.includes("/category")
  ) {
    sortList("relevance", games);
    loadGamesWithList(
      document.getElementById("relevant-games-list"),
      document.getElementById("relevant-games")
    );
  } else {
    sortList("newest", games);
    loadGamesWithList(
      document.getElementById("newest-games-list"),
      document.getElementById("new-games")
    );

    sortList("upToDate", games);
    loadGamesWithList(
      document.getElementById("updated-games-list"),
      document.getElementById("fresh-games")
    );
  }
}

async function loadDashboard() {
  const category = document.getElementById("dashboard-market");
  const user = await verifyUser();

  if (user != undefined) {
    sortList("newest", games);

    let gamesInList = 0;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      if (game) {
        const game_price = getGamePrice(game.id.toString());

        if (game_price && game.metadata.developer_name == user.name) {
          createGamePage(game, game_price, category);
          gamesInList += 1;
        }
      }
    }

    if (gamesInList > 0) {
      const categoryNoneElement = category.querySelector(".category-none");

      if (categoryNoneElement) {
        categoryNoneElement.remove();
      }
    } else {
      console.info("User has no available games remaining.");
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
      console.error("There was an error trying to set prices: ", error);
    }
  }

  async function setGenres() {
    try {
      const response = await fetch(genre_list_url, requestOptions);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      genres = result_parse;

      if (genres.length > 0) {
        loadGenres();
      }
    } catch (error) {
      console.error("There was an error trying to set genres: ", error);
    }
  }

  async function fetchData() {
    try {
      const response = await fetch(games_list_api, requestGamesOptions);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      games = result_parse.data;

      if (games.length > 0) {
        removeIrrelevantGames();

        if (isDashboard) {
          loadDashboard();
        } else {
          removePrivateGames();
          loadGames();
        }
      }
    } catch (error) {
      console.error("There was an error trying to get games: ", error);
    }
  }

  await setPrices();
  await fetchData();

  if (document.getElementById("genres-list") != null) {
    await setGenres();
  }
}

async function fetchGames(isDashboard) {
  prices = [];
  fetchGamesRequest(isDashboard);
}

function isPathDashboard() {
  if (window.location.pathname.includes("/dashboard")) {
    return true;
  }

  return false;
}

if (document.getElementById("search-query") != null) {
  const search_label = document.getElementById("search-label");
  const search_query2 = document.getElementById("search-query");

  search_query2.value = search_query;
  if (search_label != null) {
    if (search_query != null) {
      search_label.textContent = `Top search results for '${search_query}'`;
    } else {
      window.location.assign("index");
    }
  }
}

if (window.location.pathname.includes("/category")) {
  if (category_name != null) {
    const search_label = document.getElementById("search-label");
    search_label.textContent = `Top '${category_name}' Games`;
  } else {
    window.location.assign("index");
  }
}

fetchGames(isPathDashboard());
