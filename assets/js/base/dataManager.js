/**
 * @file dataManager.js
 * @description Handles all game data interactions from the server to the page.
 * This module manages displaying the game data, including genres and individual games.
 */

import { cookie } from "./userManager.js";
import { request } from "../util/apiManager.js";
import { endpoints } from "../util/endpoints.js";

const urlParams = new URLSearchParams(window.location.search);

const genres = [];
const platformGames = [];

/** TODO:
 * Progressively load new games when scrolling down on search pages
 */

/**
 * @class Genre
 * @description Represents a game genre.
 */
class Genre {
  constructor(genre) {
    this.name = genre.name;
    this.count = genre.count;
  }

  /**
   * Creates a genre card that shows how many games the genre has and redirects users to the genre page.
   * @param {string} name - The name of the genre.
   * @param {number} amount - The number of games in the genre.
   */
  createGenreCard = (name, amount) => {
    const genreButton = document.createElement("a");
    const genreName = document.createElement("div");
    const genreGamesAmount = document.createElement("h4");

    genreButton.classList.add("genre-button");
    genreName.classList.add("genre-name");

    genreName.textContent = name;
    genreButton.href = `category?n=${name}`;

    genreGamesAmount.textContent =
      amount !== 1 ? `${amount} games` : `${amount} game`;

    genreButton.appendChild(genreName);
    genreButton.appendChild(genreGamesAmount);

    document.getElementById("genres-list").appendChild(genreButton);
  };
}

/**
 * @class Game
 * @description Represents a game with its details.
 */
class Game {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.summary = data.summary;
    this.icon = new URL(data.icon.url);
    this.genre = data.genre;
    this.likes = data.likes;
    this.created = data.created_at;
    this.updated = data.updated;
    this.price = data.pricing.price;
    this.currency = data.pricing.currency;
    this.free = data.pricing.free;
  }

  /**
   * Calculates the number of days since the given timestamp.
   * @param {number} timestamp - The timestamp to compare against.
   * @returns {number} The number of days since the timestamp.
   */
  calculateDiffDays = (timestamp) => {
    const currentDate = new Date();
    const createdTimeDiff = Math.abs(currentDate.getTime() - timestamp);
    const createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));
    return createdDiffDays;
  };

  /**
   * Formats the number of likes for display.
   * @param {number} likes - The number of likes.
   * @returns {string} The formatted likes string.
   */
  formatLikes = (likes) => {
    const million = 1000000;
    const thousand = 1000;

    if (likes >= million) {
      return `${likes / million}M`;
    } else if (likes >= thousand) {
      return `${likes / thousand}K`;
    } else {
      return likes.toString();
    }
  };

  /**
   * Creates a game card that shows the game's information.
   * @param {HTMLElement} listElement - The element to append the game card to.
   */
  createGameCard = (listElement) => {
    const price = this.price;
    const currency = this.currency;

    const gameContainer = document.createElement("div");
    const gameImage = document.createElement("img");
    const gameImageContainer = document.createElement("a");
    const gameTitle = document.createElement("a");
    const gameSummary = document.createElement("div");
    const gamePriceContainer = document.createElement("div");
    const gameRatioContainer = document.createElement("div");
    const gamePriceText = document.createElement("span");
    const gameUpvotesText = document.createElement("span");

    gameContainer.classList.add("game");
    gameImage.classList.add("product-image");
    gameImageContainer.classList.add("product-image-container");
    gameTitle.classList.add("product-title");
    gameSummary.classList.add("product-summary");
    gamePriceContainer.classList.add("product-price");
    gameRatioContainer.classList.add("product-ratio");

    gameImage.src = this.icon.href;
    gameImageContainer.href = `game?g=${this.id}`;
    gameTitle.href = `game?g=${this.id}`;

    gameTitle.textContent = this.name;
    gameSummary.textContent = this.summary;

    gamePriceText.textContent = this.free
      ? "FREE"
      : `${price} ${currency.toUpperCase()}`; // If it's free, just display the word 'FREE' otherwise, display the price and currency.
    gameUpvotesText.textContent = `${this.formatLikes(this.likes)}^`;

    gamePriceContainer.appendChild(gamePriceText);
    gameRatioContainer.appendChild(gameUpvotesText);

    gameImageContainer.appendChild(gameImage);
    gameImageContainer.appendChild(gamePriceContainer);
    gameImageContainer.appendChild(gameRatioContainer);

    const diffDaysCreated = this.calculateDiffDays(this.created);
    const diffDaysUpdated = this.calculateDiffDays(this.updated);

    // Create a label if the game was recently created or updated.
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

/**
 * Creates a label and shows the number of given days on hover.
 * Used for new or updated labels on game cards.
 * @param {string} labelText - The text for the label.
 * @param {number} numDays - The number of days since the game was created or updated.
 * @param {HTMLElement} targetElement - The element to append the label to.
 */
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

/**
 * Displays an error message for games.
 * @param {HTMLElement} categoryElement - The element to display the error in.
 * @param {string} response - The error message.
 */
export const displayErrorForGames = async (categoryElement, response) => {
  const categoryNoneElement = categoryElement.querySelector(".category-none");
  categoryNoneElement.textContent = response;
};

/**
 * Displays all the given games on the specified elements.
 * @param {HTMLElement} listElement - The element to display the games in.
 * @param {HTMLElement} categoryElement - The category element.
 * @param {Array} games - The array of game data to display.
 */
export const displayGames = async (listElement, categoryElement, games) => {
  const categoryNoneElement = categoryElement.querySelector(".category-none");

  if (games.length > 0) {
    categoryNoneElement.remove();

    games.forEach(async (gameData) => {
      const game = new Game(gameData);
      game.createGameCard(listElement);

      if (!platformGames.find((game) => game.id === gameData.id)) {
        platformGames.push(gameData);

        // Adds the game's genre
        const existingGenreIndex = genres.findIndex(
          (genre) => genre.name === game.genre
        );

        if (existingGenreIndex !== -1) {
          // If the genre exists, add to the counter
          genres[existingGenreIndex].count++;
        } else {
          // Otherwise, create a new genre
          genres.push({
            name: game.genre,
            count: 1,
          });
        }
      }
    });
  }
};

/**
 * Displays all the genres.
 */
const displayGenres = async () => {
  genres.sort((a, b) => b.count - a.count);

  if (genres.length > 0) {
    const categoryNoneElement = document
      .getElementById("genres")
      .querySelector(".category-none");
    categoryNoneElement.remove();
  }

  genres.forEach((genreData) => {
    const genre = new Genre(genreData);
    genre.createGenreCard(genreData.name, genreData.count);
  });
};

/**
 * Loads all the user's public games by the given user ID.
 * @param {Object} newUser - The user object containing the user ID.
 */
export const loadUserGames = async (newUser) => {
  const gameDownloads = document.getElementById("game-downloads");
  const userGamesElement = document.getElementById("user-games");

  const myHeaders = new Headers({ "Content-Type": "application/json" });

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const userGamesRequest = await request(
    `${endpoints.user.list_public_games}${newUser.id}`,
    developerGameOptions,
    false
  );

  if (userGamesRequest.ok) {
    const userGames = userGamesRequest.response;

    userGames.length > 0
      ? displayGames(userGamesElement, userGamesElement, userGames)
      : displayErrorForGames(userGamesElement, "None");

    const downloads = userGames.reduce((acc, game) => acc + game.downloads, 0);
    gameDownloads.textContent = downloads.toString();
  } else {
    displayErrorForGames(userGamesElement, userGames);
  }
};

/**
 * Loads all the games for the dashboard.
 */
export const loadDashboard = async () => {
  const myHeaders = new Headers({ "Content-Type": "application/json" });
  const dashboardElement = document.getElementById("dashboard-market");

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const userGamesRequest = await request(
    `${endpoints.user.list_games}${cookie}`,
    developerGameOptions,
    false
  );

  if (userGamesRequest.ok) {
    const userGames = userGamesRequest.response;

    userGames.length > 0
      ? displayGames(dashboardElement, dashboardElement, userGames)
      : displayErrorForGames(dashboardElement, "None");
  } else {
    displayErrorForGames(dashboardElement, userGamesRequest.response);
  }
};

/**
 * Loads games filtered by genre.
 */
export const loadGenreSearchGames = async () => {
  const genreListElement = document.getElementById("genre-games-list");
  const genreListCategory = document.getElementById("genre-games");
  const searchLabel = document.getElementById("search-label");
  const resultsLabel = document.getElementById("results-label");

  const categoryName = urlParams.get("n") || "";
  const myHeaders = new Headers({ "Content-Type": "application/json" });

  searchLabel.textContent = `Top '${categoryName}' Games`;

  const result = await request(
    `${endpoints.game.list_genresearch}${categoryName}/${1}`,
    {
      method: "GET",
      headers: myHeaders,
    },
    false
  );

  if (result.ok) {
    const itemsReceived = result.response.games.itemsReceived;
    const resultItems = result.response.games.items;

    itemsReceived > 0
      ? displayGames(genreListElement, genreListCategory, resultItems)
      : displayErrorForGames(genreListCategory, "None");
    resultsLabel.textContent = `(${itemsReceived} result${
      itemsReceived !== 1 ? "s" : ""
    })`;
  } else {
    displayErrorForGames(genreListElement, result.response);
    resultsLabel.textContent = "(error occurred)";
  }
};

/**
 * Loads games by search query.
 */
export const loadSearchGames = async () => {
  const searchListElement = document.getElementById("relevant-games-list");
  const searchListCategory = document.getElementById("relevant-games");
  const searchLabel = document.getElementById("search-label");
  const resultsLabel = document.getElementById("results-label");
  const searchQueryInput = document.getElementById("search-query");

  const searchQuery = urlParams.get("q") || "";
  const myHeaders = new Headers({ "Content-Type": "application/json" });

  searchQueryInput.value = searchQuery;
  searchLabel.textContent = `Results for '${searchQuery}'`;

  const result = await request(
    `${endpoints.game.list_search}${searchQuery}/${1}`,
    {
      method: "GET",
      headers: myHeaders,
    },
    false
  );

  if (result.ok) {
    const itemsReceived = result.response.games.itemsReceived;
    const resultItems = result.response.games.items;

    itemsReceived > 0
      ? displayGames(searchListElement, searchListCategory, resultItems)
      : displayErrorForGames(searchListElement, "None");
    resultsLabel.textContent = `(${itemsReceived} result${
      itemsReceived !== 1 ? "s" : ""
    })`;
  } else {
    displayErrorForGames(searchListElement, result.response);
    resultsLabel.textContent = "(error occurred)";
  }
};

/**
 * Loads all the front page games.
 */
const loadGames = async () => {
  const myHeaders = new Headers({ "Content-Type": "application/json" });
  const rawGames = await request(
    endpoints.game.list_frontpage,
    {
      method: "GET",
      headers: myHeaders,
    },
    true
  );

  if (rawGames.ok) {
    const games = rawGames.response.games[0];
    const categoryGames = {
      fresh: games.fresh,
      hot: games.hot,
      underrated: games.underrated,
      sponsored: games.sponsored,
      freeandhot: games.freeandhot,
      bestseller: games.bestseller,
    };

    Object.keys(categoryGames).forEach((key) => {
      const listElement = document.getElementById(`${key}-games-list`);
      const categoryElement = document.getElementById(`${key}-games`);

      if (categoryGames[key].itemsReceived > 0) {
        displayGames(listElement, categoryElement, categoryGames[key].items);
      } else {
        displayErrorForGames(categoryElement, "None");
      }
    });
  }
};

/**
 * Fetches the front page games.
 */
export const fetchGames = async () => {
  await loadGames();

  if (genres.length > 0 && document.getElementById("genres-list") != null) {
    displayGenres();
  }
};
