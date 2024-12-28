const DATABASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv";
const PRODUCTS_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E";
const PRICES_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-";
const CHECKOUT_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:nrRyaavp";

const API_VERSION = "v1";
const API_BASE_URL = `${DATABASE_URL}/${API_VERSION}`;

export const endpoints = {
  user: {
    list_public_games: `${API_BASE_URL}/user/games/public/`,
    list_games: `${API_BASE_URL}/user/games/`,
    edit_email: `${API_BASE_URL}/user/edit_email/`, // + user session
    edit_password: `${API_BASE_URL}/user/edit_pass/`, // + user session
    edit_status: `${API_BASE_URL}/user/edit_status/`, // + user session
    get_data_with_id: `${API_BASE_URL}/user/id/`, // + user ID
    get_data_with_sess: `${API_BASE_URL}/user/session/`, // + user session
    signup: `${API_BASE_URL}/auth/signup/`,
    login: `${API_BASE_URL}/auth/login/`,
  },
  game: {
    create: `${API_BASE_URL}/games/create/`,
    remove: `${API_BASE_URL}/games/remove/`, // + game ID
    update: `${API_BASE_URL}/games/edit/`,
    getData: `${API_BASE_URL}/games/`, // + game ID
    create_product: `${PRODUCTS_BASE_URL}/products/create`,
    get_product: `${PRODUCTS_BASE_URL}/products/view/`, // + product ID
    update_price: `${PRICES_BASE_URL}/prices/edit/`, // + price ID
    get_price: `${PRICES_BASE_URL}/prices/view/`, // + price ID
    create_price: `${PRICES_BASE_URL}/prices/create`,
    create_payment_link: `${CHECKOUT_BASE_URL}/payment_link`,
  },
  list: {
    list_games: `${API_BASE_URL}/games/list`,
    list_free_games: `${API_BASE_URL}/games/list/free`,
    list_prices: `${PRICES_BASE_URL}/prices/list`,
    list_blog: "https://x8ki-letl-twmt.n7.xano.io/api:fcT2v9YQ/posts",
  },
};