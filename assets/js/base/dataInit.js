// Handles initializing game displaying depending on the page

import {
  fetchGames,
  loadSearchGames,
  loadGenreSearchGames,
  loadDashboard,
} from "./dataManager.js";

const pathName = window.location.pathname;

if (pathName.includes("dashboard")) {
  loadDashboard();
} else if (pathName.includes("search")) {
  loadSearchGames();
} else if (pathName.includes("category")) {
  loadGenreSearchGames();
} else {
  fetchGames();
}
