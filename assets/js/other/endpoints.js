// Shows all endpoints from database.

const DATABASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv";
const PRODUCTS_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E";
const PRICES_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-";
const BLOG_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:fcT2v9YQ";
const CHECKOUT_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:nrRyaavp";

// Add payment links
export const endpoints = {
  user: {
    list_public_games: `${DATABASE_URL}/user/games/public/`,
    list_games: `${DATABASE_URL}/user/games/`,
    edit_email: `${DATABASE_URL}/user/edit_email/`, // + user session
    edit_password: `${DATABASE_URL}/user/edit_pass/`, // + user session
    edit_status: `${DATABASE_URL}/user/edit_status/`, // + user session
    get_data_with_id: `${DATABASE_URL}/user/id/`, // + user ID
    get_data_with_sess: `${DATABASE_URL}/user/session/`, // + user session
    signup: `${DATABASE_URL}/auth/signup`,
    login: `${DATABASE_URL}/auth/login`,
  },
  checkout: {
    create: `${CHECKOUT_BASE_URL}/sessions/create`,
    retrieve: `${CHECKOUT_BASE_URL}/sessions/retrieve`, // + session ID
  },
  price: {
    create: `${PRICES_BASE_URL}/prices/create`,
    edit: `${PRICES_BASE_URL}/prices/edit/`, // + price ID
    view: `${PRICES_BASE_URL}/prices/view/`, // + price ID
    list: `${PRICES_BASE_URL}/prices/list`,
  },
  product: {
    create: `${PRODUCTS_BASE_URL}/products/create`,
    edit: `${PRODUCTS_BASE_URL}/products/edit/`, // + product ID
    view: `${PRODUCTS_BASE_URL}/products/view/`, // + product ID
    remove: `${PRICES_BASE_URL}/products/remove`, // + product ID
  },
  game: {
    create: `${DATABASE_URL}/games/create/`,
    remove: `${DATABASE_URL}/games/remove/`, // + game ID
    update: `${DATABASE_URL}/games/edit/`,
    view: `${DATABASE_URL}/games/view/`, // + game ID
    list_frontpage: `${DATABASE_URL}/games/list/frontpage`,
    list_genresearch: `${DATABASE_URL}/games/list/genre/`, // + genre name
    list_search: `${DATABASE_URL}/games/search/`, // + search query
  },
  blog: {
    list: `${BLOG_BASE_URL}/posts`,
  },
};
