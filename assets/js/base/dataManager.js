const get_games = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games";
const get_prices = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";

import { fetch_user } from "../user/sessionManager.js";
import { request } from "./apiManager.js";

const urlParams = new URLSearchParams(window.location.search);
const search_query = encodeURIComponent(urlParams.get("q") || "");
const category_name = encodeURIComponent(urlParams.get("n") || "");

let prices = [];
let games = [];
let genres = [];

let offset = 30;

const search_algorithm = (a, b) => {
  const scoreA = a.relevance * 0.7 + a.downloads * 0.3;
  const scoreB = b.relevance * 0.7 + b.downloads * 0.3;
  scoreA - scoreB;
};

const category_algorithm = (a, b) => {
  const scoreA = a.downloads * 0.8 + calculate_days(a.updated) * 0.2;
  const scoreB = b.downloads * 0.8 + calculate_days(b.updated) * 0.2;

  return scoreB - scoreA;
};

function fetch_game_price(game_id) {
  const result = prices.find((item) => item.product === game_id);
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
}

function calculate_days(timestamp) {
  return Math.ceil(Math.abs(new Date(timestamp)) / (1000 * 3600 * 24));
}

function calculate_diff_days(timestamp) {
  const createdTimestamp = new Date(timestamp);
  const currentDate = new Date();

  const createdTimeDiff = Math.abs(
    currentDate.getTime() - createdTimestamp.getTime()
  );
  const createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

  return createdDiffDays;
}

function create_genre_page(name, amount) {
  const genre_button = document.createElement("a");
  genre_button.className = "genre-button";

  const genre_name = document.createElement("div");
  const genre_games_amount = document.createElement("h4");

  genre_name.textContent = name;
  genre_name.className = "genre-name";
  genre_button.setAttribute("href", `category?n=${name}`);

  genre_games_amount.textContent =
    amount > 1 ? `${amount} games` : `${amount} game`;

  genre_button.appendChild(genre_name);
  genre_button.appendChild(genre_games_amount);

  document.getElementById("genres-list").appendChild(genre_button);
}

function create_game_page(game, game_price, market) {
  const price = game_price.price / 100;
  const currency = game_price.currency;

  const game_div = document.createElement("div");
  const game_image = document.createElement("img");
  const game_image_container = document.createElement("a");
  const game_title = document.createElement("a");
  const game_summary = document.createElement("div");
  const game_price_div = document.createElement("div");
  const game_price_text = document.createElement("span");

  game_div.className = "game";

  game_image.className = "product-image";
  game_image.setAttribute("src", game.icon.url);

  game_image_container.className = "product-image-container";

  game_title.className = "product-title";
  game_title.textContent = game.name;

  game_image_container.setAttribute("href", `game?g=${game.id}`);
  game_title.setAttribute("href", `game?g=${game.id}`);

  game_summary.className = "product-summary";
  game_summary.textContent = game.summary;

  game_price_div.className = "product-price";

  game_price_text.innerHTML = `${price} ${currency.toUpperCase()}`;

  const diff_days_created = calculate_diff_days(game.created_at);
  const diff_days_updated = calculate_diff_days(game.updated);

  game_price_div.appendChild(game_price_text);

  game_image_container.appendChild(game_image);
  game_image_container.appendChild(game_price_div);

  if (diff_days_created <= 7) {
    const game_created_label = document.createElement("div");
    game_created_label.className = "new-label";

    const game_created_text = document.createElement("span");
    game_created_text.innerHTML = "NEW";

    game_created_label.appendChild(game_created_text);
    game_image_container.appendChild(game_created_label);

    game_created_label.addEventListener("mouseenter", function () {
      if (diff_days_created != 1) {
        game_created_text.innerHTML = `${diff_days_created} DAYS AGO`;
      } else {
        game_created_text.innerHTML = `TODAY`;
      }
    });

    game_created_label.addEventListener("mouseleave", function () {
      game_created_text.innerHTML = "NEW";
    });
  } else if (diff_days_updated <= 7) {
    const game_updated_label = document.createElement("div");
    game_updated_label.className = "updated-label";

    const game_updated_text = document.createElement("span");
    game_updated_text.innerHTML = "UPDATED";

    game_updated_label.appendChild(game_updated_text);
    game_image_container.appendChild(game_updated_label);

    game_updated_label.addEventListener("mouseenter", function () {
      if (diff_days_updated != 1) {
        game_updated_text.innerHTML = `${diff_days_updated} DAYS AGO`;
      } else {
        game_updated_text.innerHTML = `TODAY`;
      }
    });

    game_updated_label.addEventListener("mouseleave", function () {
      game_updated_text.innerHTML = "UPDATED";
    });
  }
  game_div.appendChild(game_image_container);
  game_div.appendChild(game_title);
  game_div.appendChild(game_summary);

  market.appendChild(game_div);
}

function levenshtein_distance(a, b) {
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

function calculate_similarity(a, b) {
  const distance = levenshtein_distance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

function remove_private_games() {
  const newGames = games.filter((game) => game.active == true);
  games = newGames;
}

function set_genre_relevancy() {
  const similarityThreshold = 0.15;

  if (search_query != "") {
    const relevantGenres = genres.map((genre) => {
      const similarity = calculate_similarity(search_query, genre.name);

      if (similarity > similarityThreshold) {
        return {
          ...genre,
          relevance: similarity,
        };
      } else {
        return null;
      }
    });

    genres = relevantGenres.filter((genre) => genre !== null);
  }
}

function set_game_relevancy() {
  const similarityThreshold = 0.15;

  if (category_name != "") {
    const genreGames = games.filter((game) => game.genre == category_name);
    games = genreGames;
  }

  if (search_query != "") {
    const relevantGames = games.map((game) => {
      const nameSimilarity = calculate_similarity(search_query, game.name);
      const summarySimilarity = calculate_similarity(
        search_query,
        game.summary
      );

      const similarity = nameSimilarity * 0.7 + summarySimilarity * 0.3;

      if (similarity > similarityThreshold) {
        return {
          ...game,
          relevance: similarity,
        };
      } else {
        return null;
      }
    });

    games = relevantGames.filter((game) => game !== null);
  }
}

async function load_dashboard() {
  const category = document.getElementById("dashboard-market");
  const user = await fetch_user();

  if (user != undefined) {
    const user_games = games.filter((game) => game.developer_name == user.name);

    user_games.forEach((game) => {
      const game_price = fetch_game_price(game.product_id.toString());
      create_game_page(game, game_price, category);
    });

    if (user_games.length > 0) {
      const categoryNoneElement = category.querySelector(".category-none");
  
      if (categoryNoneElement) {
        categoryNoneElement.remove();
      }
    }
  }
}

function load_games_with_list(list, category, gameslist) {
  const filteredGames = gameslist.filter((game) => game && game.active);

  filteredGames.forEach((game) => {
    const game_price = fetch_game_price(game.id.toString());
    create_game_page(game, game_price, list);
  });

  if (filteredGames.length > 0) {
    const categoryNoneElement = category.querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
  }
}

function load_genres() {
  if (window.location.pathname.includes("/search")) {
    genres.sort((a, b) => b.relevance - a.relevance);
  } else {
    genres.sort((a, b) => b.count - a.count);
  }

  genres.forEach((genre) => {
    create_genre_page(genre.name, genre.count);
  });

  if (genres.length > 0) {
    const categoryNoneElement = document
      .getElementById("genres")
      .querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
  }
}

function sort_games(listId, gamesList, sortingFunction, min, max) {
  gamesList.sort(sortingFunction);
  gamesList = gamesList.slice(min, max);

  const listElement = document.getElementById(listId);
  const gamesElement = document.getElementById(listId.replace("-list", ""));

  load_games_with_list(listElement, gamesElement, gamesList);
}

const load_more_games = () => {
  const results_label = document.getElementById("results-label");

  if (games.length == 1) {
    results_label.textContent = "(1 result)";
  } else if (games.length == 0) {
    results_label.textContent = "(no results)";
  } else {
    results_label.textContent = `(${games.length} results)`;
  }

  if (window.location.pathname.includes("/search")) {
    sort_games(
      "relevant-games-list",
      games,
      search_algorithm,
      offset,
      offset * 2
    );
  } else if (window.location.pathname.includes("/category")) {
    sort_games(
      "genre-games-list",
      games,
      category_algorithm,
      offset,
      offset * 2
    );
  }
};

function load_games() {
  if (window.location.pathname.includes("/search")) {
    const results_label = document.getElementById("results-label");
    if (games.length == 1) {
      results_label.textContent = "(1 result)";
    } else if (games.length == 0) {
      results_label.textContent = "(no results)";
    } else {
      results_label.textContent = `(${games.length} results)`;
    }

    sort_games("relevant-games-list", games, search_algorithm, 0, offset);
  } else if (window.location.pathname.includes("/category")) {
    const results_label = document.getElementById("results-label");
    if (games.length == 1) {
      results_label.textContent = "(1 result)";
    } else if (games.length == 0) {
      results_label.textContent = "(no results)";
    } else {
      results_label.textContent = `(${games.length} results)`;
    }

    sort_games("genre-games-list", games, category_algorithm, 0, offset);
  } else {
    // Fresh Games
    sort_games(
      "fresh-games-list",
      games,
      (a, b) => {
        const scoreA = calculate_days(a.created_at) * 0.4 + a.downloads * 0.6;
        const scoreB = calculate_days(b.created_at) * 0.4 + b.downloads * 0.6;

        return scoreB - scoreA;
      },
      0,
      offset
    );

    // Hot Games
    sort_games(
      "hot-games-list",
      games,
      (a, b) => {
        const scoreA = a.downloads * 0.6 + calculate_days(a.updated) * 0.4;
        const scoreB = b.downloads * 0.6 + calculate_days(b.updated) * 0.4;

        return scoreB - scoreA;
      },
      0,
      offset
    );

    // Sponsored Games
    const sponsoredGames = games.filter((game) => game.sponsor_money > 0);
    sort_games(
      "sponsored-games-list",
      sponsoredGames,
      (a, b) => {
        const scoreA = a.sponsor_money * 0.6 + a.downloads * 0.4;
        const scoreB = b.sponsor_money * 0.6 + b.downloads * 0.4;

        return scoreB - scoreA;
      },
      0,
      offset
    );

    // Bestsellers
    sort_games(
      "bestseller-games-list",
      games,
      (a, b) => {
        const scoreA = a.downloads * 0.8 + calculate_days(a.updated) * 0.2;
        const scoreB = b.downloads * 0.8 + calculate_days(b.updated) * 0.2;

        return scoreB - scoreA;
      },
      0,
      offset
    );

    // Free Games
    const freegames = games.filter((game) => game.free == true);
    sort_games(
      "free-games-list",
      freegames,
      (a, b) => {
        const scoreA = a.downloads * 0.7 + calculate_days(a.updated) * 0.3;
        const scoreB = b.downloads * 0.7 + calculate_days(b.updated) * 0.3;

        return scoreB - scoreA;
      },
      0,
      offset
    );
  }
}

async function fetch_games() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const game_request_options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const price_request_options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  }

  function set_genres() {
    games.forEach(game => {
      const genre = genres.find(genre => genre.name === game.genre)
      genre ? genre.count++ : genres.push({name: game.genre, count: 1});
    });
  }

  async function set_prices() {
    const result = await request(get_prices, price_request_options, true, "prices");

    if (result.Success) {
      prices = result.Result.data;
    } else {
      throw new Error(result.Result);
    }
  }

  async function fetch_data() {
    const result = await request(get_games, game_request_options, false, "games");

    if (result.Success) {
      games = result.Result.games;
    } else {
      throw new Error(result.Result);
    }
  }

  await set_prices();
  await fetch_data();

  if (window.location.pathname.includes("/dashboard")) {
    load_dashboard();
  } else {
    set_genres();
    remove_private_games();
    set_game_relevancy();
    load_games();
  }

  if (genres.length > 0 && document.getElementById("genres-list") != null) {
    set_genre_relevancy();
    load_genres();
  }

  if (prices.length > 0) {
    prices.sort((a, b) => b.unit_amount - a.unit_amount);
  }
}

function set_search() {
  if (document.getElementById("search-query") != null) {
    const search_label = document.getElementById("search-label");
    const search_query2 = document.getElementById("search-query");

    search_query2.value = search_query;
    if (search_label != null) {
      if (search_query != null) {
        search_label.textContent = `Results for '${search_query}'`;
      } else {
        window.location.assign("index");
      }
    }
  }
}

function set_category() {
  if (window.location.pathname.includes("/category")) {
    const search_label = document.getElementById("search-label");
    search_label.textContent = `Top '${category_name}' Games`;
  }
}

fetch_games();
set_search();
set_category();

window.addEventListener("scroll", () => {
  if (
    window.location.pathname.includes("/search") ||
    window.location.pathname.includes("/category")
  ) {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 100) {
      offset += 100;
      load_more_games();
    }
  }
});
