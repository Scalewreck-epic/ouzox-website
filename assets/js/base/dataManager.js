import { fetch_user, fetch_alternative_user } from "../user/sessionManager.js";
import { request } from "./apiManager.js";
import { endpoints } from "../other/endpoints.js";

const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("q") || "";
const categoryName = urlParams.get("n") || "";

let prices = [];
let genres = [];
let allGames = [];

const user = await fetch_user();

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

  return result ? {price: result.unit_amount, currency: result.currency} : {price: 0, currency: "USD"};
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

export const displayErrorForGames = async (categoryElement, response) => {
  const categoryNoneElement = categoryElement.querySelector(".category-none");
  categoryNoneElement.textContent = response;
}

export const displayGames = async (listElement, categoryElement, games) => {
  const categoryNoneElement = categoryElement.querySelector(".category-none");
  
  if (games.length > 0) {
    categoryNoneElement.remove();

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

export const loadUserGames = async (newUser) => {
  const gameDownloads = document.getElementById("game-downloads");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  let downloads = 0;

  const userGamesRequest = await request(`${endpoints.user.list_public_games}${newUser.id}`, developerGameOptions, false);
  userGamesRequest.ok ? displayGames(document.getElementById("user-games"), document.getElementById("user-games"), userGamesRequest.response) : displayErrorForGames(document.getElementById("user-games"), userGamesRequest.response);

  if (userGamesRequest.ok == true) {
    userGamesRequest.response.forEach((game) => {
      downloads += game.downloads;
    })
  }

  gameDownloads.textContent = downloads.toString();
};

const loadDashboard = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const userGamesRequest = await request(`${endpoints.user.list_games}${user.id}`, developerGameOptions, true).response;
  userGamesRequest.ok ? displayGames(document.getElementById("dashboard-market"), document.getElementById("dashboard-market"), userGamesRequest.response) : displayErrorForGames(document.getElementById("dashboard-market"), userGamesRequest.response);
};

const loadGames = async () => {
  const resultsLabel = document.getElementById("results-label");
  const myHeaders = new Headers({ "Content-Type": "application/json" });
  const perPage = 30;

  const options = {
    fresh: { orderBy: "asc", sortColumn: "created_at" },
    hot: { orderBy: "desc", sortColumn: "downloads" },
    underrated: { orderBy: "asc", sortColumn: "downloads" },
    sponsored: { orderBy: "desc", sortColumn: "sponsor_money" },
    freeandhot: { orderBy: "desc", sortColumn: "downloads" },
    bestseller: { orderBy: "desc", sortColumn: "downloads" },
  };

  const fetchFreeGames = async (key) => {
    return await request(endpoints.list.list_free_games, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ ...options[key], perPage, page: 1 }),
    }, false);
  }

  const fetchGames = async (key) => {
    return await request(endpoints.list.list_games, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ ...options[key], perPage, page: 1 }),
    }, false);
  };

  if (window.location.pathname.includes("/search") || window.location.pathname.includes("/category")) {
    // TODO: Show the search or category results
  } else {
    const [freshGames, hotGames, underratedGames, sponsoredGames, freeandhotGames, bestsellingGames] = await Promise.all([
      fetchGames("fresh"),
      fetchGames("hot"),
      fetchGames("underrated"),
      fetchGames("sponsored"),
      fetchFreeGames("freeandhot"),
      fetchGames("bestseller"),
    ]);

    freshGames.ok  ? displayGames(document.getElementById("fresh-games-list"), document.getElementById("fresh-games"), freshGames.response.items) : displayErrorForGames(document.getElementById("fresh-games"), freshGames.response);
    hotGames.ok  ? displayGames(document.getElementById("hot-games-list"), document.getElementById("hot-games"), hotGames.response.items) : displayErrorForGames(document.getElementById("hot-games"), hotGames.response);
    underratedGames.ok  ? displayGames(document.getElementById("underrated-games-list"), document.getElementById("underrated-games"), underratedGames.response.items) : displayErrorForGames(document.getElementById("underrated-games"), underratedGames.response);
    sponsoredGames.ok  ? displayGames(document.getElementById("sponsored-games-list"), document.getElementById("sponsored-games"), sponsoredGames.response.items) : displayErrorForGames(document.getElementById("sponsored-games"), sponsoredGames.response);
    freeandhotGames.ok  ? displayGames(document.getElementById("freehot-games-list"), document.getElementById("freehot-games"), freeandhotGames.response.items) : displayErrorForGames(document.getElementById("freehot-games"), freeandhotGames.response);
    bestsellingGames.ok  ? displayGames(document.getElementById("bestseller-games-list"), document.getElementById("bestseller-games"), bestsellingGames.response.items) : displayErrorForGames(document.getElementById("bestseller-games"), bestsellingGames.response);
  }
};

const fetchGames = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const priceRequestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const setPrices = async () => {
    const result = await request(endpoints.list.list_prices, priceRequestOptions, true);

    if (result) {
      prices = result.response.data;
      prices.sort((a, b) => b.unit_amount - a.unit_amount);
    }
  };

  await setPrices();

  if (window.location.pathname.includes("/dashboard")) {
    await loadDashboard();
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

(() => {
  fetchGames();
  setSearch();
  setCategory();
})
