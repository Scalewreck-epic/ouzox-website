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
switch (true) {
  case pathName.includes("dashboard"):
    loadDashboard();
    break;
  case pathName.includes("search"):
    loadSearchGames();
    break;
  case pathName.includes("category"):
    loadGenreSearchGames();
    break;
  default:
    fetchGames();
}