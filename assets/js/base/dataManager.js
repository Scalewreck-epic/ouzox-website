import { fetch_user, fetch_alternative_user } from "../user/sessionManager.js";
import { request } from "./apiManager.js";

const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("q") || "";
const categoryName = urlParams.get("n") || "";

let prices = [];
let genres = [];
let allGames = [];

class Genre {
  constructor(genre) {
    this.name = genre.name;
    this.count = genre.count;
  }

  createGenrePage = (name, amount) => {
    const genreButton = document.createElement("a");
    const genreName = document.createElement("div");
    const genreGamesAmount = document.createElement("h4");

    genreButton.setAttribute("class", "genre-button");
    genreName.setAttribute("class", "genre-name");

    genreName.textContent = name;
    genreButton.setAttribute("href", `category?n=${name}`);

    genreGamesAmount.textContent =
      amount != 1 ? `${amount} games` : `${amount} game`;

    genreButton.appendChild(genreName);
    genreButton.appendChild(genreGamesAmount);

    document.getElementById("genres-list").appendChild(genreButton);
  };
}

class Game {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.summary = data.summary;
    this.icon = data.icon;
    this.genre = data.genre;
    this.likes = data.likes;
    this.dislikes = data.dislikes;
  }

  calculateDiffDays = (timestamp) => {
    const currentDate = new Date();

    const createdTimeDiff = Math.abs(currentDate.getTime() - timestamp);
    const createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

    return createdDiffDays;
  };

  createGamePage = (listElement, gamePrice) => {
    const price = gamePrice.price / 100;
    const currency = gamePrice.currency;
    const likeToDislikeRatio =
      (this.likes / (this.likes + this.dislikes)) * 100;

    const gameContainer = document.createElement("div");
    const gameImage = document.createElement("img");
    const gameImageContainer = document.createElement("a");
    const gameTitle = document.createElement("a");
    const gameSummary = document.createElement("div");
    const gamePriceContainer = document.createElement("div");
    const gameRatioContainer = document.createElement("div");
    const gamePriceText = document.createElement("span");
    const gameRatioText = document.createElement("span");

    gameContainer.setAttribute("class", "game");
    gameImage.setAttribute("class", "product-image");
    gameImageContainer.setAttribute("class", "product-image-container");
    gameTitle.setAttribute("class", "product-title");
    gameSummary.setAttribute("class", "product-summary");
    gamePriceContainer.setAttribute("class", "product-price");
    gameRatioContainer.setAttribute("class", "product-ratio");

    gameImage.setAttribute("src", this.icon.url);
    gameImageContainer.setAttribute("href", `game?g=${this.id}`);
    gameTitle.setAttribute("href", `game?g=${this.id}`);

    gameTitle.textContent = this.name;
    gameSummary.textContent = this.summary;

    gamePriceText.innerHTML = `${price} ${currency.toUpperCase()}`;
    gameRatioText.innerHTML = `${likeToDislikeRatio}%`;

    gamePriceContainer.appendChild(gamePriceText);
    gameRatioContainer.appendChild(gameRatioText);

    gameImageContainer.appendChild(gameImage);
    gameImageContainer.appendChild(gamePriceContainer);
    gameImageContainer.appendChild(gameRatioContainer);

    const diffDaysCreated = this.calculateDiffDays(this.created);
    const diffDaysUpdated = this.calculateDiffDays(this.updated);

    if (diffDaysCreated <= 7) {
      createLabel("NEW", diffDaysCreated, gameImageContainer);
    } else if (diffDaysUpdated <= 7) {
      createLabel("UPDATED", diffDaysUpdated, gameImageContainer);
    }

    gameContainer.appendChild(gameImageContainer);
    gameContainer.appendChild(gameTitle);
    gameContainer.appendChild(gameSummary);

    listElement.appendChild(gameContainer);
  };
}

const fetchGamePrice = (gameId) => {
  const result = prices.find((item) => item.product === gameId);
  if (result) {
    return {
      price: result.unit_amount,
      currency: result.currency,
    };
  }

  return {
    price: 0,
    currency: "USD",
  };
};

const createLabel = (labelText, numDays, targetElement) => {
  const label = document.createElement("div");
  label.setAttribute("class", `${labelText.toLowerCase()}-label`);

  const text = document.createElement("span");
  text.innerHTML = labelText;

  label.appendChild(text);
  targetElement.appendChild(label);

  label.addEventListener("mouseenter", function () {
    text.innerHTML = numDays != 1 ? `${numDays} DAYS AGO` : `TODAY`;
  });

  label.addEventListener("mouseleave", function () {
    text.innerHTML = labelText;
  });
};

const displayGames = async (listElement, categoryElement, response) => {
  const categoryNoneElement = categoryElement.querySelector(".category-none");

  if (response.ok == true) {
    const games = response.response.games.items;
    categoryNoneElement.remove();

    if (games.length > 0) {
      games.forEach((gameData) => {
        const game = new Game(gameData);
        const gamePrice = fetchGamePrice(game.id.toString());
        game.createGamePage(listElement, gamePrice);

        if (!allGames[gameData]) {
          allGames.push(gameData);

          if (!genres[game.genre]) {
            genres[game.genre] = {
              name: game.genre,
              count: 1,
            };
          } else {
            genres[game.genre].count++;
          }
        }
      });
    }
  } else {
    categoryNoneElement.textContent = response.response;
  }
};

const displayGenres = async () => {
  if (window.location.pathname.includes("/search")) {
    // Sort genres by relevancy
  } else {
    genres.sort((a, b) => b.count - a.count);
  }

  if (genres.length > 0) {
    const categoryNoneElement = document
      .getElementById("genres")
      .querySelector(".category-none");
    categoryNoneElement.remove();
  }

  genres.forEach((genreData) => {
    const genre = new Genre(genreData);
    genre.createGenrePage(genreData.name, genreData.count);
  });
};

const loadUserGames = async (userId) => {
  const listUserGamesUrl =
    "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/games";
  const gameDownloads = document.getElementById("game-downloads");

  const user = await fetch_alternative_user(userId);

  const developerGameOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      user_name: user.name,
      user_id: user.id,
    }),
  };

  let downloads = 0;

  const userGames = await request(listUserGamesUrl, developerGameOptions, true);

  if (userGames.ok == true) {
    const publicUserGames = userGames.response.games.items.filter((game) => {
      if (game.active == true) {
        downloads += game.downloads;
        return game;
      }
    });

    const displayResponse = { response: publicUserGames, ok: true };

    gameDownloads.textContent = downloads.toString();

    displayGames(
      document.getElementById("user-games"),
      document.getElementById("user-games"),
      displayResponse
    );
  } else {
    displayGames(
      document.getElementById("user-games"),
      document.getElementById("user-games"),
      userGames
    );
  }
};

const loadDashboard = async () => {
  const listUserGamesUrl =
    "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/games";
  const user = await fetch_user();

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const developerGameOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      user_name: user.name,
      user_id: user.id,
    }),
  };

  const userGames = await request(listUserGamesUrl, developerGameOptions, true);

  displayGames(
    document.getElementById("dashboard-market"),
    document.getElementById("dashboard-market"),
    userGames
  );
};

const loadGames = async () => {
  const listGamesUrl =
    "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/list";

  if (window.location.pathname.includes("/search")) {
    const resultsLabel = document.getElementById("results-label");
    // Show the search results
  } else if (window.location.pathname.includes("/category")) {
    const resultsLabel = document.getElementById("results-label");
    // Show the category results
  } else {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const perPage = 30;

    const freshGamesOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "asc",
        sortColumn: "created_at",
        perPage: perPage,
        page: 1,
      }),
    };

    const hotGamesOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "desc",
        sortColumn: "updated",
        perPage: perPage,
        page: 1,
      }),
    };

    const sponsoredOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "desc",
        sortColumn: "sponsor_money",
        perPage: perPage,
        page: 1,
      }),
    };

    const bestsellerOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "desc",
        sortColumn: "downloads",
        perPage: perPage,
        page: 1,
      }),
    };

    const freshGames = await request(listGamesUrl, freshGamesOptions, false);
    const hotGames = await request(listGamesUrl, hotGamesOptions, false);
    // underrated games
    const sponsoredGames = await request(listGamesUrl, sponsoredOptions, false);
    // free and hot
    const bestsellingGames = await request(
      listGamesUrl,
      bestsellerOptions,
      false
    );

    displayGames(
      document.getElementById("fresh-games-list"),
      document.getElementById("fresh-games"),
      freshGames
    );
    displayGames(
      document.getElementById("hot-games-list"),
      document.getElementById("hot-games"),
      hotGames
    );
    displayGames(
      document.getElementById("sponsored-games-list"),
      document.getElementById("sponsored-games"),
      sponsoredGames
    );
    displayGames(
      document.getElementById("bestseller-games-list"),
      document.getElementById("bestseller-games"),
      bestsellingGames
    );
  }
};

const fetchGames = async () => {
  const listPricesUrl = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const priceRequestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const setPrices = async () => {
    const result = await request(listPricesUrl, priceRequestOptions, true);

    if (result) {
      prices = result.response.data;
      prices.sort((a, b) => b.unit_amount - a.unit_amount);
    }
  };

  await setPrices();

  if (window.location.pathname.includes("/dashboard")) {
    await loadDashboard();
  } else if (window.location.pathname.includes("/user")) {
    const userId = urlParams.get("id");
    await loadUserGames(userId);
  } else {
    await loadGames();
  }

  if (genres.length > 0 && document.getElementById("genres-list") != null) {
    displayGenres();
  }
};

const setSearch = () => {
  if (document.getElementById("search-query") != null) {
    const searchLabel = document.getElementById("search-label");
    const searchQueryInput = document.getElementById("search-query");

    searchQueryInput.value = searchQuery;
    if (searchLabel != null) {
      if (searchQuery != null) {
        searchLabel.textContent = `Results for '${searchQuery}'`;
      } else {
        window.location.assign("index");
      }
    }
  }
};

const setCategory = () => {
  if (window.location.pathname.includes("/category")) {
    const searchLabel = document.getElementById("search-label");
    searchLabel.textContent = `Top '${categoryName}' Games`;
  }
};

fetchGames();
setSearch();
setCategory();
