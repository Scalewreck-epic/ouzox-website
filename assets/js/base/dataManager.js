const get_prices = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";

import { fetch_user, fetch_alternative_user } from "../user/sessionManager.js";
import { request } from "./apiManager.js";

const urlParams = new URLSearchParams(window.location.search);
const search_query = (urlParams.get("q") || "");
const category_name = (urlParams.get("n") || "");

let prices = [];
let genres = [];

let page = 1;
const similarityThreshold = 0.30;

const search_algorithm = (a, b) => {
  const scoreA = a.relevance * 0.7 + a.downloads * 0.3;
  const scoreB = b.relevance * 0.7 + b.downloads * 0.3;
  scoreB - scoreA;
};

const category_algorithm = (a, b) => {
  const downloadScoreA = a.downloads * 0.6;
  const downloadScoreB = b.downloads * 0.6;

  const updatedScoreA = calculate_time_score(a.updated) * 0.4;
  const updatedScoreB = calculate_time_score(b.updated) * 0.4;

  const totalScoreA = downloadScoreA + updatedScoreA;
  const totalScoreB = downloadScoreB + updatedScoreB;

  return totalScoreB - totalScoreA;
};

class Genre {
  constructor(genre) {
    this.name = genre.name;
    this.count = genre.count;
  }
}

const fetch_game_price = (game_id) => {
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
};

const calculate_diff_days = (timestamp) => {
  const currentDate = new Date();

  const createdTimeDiff = Math.abs(currentDate.getTime() - timestamp);
  const createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

  return createdDiffDays;
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

const create_genre_page = (name, amount) => {
  const genre_button = document.createElement("a");
  const genre_name = document.createElement("div");
  const genre_games_amount = document.createElement("h4");

  genre_button.setAttribute("class", "genre-button");
  genre_name.setAttribute("class", "genre-name");

  genre_name.textContent = name;
  genre_button.setAttribute("href", `category?n=${name}`);

  genre_games_amount.textContent =
    amount != 1 ? `${amount} games` : `${amount} game`;

  genre_button.appendChild(genre_name);
  genre_button.appendChild(genre_games_amount);

  document.getElementById("genres-list").appendChild(genre_button);
};

const create_game_page = (game, game_price, market) => {
  const price = game_price.price / 100;
  const currency = game_price.currency;

  const game_div = document.createElement("div");
  const game_image = document.createElement("img");
  const game_image_container = document.createElement("a");
  const game_title = document.createElement("a");
  const game_summary = document.createElement("div");
  const game_price_div = document.createElement("div");
  const game_price_text = document.createElement("span");

  game_div.setAttribute("class", "game");
  game_image.setAttribute("class", "product-image");
  game_image_container.setAttribute("class", "product-image-container");
  game_title.setAttribute("class", "product-title");
  game_summary.setAttribute("class", "product-summary");
  game_price_div.setAttribute("class", "product-price");

  game_image.setAttribute("src", game.icon.url);
  game_image_container.setAttribute("href", `game?g=${game.id}`);
  game_title.setAttribute("href", `game?g=${game.id}`);

  game_title.textContent = game.name;
  game_summary.textContent = game.summary;

  game_price_text.innerHTML = `${price} ${currency.toUpperCase()}`;

  game_price_div.appendChild(game_price_text);

  game_image_container.appendChild(game_image);
  game_image_container.appendChild(game_price_div);

  const diff_days_created = calculate_diff_days(game.created);
  const diff_days_updated = calculate_diff_days(game.updated);

  if (diff_days_created <= 7) {
    createLabel("NEW", diff_days_created, game_image_container);
  } else if (diff_days_updated <= 7) {
    createLabel("UPDATED", diff_days_updated, game_image_container);
  }

  game_div.appendChild(game_image_container);
  game_div.appendChild(game_title);
  game_div.appendChild(game_summary);

  market.appendChild(game_div);
};

const levenshtein_distance = (a, b) => {
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
};

const calculate_similarity = (a, b) => {
  const distance = levenshtein_distance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
};

const set_genre_relevancy = () => {
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
};

const set_game_relevancy = () => {
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
};

const filter_games = (user, category) => {
  const user_games = games.filter((game) => game.developer_name == user.name);
  user_games.sort(category_algorithm);

  user_games.forEach(async (game) => {
    const game_price = fetch_game_price(game.product_id.toString());
    create_game_page(game, game_price, category);
  });

  if (user_games.length > 0) {
    const categoryNoneElement = category.querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
  }
};

const load_user_games = async (user_id) => {
  const category = document.getElementById("user-games");
  const game_downloads = document.getElementById("game-downloads");

  const user = await fetch_alternative_user(user_id);

  const user_games = games.filter((game) => game.developer_name == user.name);
  user_games.sort(category_algorithm);

  let total_downloads = 0;

  user_games.forEach((game) => {
    const game_price = fetch_game_price(game.product_id.toString());
    create_game_page(game, game_price, category);

    total_downloads += game.downloads;
    game_downloads.textContent = total_downloads.toString();
  });

  if (user_games.length > 0) {
    const categoryNoneElement = category.querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
  }
};

const load_dashboard = async () => {
  const category = document.getElementById("dashboard-market");
  const user = await fetch_user();

  filter_games(user, category);
};

const load_games_with_list = async (list, category, gameslist) => {
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
};

const display_games = async (listElement, categoryElement, games) => {
  if (games.length > 0) {
    const categoryNoneElement = categoryElement.querySelector(".category-none");

    if (categoryNoneElement) {
      categoryNoneElement.remove();
    }
    
    games.forEach((game) => {
      const game_price = fetch_game_price(game.id.toString());
      create_game_page(game, game_price, listElement);

      const genre = genres.find((genre) => genre.name === game.genre);
  
      if (!genre) {
        const genreCount = games.filter(
          (gameWsamegenre) => gameWsamegenre.genre == game.genre
        ).length;
  
        const properties = {
          name: game.genre,
          count: genreCount,
        };
  
        const newGenre = new Genre(properties);
        genres.push(newGenre);
      }
    });
  }
}

const load_genres = () => {
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
};

const sort_games = (listId, gamesList, sortingFunction, min, max) => {
  gamesList.sort(sortingFunction);
  gamesList = gamesList.slice(min, max);

  const listElement = document.getElementById(listId);
  const gamesElement = document.getElementById(listId.replace("-list", ""));

  load_games_with_list(listElement, gamesElement, gamesList);
};

const load_more_games = () => {
  const results_label = document.getElementById("results-label");

  results_label.textContent =
    games.length != 1 ? `(${games.length} results)` : "(1 result)";

  if (window.location.pathname.includes("/search")) {
    // Load more search results
  } else if (window.location.pathname.includes("/category")) {
    // Load more category results
  }
};

const load_games = async () => {
  const get_games_list = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/list_games";

  if (window.location.pathname.includes("/search")) {
    const results_label = document.getElementById("results-label");
    // Show the search results
  } else if (window.location.pathname.includes("/category")) {
    const results_label = document.getElementById("results-label");
    // Show the category results
  } else {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const perPage = 30;

    const fresh_games_options = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "asc",
        sortColumn: "created_at",
        perPage: perPage,
        page: 1,
        publicOnly: true,
      })
    }

    const hot_games_options = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "desc",
        sortColumn: "updated",
        perPage: perPage,
        page: 1,
        publicOnly: true,
      })
    }

    const sponsored_games_options = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "desc",
        sortColumn: "sponsor_money",
        perPage: perPage,
        page: 1,
        publicOnly: true,
      })
    }

    const bestsellers_games_options = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        orderBy: "desc",
        sortColumn: "downloads",
        perPage: perPage,
        page: 1,
        publicOnly: true,
      })
    }

    const fresh_games_list = await request(get_games_list, fresh_games_options, false);
    const hot_games_list = await request(get_games_list, hot_games_options, false);
    const sponsored_games_list = await request(get_games_list, sponsored_games_options, false);
    const bestsellers_games_list = await request(get_games_list, bestsellers_games_options, false);

    display_games(document.getElementById("fresh-games-list"), document.getElementById("fresh-games"), fresh_games_list.games.items);
    display_games(document.getElementById("hot-games-list"), document.getElementById("hot-games"), hot_games_list.games.items);
    display_games(document.getElementById("sponsored-games-list"), document.getElementById("sponsored-games"), sponsored_games_list.games.items);
    display_games(document.getElementById("bestseller-games-list"), document.getElementById("bestseller-games"), bestsellers_games_list.games.items);
  }
};

const fetch_games = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const price_request_options = {
    method: "GET",
    headers: myHeaders,
  };

  const set_prices = async () => {
    const result = await request(
      get_prices,
      price_request_options,
      true,
    );

    if (result) {
      prices = result.data;
    }
  };

  await set_prices();

  if (window.location.pathname.includes("/dashboard")) {
    await load_dashboard();
  } else if (window.location.pathname.includes("/user")) {
    const user_id = urlParams.get("id");
    await load_user_games(user_id);
  } else {
    await load_games();
  }

  if (genres.length > 0 && document.getElementById("genres-list") != null) {
    //set_genre_relevancy();
    load_genres();
  }

  if (prices.length > 0) {
    prices.sort((a, b) => b.unit_amount - a.unit_amount);
  }
};

const set_search = () => {
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
};

const set_category = () => {
  if (window.location.pathname.includes("/category")) {
    const search_label = document.getElementById("search-label");
    search_label.textContent = `Top '${category_name}' Games`;
  }
};

const on_scroll = () => {
  if (
    window.location.pathname.includes("/search") ||
    window.location.pathname.includes("/category")
  ) {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 100) {
      page += 1;
      load_more_games();
    }
  }
};

fetch_games();
set_search();
set_category();

window.addEventListener("scroll", () => on_scroll());
