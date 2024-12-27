import { fetch_user } from "../../user/sessionManager.js";
import { request } from "../../base/apiManager.js";
import { endpoints } from "../../other/endpoints.js";

const myHeaders = new Headers({ "Content-Type": "application/json" });
const { name: uploader_name, id: uploader_id } = await fetch_user();
const uploadGame = document.getElementById("upload-game");

const game_thumbnail = document.getElementById("thumbnail");
const game_price = document.getElementById("price");
const genre_input = document.getElementById("genre-input");
const game_isfree = document.getElementById("isfree");
const game_art = document.getElementById("art-style-input");
const download_file = document.getElementById("download-file");
const game_description = document.getElementById("description");

const format_file_size = (fileSizeInBytes) => {
  const units = ["KB", "MB", "GB"];
  const size = fileSizeInBytes < 1024 ? fileSizeInBytes : 
               fileSizeInBytes < Math.pow(1024, 2) ? fileSizeInBytes / 1024 : 
               fileSizeInBytes / Math.pow(1024, 2);
  return `${size.toFixed(2)} ${units[Math.floor(Math.log(size) / Math.log(1024))]}`;
};

const upload_game = async (gameRequestOptions) => {
  const result = await request(endpoints.game.create_game, gameRequestOptions, true);
  return result.ok ? result.response : null;
};

// TODO: Use create_product_price and set_product_price when the game is not free
const crate_product_price = async (product_id, currency, unit_amount) => {
  const price = {
    currency: currency,
    unit_amount: unit_amount,
    active: false,
    product: product_id,
  }

  const priceRequestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      price: price,
    }),
  };

  const result = await request(endpoints.game.create_price, priceRequestOptions, true);
  return result.ok ? result.response : null;
}

const set_product_price = async (product_id) => {
  const priceRequestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      price: {
        currency,
        unit_amount: price_input.value * 100,
        product: product_id,
        recurring: {},
        product_data: {},
      },
    }),
  };

  const result = await request(endpoints.game.update_price, priceRequestOptions, true);
  return result.ok ? result.response : null;
};

const upload_product = async () => {
  const result = await request(endpoints.game.create_product, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ product: { name: title_input.value, active: "false" } }),
  }, true);
  
  return result.ok ? result.response : null;
};

const upload_payment_link = async (price_id) => {
  const result = await request(endpoints.game.create_payment_link, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ line_items: [{ price: price_id, quantity: 1 }] }),
  }, true);
  
  return result.ok ? result.response : null;
};

const on_submit = async (event) => {
  event.preventDefault();
  const error_label = document.getElementById("error-label");
  const game_file_warn = document.getElementById("game-file-warn");

  update_thumbnail();
  update_file_size();
  update_price();

  if (!game_file_warn.innerText) {
    const inputs = {
      title: document.getElementById("title").value,
      description: DOMPurify.sanitize(game_description.innerHTML),
      summary: document.getElementById("summary").value,
      thumbnail: game_thumbnail.files[0],
      file: download_file.files[0],
      price: game_price.value,
      currency: document.getElementById("currency-sort").value,
      isFree: game_isfree.checked,
      genre: genre_input.value.toUpperCase(),
      artStyle: game_art.value.toUpperCase(),
      ageRating: document.getElementById("age-sort").value,
      features: ["single-player", "multi-player", "co-op", "achievements", "controller-support", "saves"].map(id => document.getElementById(id).checked),
      platforms: ["windows", "mac", "linux", "android", "ios", "xbox", "playstation", "oculus"].map(id => document.getElementById(id).checked),
    };

    const file_size = format_file_size(inputs.file.size);
    const imageURI = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(inputs.thumbnail);
    });

    error_label.textContent = "Creating game page...";
    const product_result = inputs.price > 0 ? await upload_product() : null;

    const gameRequestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        name: inputs.title,
        free: inputs.isFree,
        description: inputs.description,
        developer: { username: uploader_name, id: uploader_id },
        file_name: inputs.file.name,
        summary: inputs.summary,
        genre: inputs.genre,
        artstyle: inputs.artStyle,
        age_rating: inputs.ageRating,
        size: Math.round(file_size),
        defaultColors: true,
        icon_upload: imageURI,
        product_id: product_result ? product_result.id : "none",
        payment_link: product_result ? await upload_payment_link(product_result.id) : "none",
        platforms: Object.fromEntries(inputs.platforms.map((enabled, index) => [inputs.platforms[index], enabled])),
        features: Object.fromEntries(inputs.features.map((enabled, index) => [inputs.features[index], enabled])),
      }),
    };

    const game = await upload_game(gameRequestOptions);
    error_label.textContent = game && (!product_result || (product_result.active && game)) ? "Successfully published game!" : "Error publishing game.";
  } else {
    error_label.innerHTML = "Incomplete form.";
  }
};

const update_thumbnail = () => {
  const reader = new FileReader();
  const file = game_thumbnail.files[0];
  reader.onload = () => document.getElementById("previewImage").src = reader.result;
  if (file) reader.readAsDataURL(file);
};

const update_file_size = () => {
  const file = download_file.files[0];
  const warn = document.getElementById("game-file-warn");
  if (file.size / Math.pow(1024, 3) > 5) {
    warn.innerHTML = "File size too large, select a file under 5GB";
    download_file.value = "";
  } else {
    warn.innerHTML = "";
  }
};

const update_price = () => {
  const minPrice = 1, maxPrice = 5000;
  game_price.value = game_isfree.checked ? 0 : Math.min(maxPrice, Math.max(minPrice, game_price.value.replace(/[^0-9]/g, "")));
};

const update_genre = () => genre_input.value = genre_input.value.toUpperCase();
const update_art = () => game_art.value = game_art.value.toUpperCase();
const update_description = () => {
  const text = DOMPurify.sanitize(game_description.innerHTML);
  game_description.innerHTML = text.length > 4000 ? text.substr(0, 4000) : text;
};

const init = () => {
  update_description();
  update_price();
  update_genre();
  update_art();
  update_free();
};

game_description.addEventListener("input", update_description);
game_price.addEventListener("input", update_price);
genre_input.addEventListener("input", update_genre);
game_art.addEventListener("input", update_art);
download_file.addEventListener("change", update_file_size);
game_thumbnail.addEventListener("change", update_thumbnail);
game_isfree.addEventListener("change", update_price);
uploadGame.addEventListener("submit", async () => await on_submit());

init();