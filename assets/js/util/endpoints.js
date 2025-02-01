/**
 * @file endpoints.js
 * @description This module defines and exports a set of API endpoints for the Ouzox application.
 * The endpoints are categorized into user, checkout, price, product, game, and blog functionalities.
 * Each endpoint is constructed using base URLs and can be extended with specific parameters.
 */

const DATABASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv";
const PRODUCTS_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E";
const PRICES_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-";
const BLOG_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:fcT2v9YQ";
const CHECKOUT_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:nrRyaavp";

// Add payment links
export const endpoints = {
  user: {
    /**
     * @endpoint list_public_games
     * @description Retrieves a list of public games for a specific user.
     * @param {string} userId - The ID of the user.
     */
    list_public_games: `${DATABASE_URL}/user/games/public/`, // + user ID

    /**
     * @endpoint list_games
     * @description Retrieves a list of games associated with the user's session.
     * @param {string} sessionId - The session ID of the user.
     */
    list_games: `${DATABASE_URL}/user/games/`, // + user session

    /**
     * @endpoint edit_email
     * @description Edits the email address of the user.
     * @param {string} sessionId - The session ID of the user.
     */
    edit_email: `${DATABASE_URL}/user/edit_email/`, // + user session

    /**
     * @endpoint edit_password
     * @description Edits the password of the user.
     * @param {string} sessionId - The session ID of the user.
     */
    edit_password: `${DATABASE_URL}/user/edit_pass/`, // + user session

    /**
     * @endpoint edit_status
     * @description Edits the status of the user.
     * @param {string} sessionId - The session ID of the user.
     */
    edit_status: `${DATABASE_URL}/user/edit_status/`, // + user session

    /**
     * @endpoint get_data_with_id
     * @description Retrieves user data based on user ID.
     * @param {string} userId - The ID of the user.
     */
    get_data_with_id: `${DATABASE_URL}/user/id/`, // + user ID

    /**
     * @endpoint get_data_with_sess
     * @description Retrieves user data based on user session.
     * @param {string} sessionId - The session ID of the user.
     */
    get_data_with_sess: `${DATABASE_URL}/user/session/`, // + user session

    /**
     * @endpoint signup
     * @description Signs up a new user.
     */
    signup: `${DATABASE_URL}/auth/signup`,

    /**
     * @endpoint login
     * @description Logs in an existing user.
     */
    login: `${DATABASE_URL}/auth/login`,
  },
  checkout: {
    /**
     * @endpoint create
     * @description Creates a new checkout session.
     */
    create: `${CHECKOUT_BASE_URL}/sessions/create`,

    /**
     * @endpoint retrieve
     * @description Retrieves a checkout session by session ID.
     * @param {string} sessionId - The ID of the session to retrieve.
     */
    retrieve: `${CHECKOUT_BASE_URL}/sessions/retrieve/`, // + session ID
  },
  price: {
    /**
     * @endpoint create
     * @description Creates a new price entry.
     */
    create: `${PRICES_BASE_URL}/prices/create`,

    /**
     * @endpoint edit
     * @description Edits an existing price entry.
     * @param {string} priceId - The ID of the price to edit.
     */
    edit: `${PRICES_BASE_URL}/prices/edit/`, // + price ID

    /**
     * @endpoint view
     * @description Views a specific price entry.
     * @param {string} priceId - The ID of the price to view.
     */
    view: `${PRICES_BASE_URL}/prices/view/`, // + price ID

    /**
     * @endpoint list
     * @description Lists all price entries.
     */
    list: `${PRICES_BASE_URL}/prices/list`,
  },
  product: {
    /**
     * @endpoint create
     * @description Creates a new product entry.
     */
    create: `${PRODUCTS_BASE_URL}/products/create`,

    /**
     * @endpoint edit
     * @description Edits an existing product entry.
     * @param {string} productId - The ID of the product to edit.
     */
    edit: `${PRODUCTS_BASE_URL}/products/edit/`, // + product ID

    /**
     * @endpoint view
     * @description Views a specific product entry.
     * @param {string} productId - The ID of the product to view.
     */
    view: `${PRODUCTS_BASE_URL}/products/view/`, // + product ID

    /**
     * @endpoint remove
     * @description Removes a specific product entry.
     * @param {string} productId - The ID of the product to remove.
     */
    remove: `${PRICES_BASE_URL}/products/remove`, // + product ID
  },
  game: {
    /**
     * @endpoint create
     * @description Creates a new game entry.
     * @param {string} sessionId - The session ID of the user.
     */
    create: `${DATABASE_URL}/games/create/`, // + user session

    /**
     * @endpoint remove
     * @description Removes a specific game entry.
     * @param {string} gameId - The ID of the game to remove.
     * @param {string} sessionId - The session ID of the user.
     */
    remove: `${DATABASE_URL}/games/remove/`, // + game ID + user session

    /**
     * @endpoint update
     * @description Updates a specific game entry.
     * @param {string} gameId - The ID of the game to update.
     * @param {string} sessionId - The session ID of the user.
     */
    update: `${DATABASE_URL}/games/edit/`, // + game ID + user session

    /**
     * @endpoint view
     * @description Views a specific game entry.
     * @param {string} gameId - The ID of the game to view.
     */
    view: `${DATABASE_URL}/games/view/`, // + game ID

    /**
     * @endpoint list_frontpage
     * @description Lists games for the front page.
     */
    list_frontpage: `${DATABASE_URL}/games/list/frontpage`,

    /**
     * @endpoint list_genresearch
     * @description Lists games by genre.
     * @param {string} genreName - The name of the genre.
     */
    list_genresearch: `${DATABASE_URL}/games/list/genre/`, // + genre name + current page

    /**
     * @endpoint list_search
     * @description Searches for games based on a query.
     * @param {string} searchQuery - The search query.
     */
    list_search: `${DATABASE_URL}/games/search/`, // + search query + current page
  },
  blog: {
    /**
     * @endpoint list
     * @description Lists all blog posts.
     */
    list: `${BLOG_BASE_URL}/posts`,
  },
};
