import { fetchUser } from "../user/sessionManager.js";
import { request } from "./apiManager.js";
import { endpoints } from "../other/endpoints.js";

const pathName = window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("q") || "";
const categoryName = urlParams.get("n") || "";

const prices = [];
const genres = [];
const platformGames = [];

const user = await fetchUser();

class Genre {
  constructor(genre) {
    this.name = genre.name;
    this.count = genre.count;
  }

  createGenrePage = (name, amount) => {
    const genreButton = document.createElement("a");
    const genreName = document.createElement("div");
    const genreGamesAmount = document.createElement("h4");

    genreButton.classList.add("genre-button");
    genreName.classList.add("genre-name");

    genreName.textContent = name;
    genreButton.href = `category?n=${name}`;

    genreGamesAmount.textContent = amount !== 1 ? `${amount} games` : `${amount} game`;

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
    this.created = data.created;
    this.updated = data.updated;
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

    const likeToDislikeRatio = (this.likes / (this.likes + this.dislikes)) * 100;

    const gameContainer = document.createElement("div");
    const gameImage = document.createElement("img");
    const gameImageContainer = document.createElement("a");
    const gameTitle = document.createElement("a");
    const gameSummary = document.createElement("div");
    const gamePriceContainer = document.createElement("div");
    const gameRatioContainer = document.createElement("div");
    const gamePriceText = document.createElement("span");
    const gameRatioText = document.createElement("span");

    gameContainer.classList.add("game");
    gameImage.classList.add("product-image");
    gameImageContainer.classList.add("product-image-container");
    gameTitle.classList.add("product-title");
    gameSummary.classList.add("product-summary");
    gamePriceContainer.classList.add("product-price");
    gameRatioContainer.classList.add("product-ratio");

    gameImage.src = this.icon.url;
    gameImageContainer.href = `game?g=${this.id}`;
    gameTitle.href = `game?g=${this.id}`;

    gameTitle.textContent = this.name;
    gameSummary.textContent = this.summary;

    gamePriceText.textContent = `${price} ${currency.toUpperCase()}`;
    gameRatioText.textContent = `${likeToDislikeRatio}%`;

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
  text.textContent = labelText;

  label.appendChild(text);
  targetElement.appendChild(label);

  label.addEventListener("mouseenter", function () {
    text.textContent = numDays != 1 ? `${numDays} DAYS AGO` : `TODAY`;
  });

  label.addEventListener("mouseleave", function () {
    text.textContent = labelText;
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

    games.forEach(async (gameData) => {
      const game = new Game(gameData);
      const gamePrice = fetchGamePrice(game.id.toString());
      game.createGamePage(listElement, gamePrice);

      if (!platformGames.find((game) => game.id === gameData.id)) {
        platformGames.push(gameData);

        const existingGenreIndex = genres.findIndex((genre) => genre.name === game.genre);

        if (existingGenreIndex !== -1) {
          genres[existingGenreIndex].count++;
        } else {
          genres.push({
            name: game.genre,
            count: 1,
          });
        }
      }
    });
  }
};

const displayGenres = async () => {
  if (pathName.includes("/search")) {
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

  const myHeaders = new Headers({ "Content-Type": "application/json" });

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const userGamesRequest = await request(`${endpoints.user.list_public_games}${newUser.id}`, developerGameOptions, false);

  if (userGamesRequest.ok) {
    const downloads = userGamesRequest.response.reduce((acc, game) => acc + game.downloads, 0);
    gameDownloads.textContent = downloads.toString();
    displayGames(document.getElementById("user-games"), document.getElementById("user-games"), userGamesRequest.response);
  } else {
    displayErrorForGames(document.getElementById("user-games"), userGamesRequest.response);
  }
};

const loadDashboard = async () => {
  const myHeaders = new Headers({ "Content-Type": "application/json" });

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const userGamesRequest = await request(`${endpoints.user.list_games}${user.id}`, developerGameOptions, true);

  if (userGamesRequest.ok) {
    displayGames(document.getElementById("dashboard-market"), document.getElementById("dashboard-market"), userGamesRequest.response);
  } else {
    displayErrorForGames(document.getElementById("dashboard-market"), userGamesRequest.response);
  }
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

  const topSearchOptions = options.bestseller;

  const fetchGamesByEndpoint = async (key, endpoint) => {
    return await request(endpoint, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ ...options[key], perPage, page: 1 }),
    }, false);
  };

  // TODO: Show the search results

  if (pathName.includes("/category")) {
    const genreListElement = document.getElementById("genre-games-list");
    const genreListCategory = document.getElementById("genre-games");
    const searchLabel = document.getElementById("search-label");

    searchLabel.textContent = `Top '${categoryName}' Games`;

    const result = await request(endpoints.list.list_games, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ ...topSearchOptions, perPage, page: 1}),
    });

    if (result.ok) {
      const resultItems = result.response.items;

      displayGames(genreListElement, genreListCategory, resultItems);
      resultsLabel.textContent = `(${resultItems.length} result${resultItems.length !== 1 ? 's' : ''})`;
    } else {
      displayErrorForGames(genreListElement, result.response);
      resultsLabel.textContent = "(0 results)";
    };
  } else {
    const endpointsList = {
      fresh: endpoints.list.list_games,
      hot: endpoints.list.list_games,
      underrated: endpoints.list.list_games,
      sponsored: endpoints.list.list_games,
      freeandhot: endpoints.list.list_free_games,
      bestseller: endpoints.list.list_games,
    };

    const promises = Object.keys(endpointsList).map((key) => fetchGamesByEndpoint(key, endpointsList[key]));
    const results = await Promise.all(promises);

    Object.keys(endpointsList).forEach((key, index) => {
      const result = results[index];
      const listElement = document.getElementById(`${key}-games-list`);
      const categoryElement = document.getElementById(`${key}-games`);

      result.ok ? displayGames(listElement, categoryElement, result.response.items) : displayErrorForGames(categoryElement, result.response);
    });
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
      result.response.data.forEach(price => {
        prices.push(price);
      });
      prices.sort((a, b) => b.unit_amount - a.unit_amount);
    }
  };

  await setPrices();

  if (pathName.includes("/dashboard")) {
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

(() => {
})

fetchGames();
setSearch();