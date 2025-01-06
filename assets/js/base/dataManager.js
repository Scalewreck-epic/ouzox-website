// Handles all the game data from the server to the page

import { user } from "../user/userManager.js";
import { request } from "./apiManager.js";
import { endpoints } from "../other/endpoints.js";

const urlParams = new URLSearchParams(window.location.search);

const genres = [];
const platformGames = [];

// Classes for each genre
class Genre {
  constructor(genre) {
    this.name = genre.name;
    this.count = genre.count;
  }

  // Create the genre card that shows how many games the genre has and redirects users to the genre page
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

// Classes for each game
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

  // Calculates the days since the given timestamp
  calculateDiffDays = (timestamp) => {
    const currentDate = new Date();

    const createdTimeDiff = Math.abs(currentDate.getTime() - timestamp);
    const createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

    return createdDiffDays;
  };

  // Formats numbers by thousands and millions. Used for likes.
  formatLikes = (likes) => {
    const million = 1000000;
    const thousand = 1000;

    if (likes >= million) {
      return `${(likes / million)}M`;
    } else if (likes >= thousand) {
      return `${(likes / thousand)}K`;
    } else {
      return likes.toString();
    }
  };

  // Creates the game card that shows the game's information
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

    gamePriceText.textContent = this.free ? "FREE" : `${price} ${currency.toUpperCase()}`; // If it's free, just display the word 'FREE' otherwise, display the price and currency.
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

// Creates a label and shows the number of given days on hover. Used for new or updated labels on game cards.
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

// If displaying games had errored, this is how it's handled.
export const displayErrorForGames = async (categoryElement, response) => {
  const categoryNoneElement = categoryElement.querySelector(".category-none");
  categoryNoneElement.textContent = response;
};

// Display all the given games on the given elements
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

        if (existingGenreIndex !== -1) { // If the genre exists, add to the counter
          genres[existingGenreIndex].count++;
        } else { // Otherwise, create a new genre
          genres.push({
            name: game.genre,
            count: 1,
          });
        }
      }
    });
  }
};

// Display all the genres
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

// Load all the user's public games by the given user ID
export const loadUserGames = async (newUser) => {
  const gameDownloads = document.getElementById("game-downloads");

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
    const downloads = userGamesRequest.response.reduce(
      (acc, game) => acc + game.downloads,
      0
    );
    gameDownloads.textContent = downloads.toString();
    displayGames(
      document.getElementById("user-games"),
      document.getElementById("user-games"),
      userGamesRequest.response
    );
  } else {
    displayErrorForGames(
      document.getElementById("user-games"),
      userGamesRequest.response
    );
  }
};

// Display all the user's games by the current user session ID
export const loadDashboard = async () => {
  const myHeaders = new Headers({ "Content-Type": "application/json" });

  const developerGameOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const userGamesRequest = await request(
    `${endpoints.user.list_games}${user.id}`,
    developerGameOptions,
    true
  );

  if (userGamesRequest.ok) {
    displayGames(
      document.getElementById("dashboard-market"),
      document.getElementById("dashboard-market"),
      userGamesRequest.response
    );
  } else {
    displayErrorForGames(
      document.getElementById("dashboard-market"),
      userGamesRequest.response
    );
  }
};

// Load games filtered by genre
export const loadGenreSearchGames = async () => {
  const genreListElement = document.getElementById("genre-games-list");
  const genreListCategory = document.getElementById("genre-games");
  const searchLabel = document.getElementById("search-label");
  const resultsLabel = document.getElementById("results-label");
  
  const categoryName = urlParams.get("n") || "";
  const myHeaders = new Headers({ "Content-Type": "application/json" });

  searchLabel.textContent = `Top '${categoryName}' Games`;

  const perPage = 30;

  const result = await request(
    `${endpoints.game.list_genresearch}${categoryName}`,
    {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ perPage, page: 1 }),
    }, true
  );

  if (result.ok) {
    const resultItems = result.response.games;

    displayGames(genreListElement, genreListCategory, resultItems);
    resultsLabel.textContent = `(${resultItems.length} result${
      resultItems.length !== 1 ? "s" : ""
    })`;
  } else {
    displayErrorForGames(genreListElement, result.response);
    resultsLabel.textContent = "(error occured)";
  }
};

// Load games by search query
export const loadSearchGames = async() => {
  const searchListElement = document.getElementById("relevant-games-list");
  const searchListCategory = document.getElementById("relevant-games");
  const searchLabel = document.getElementById("search-label");
  const resultsLabel = document.getElementById("results-label");
  const searchQueryInput = document.getElementById("search-query");

  const searchQuery = urlParams.get("q") || "";
  const myHeaders = new Headers({ "Content-Type": "application/json" });

  const perPage = 30;

  searchQueryInput.value = searchQuery;
  searchLabel.textContent = `Results for '${searchQuery}'`;

  const result = await request(`${endpoints.game.list_search}${searchQuery}`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ perPage, page: 1 })
  }, false);

  if (result.ok) {
    const resultItems = result.response.games;

    displayGames(searchListElement, searchListCategory, resultItems);
    resultsLabel.textContent = `(${resultItems.length} result${
      resultItems.length !== 1 ? "s" : ""
    })`;
  } else {
    displayErrorForGames(searchListElement, result.response);
    resultsLabel.textContent = "(error occured)";
  }
}

// Load all the front page games
const loadGames = async () => {
  const myHeaders = new Headers({ "Content-Type": "application/json" });
  const perPage = 10;

  const rawGames = await request(
    endpoints.game.list_frontpage,
    {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ perPage, page: 1 }),
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

// Fetch the front page games
export const fetchGames = async () => {
  await loadGames();

  if (genres.length > 0 && document.getElementById("genres-list") != null) {
    displayGenres();
  }
};