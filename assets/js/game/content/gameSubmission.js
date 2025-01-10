// Handles game submissions

import { user } from "../../user/userManager.js";
import { request } from "../../base/apiManager.js";
import { endpoints } from "../../other/endpoints.js";

const myHeaders = new Headers({ "Content-Type": "application/json" });
const uploadGame = document.getElementById("upload-game");
const uploadButton = document.getElementById("upload-button");
const error_label = document.getElementById("error-label");
const game_file_warn = document.getElementById("game-file-warn");

const game_thumbnail = document.getElementById("thumbnail");
const game_price = document.getElementById("price");
const genre_input = document.getElementById("genre-input");
const game_isfree = document.getElementById("isfree");
const game_art = document.getElementById("art-style-input");
const download_file = document.getElementById("download-file");
const game_description = document.getElementById("description");

const uploader_name = user.name, uploader_id = user.id;

const maxDescriptionCharacters = 4000;
const minPrice = 1, maxPrice = 5000;
const maxFileSize = 5; // GB

// Format the file size
const format_file_size = (fileSizeInBytes) => {
  const units = ["KB", "MB", "GB"];
  const size = fileSizeInBytes < 1024 ? fileSizeInBytes : 
               fileSizeInBytes < Math.pow(1024, 2) ? fileSizeInBytes / 1024 : 
               fileSizeInBytes / Math.pow(1024, 2);
  return `${size.toFixed(2)} ${units[Math.floor(Math.log(size) / Math.log(1024))]}`;
};

// Request to upload the game
const upload_game = async (gameRequestOptions) => {
  const result = await request(endpoints.game.create_game, gameRequestOptions, true);
  return result;
};

// TODO: Create game product and price when uploaded.

// Request to submit the game
const on_submit = async (event) => {
  event.preventDefault();

  uploadButton.disabled = true; // Prevent spamming the button

  // Make sure everything is up to date
  update_thumbnail();
  update_file_size();
  update_price();

  if (!game_file_warn.innerText) { // If there is no file error
    const inputs = {
      title: document.getElementById("title").value,
      description: DOMPurify.sanitize(game_description.innerHTML), // Sanitize the description
      summary: document.getElementById("summary").value,
      thumbnail: game_thumbnail.files[0],
      file: download_file.files[0],
      price: game_price.value,
      currency: document.getElementById("currency-sort").value.toUpperCase(),
      isFree: game_isfree.checked,
      genre: genre_input.value.toUpperCase(),
      artStyle: game_art.value.toUpperCase(),
      ageRating: document.getElementById("age-sort").value,
      features: ["single-player", "multi-player", "co-op", "achievements", "controller-support", "saves"].map(id => document.getElementById(id).checked),
      platforms: ["windows", "mac", "linux", "android", "ios", "xbox", "playstation", "oculus"].map(id => document.getElementById(id).checked),
    };

    const file_size = format_file_size(inputs.file.size);

    // Wait for the image to load
    const imageURI = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(inputs.thumbnail);
    });

    error_label.textContent = "Creating game page...";
    const gameRequestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        name: inputs.title,
        description: inputs.description,
        developer: { username: uploader_name, id: uploader_id },
        file_name: inputs.file.name,
        summary: inputs.summary,
        genre: inputs.genre,
        artstyle: inputs.artStyle,
        age_rating: inputs.ageRating,
        size: Math.round(file_size),
        defaultColors: true,
        icon: imageURI,
        pricing: { price: inputs.price, free: inputs.isFree, currency: inputs.currency },
        platforms: Object.fromEntries(inputs.platforms.map((enabled, index) => [inputs.platforms[index], enabled])),
        features: Object.fromEntries(inputs.features.map((enabled, index) => [inputs.features[index], enabled])),
      }),
    };

    const game = await upload_game(gameRequestOptions);
    if (game.ok) {
        window.location.assign("dashboard");
    } else {
        error_label.textContent = game.response;
    }
  } else {
    error_label.textContent = "Incomplete form.";
  }

  uploadButton.disabled = false;
};

// Update the preview image
const update_thumbnail = () => {
  const reader = new FileReader();
  const file = game_thumbnail.files[0];
  reader.onload = () => document.getElementById("previewImage").src = reader.result;
  if (file) reader.readAsDataURL(file);
};

// Update the file size
const update_file_size = () => {
  const file = download_file.files[0];
  if (file.size / Math.pow(1024, 3) > maxFileSize) {
    game_file_warn.textContent = "File size too large, select a file under 5GB";
    download_file.value = "";
  } else {
    game_file_warn.textContent = "";
  }
};

// Update the prices
const update_price = () => {
  game_price.value = game_isfree.checked ? 0 : Math.min(maxPrice, Math.max(minPrice, game_price.value.replace(/[^0-9]/g, "")));
};

const update_genre = () => genre_input.value = genre_input.value.toUpperCase();
const update_art = () => game_art.value = game_art.value.toUpperCase();
const update_description = () => {
  const text = DOMPurify.sanitize(game_description.innerHTML);
  game_description.innerHTML = text.length > maxDescriptionCharacters ? text.substr(0, maxDescriptionCharacters) : text;
};

game_description.addEventListener("input", update_description);
game_price.addEventListener("input", update_price);
genre_input.addEventListener("input", update_genre);
game_art.addEventListener("input", update_art);
download_file.addEventListener("change", update_file_size);
game_thumbnail.addEventListener("change", update_thumbnail);
game_isfree.addEventListener("change", update_price);
uploadGame.addEventListener("submit", async () => await on_submit());