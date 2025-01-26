/**
 * @file dataInit.js
 * @description Handles the initialization of game displays depending on the current page.
 * This module imports necessary functions to fetch and display games based on the user's navigation.
 */

import {
  fetchGames,
  loadSearchGames,
  loadGenreSearchGames,
  loadDashboard,
} from "./dataManager.js";

/**
 * Initializes the game display based on the current page.
 * It checks the pathname of the window location and calls the appropriate function:
 * - loadDashboard() for the dashboard page
 * - loadSearchGames() for the search page
 * - loadGenreSearchGames() for the category page
 * - fetchGames() for all other pages
 */
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
