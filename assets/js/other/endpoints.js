const DATABASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv";
const PRODUCTS_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E";
const PRICES_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-";
const CHECKOUT_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:nrRyaavp";

export const endpoints = {
  user: {
    list_public_games: `${DATABASE_URL}/user/games/public/`,
    list_games: `${DATABASE_URL}/user/games/`,
    edit_email: `${DATABASE_URL}/user/edit_email/`, // + user session
    edit_password: `${DATABASE_URL}/user/edit_pass/`, // + user session
    edit_status: `${DATABASE_URL}/user/edit_status/`, // + user session
    get_data_with_id: `${DATABASE_URL}/user/id/`, // + user ID
    get_data_with_sess: `${DATABASE_URL}/user/session/`, // + user session
    signup: `${DATABASE_URL}/auth/signup/`,
    login: `${DATABASE_URL}/auth/login/`,
  },
  game: {
    create: `${DATABASE_URL}/games/create/`,
    remove: `${DATABASE_URL}/games/remove/`, // + game ID
    update: `${DATABASE_URL}/games/edit/`,
    get_data: `${DATABASE_URL}/games/`, // + game ID
    create_product: `${PRODUCTS_BASE_URL}/products/create`,
    get_product: `${PRODUCTS_BASE_URL}/products/view/`, // + product ID
    update_price: `${PRICES_BASE_URL}/prices/edit/`, // + price ID
    get_price: `${PRICES_BASE_URL}/prices/view/`, // + price ID
    create_price: `${PRICES_BASE_URL}/prices/create`,
    create_payment_link: `${CHECKOUT_BASE_URL}/payment_link`,
  },
  list: {
    list_games: `${DATABASE_URL}/games/list`,
    list_free_games: `${DATABASE_URL}/games/list/free`,
    list_prices: `${PRICES_BASE_URL}/prices/list`,
    list_blog: "https://x8ki-letl-twmt.n7.xano.io/api:fcT2v9YQ/posts",
  },
};