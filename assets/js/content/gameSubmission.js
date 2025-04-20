/**
 * @file gameSubmission.js
 * @description Handles game submissions, including uploading game files and managing user interactions.
 * This module manages the submission process for new games.
 */

import { cookie } from "../base/userManager.js";
import { request } from "../util/apiManager.js";
import { endpoints } from "../util/endpoints.js";

const myHeaders = new Headers({ "Content-Type": "application/json" });
const uploadGameForm = document.getElementById("upload-game");
const uploadButton = document.getElementById("upload-button");
const error_label = document.getElementById("error-label");

const game_thumbnail = document.getElementById("thumbnail");
const game_price = document.getElementById("price");
const game_isfree = document.getElementById("isfree");
const game_refund_timeframe = document.getElementById("refund-timeframe");
const game_refund_percentage = document.getElementById("refund-percentage");
const genre_input = document.getElementById("genre-input");
const download_file = document.getElementById("download-file");
const game_description = document.getElementById("description");
const gameAgreement = document.getElementById("policy-agreement");

const platformIds = ["windows", "mac", "linux", "android", "ios", "xbox", "playstation", "oculus"];
const featureIds = ["Singleplayer", "Multiplayer", "Co1op", "Achievements", "Controller_Support", "VR_Support", "Saves"];

const options = {
    modules: {
        toolbar: true,
    },
    placeholder: 'Your game',
    theme: 'snow',
}

new Quill(game_description, options);

const maxDescriptionCharacters = 4000;
const minPrice = 1;
const maxPrice = 5000;
const maxFileSize = 5; // GB
const files = [];

/** TODO:
 * Create game product and price when uploaded.
 */

/**
 * Formats the file size to make it readable.
 * @param {number} fileSizeInBytes - The file size in bytes
 * @returns {string} - The readable file size
 */
const formatFileSize = (fileSizeInBytes) => {
  if (fileSizeInBytes < 1024) {
      return `${fileSizeInBytes} Bytes`;
  }
  const kb = fileSizeInBytes / 1024;
  if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
  }
  const mb = kb / 1024;
  if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
  }
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

/**
 * Requests to create a new game.
 * @param {object} gameRequestOptions
 * @returns
 */
const uploadGame = async (gameRequestOptions) => {
  const result = await request(
    `${endpoints.game.create}${cookie}`,
    gameRequestOptions,
    false
  );
  return result;
};

const validateSubmit = () => {
  if (!gameAgreement.checked) {
      error_label.textContent = "You did not agree to the Quality Guidelines and Content Policy";
      return false;
  }
  if (files.length === 0) {
      error_label.textContent = "No game file detected";
      return false;
  }
  // Use .textContent or check Quill's API for length
  const descriptionContent = game_description.querySelector('.ql-editor')?.textContent.trim() || '';
  if (descriptionContent.length === 0) {
      error_label.textContent = "No description detected";
      return false;
  }
  // Add other checks (thumbnail, etc.)
  error_label.textContent = ""; // Clear errors if all pass
  return true;
}

/**
 * Handles submitting the game.
 */
const onSubmit = async () => {
  uploadButton.disabled = true; // Prevent spamming the button

  // Make sure everything is up to date.
  updatePrice();
  updateRefund();
  updateThumbnail();

  if (!validateSubmit()) {
    uploadButton.disabled = false;
    return;
  };

  const inputs = {
    title: document.getElementById("title").value,
    description: DOMPurify.sanitize(game_description.getElementsByClassName("ql-editor")[0].innerHTML), // Sanitize the description before upload.
    summary: document.getElementById("summary").value,
    thumbnail: game_thumbnail.files[0],
    price: game_price.value,
    currency: document.getElementById("currency-sort").value.toUpperCase(),
    isFree: game_isfree.checked,
    refundTimeframe: game_refund_timeframe.value,
    refundPercentage: game_refund_percentage.value,
    genre: genre_input.value.toLowerCase(),
    ageRating: document.getElementById("age-sort").value,
    features: Object.fromEntries(
      featureIds.map((id, index) => [id, inputs.features[index]])
    ),
    platforms: Object.fromEntries(
      platformIds.map((id, index) => [id, inputs.platforms[index]])
    ),
  };

  // Wait for the image to load.
  const imageURI = await new Promise((resolve) => {
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
      summary: inputs.summary,
      genre: inputs.genre,
      age_rating: inputs.ageRating,
      defaultColors: true,
      icon_upload: imageURI,
      pricing: {
        price: inputs.price,
        free: inputs.isFree,
        currency: inputs.currency,
      },
      refund_policy: {
        timeframe: inputs.refundTimeframe,
        percentage: inputs.refundPercentage,
      },
      platforms: inputs.platforms,
      features: inputs.features,
    }),
  };

  const game = await uploadGame(gameRequestOptions);

  if (game.ok) {
    window.location.assign("dashboard");
  } else {
    error_label.textContent = game.response;
  }

  uploadButton.disabled = false;
};

const newFilePreview = (file) => {
  const filesList = document.getElementById("files-list");

  const fileCardDiv = document.createElement("div");
  const fileNameDiv = document.createElement("div");
  const fileSizeDiv = document.createElement("div");

  fileCardDiv.classList.add("file-card");
  fileNameDiv.classList.add("file-name");
  fileSizeDiv.classList.add("file-size");

  fileNameDiv.textContent = file.name;
  fileSizeDiv.textContent = formatFileSize(file.size);

  fileCardDiv.addEventListener("click", () => {
    const fileIndex = files.findIndex((fle) => fle.name == file.name);
    fileCardDiv.remove();
    files.splice(fileIndex, 1);
  });

  fileCardDiv.appendChild(fileNameDiv);
  fileCardDiv.appendChild(fileSizeDiv);

  filesList.appendChild(fileCardDiv);
};

/**
 * Previews the thumbnail on input change.
 */
const updateThumbnail = () => {
  const reader = new FileReader();
  const file = game_thumbnail.files[0];
  reader.onload = () =>
    (document.getElementById("previewImage").src = reader.result);
  if (file) reader.readAsDataURL(file);
};

/**
 * Handles uploading files.
 */
const updateFiles = () => {
  const file = download_file.files[0];
  const isAboveMaxSize = file.size / Math.pow(1024, 3) > maxFileSize;
  const isAlreadyUploaded =
    files.findIndex((fle) => fle.name == file.name) !== -1;

  const fileErrorLabel = document.getElementById("file-error-label");

  let canUpload = true;

  if (isAboveMaxSize) {
    fileErrorLabel.textContent = "File size too large, select a file under 5GB";
    canUpload = false;
  }

  if (isAlreadyUploaded) {
    fileErrorLabel.textContent =
      "File already uploaded, select a different file";
    canUpload = false;
  }

  if (canUpload) {
    files.push(file);
    newFilePreview(file);
    fileErrorLabel.textContent = "";
  }

  download_file.value = "";
};

/**
 * Handles refund minimum and maximum values for timeframe and percentage.
 */
const updateRefund = () => {
  game_refund_percentage.value = Math.min(
    100,
    Math.max(25, game_refund_percentage.value.replace(/[^0-9]/g, ""))
  );
  game_refund_timeframe.value = Math.max(
    1,
    game_refund_timeframe.value.replace(/[^0-9]/g, "")
  );
};

/**
 * Handles price minimum and maximum values.
 */
const updatePrice = () => {
  game_price.value = game_isfree.checked
    ? 0
    : Math.min(
        maxPrice,
        Math.max(minPrice, game_price.value.replace(/[^0-9]/g, ""))
      );
};

const updateGenre = () => (genre_input.value = genre_input.value.toUpperCase());
const updateDescription = () => {
  const text = game_description.innerHTML;
  if (text.length > maxDescriptionCharacters) {
    game_description.innerHTML = text.substring(0, maxDescriptionCharacters);
  }
};

game_description.addEventListener("input", updateDescription);
game_price.addEventListener("input", updatePrice);
game_isfree.addEventListener("change", updatePrice);
game_refund_percentage.addEventListener("input", updateRefund);
game_refund_timeframe.addEventListener("input", updateRefund);
genre_input.addEventListener("input", updateGenre);
download_file.addEventListener("change", updateFiles);
game_thumbnail.addEventListener("change", updateThumbnail);
uploadGameForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await onSubmit();
});
