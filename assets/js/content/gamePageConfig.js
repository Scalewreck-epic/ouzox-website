/**
 * @file gamePageConfig.js
 * @description Handles displaying one game's information.
 * This module manages displaying one individual game page.
 */

import { user, cookie } from "../base/userManager.js";
import { request } from "../util/apiManager.js";
import { endpoints } from "../util/endpoints.js";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g"); // the game ID

/** TODO
 * Update price and currency options in stripe.
 * Make the game file available to download
 */

const maxDescriptionCharacters = 4000;
const minPrice = 1,
  maxPrice = 5000;
const maxFileSize = 5; // GB
const files = [];

/**
 * @class GameData
 * @description Represents the game's data.
 */
class GameData {
  constructor(
    rawGameData,
    createdFormattedDate,
    updatedFormattedDate,
    datestodays
  ) {
    Object.assign(this, {
      id: rawGameData.id,
      name: rawGameData.name,
      active: rawGameData.active,
      description: rawGameData.description,
      genre: rawGameData.genre,
      summary: rawGameData.summary,
      agerating: rawGameData.age_rating,
      icon: new URL(rawGameData.icon.url),
      paymentLink: rawGameData.paymentLink
        ? new URL(rawGameData.paymentLink)
        : null,
      created: createdFormattedDate,
      updated: updatedFormattedDate,
      datestodays,
      features: rawGameData.features,
      platforms: rawGameData.platforms,
      pricing: rawGameData.pricing,
      refundPolicy: rawGameData.refund_policy,
      download_key: rawGameData.product_id,
      page: rawGameData.page,
      developer: {
        username: rawGameData.developer.username,
        id: rawGameData.developer.id,
      },
    });
  }
}

/**
 * Updates the background color and alpha of an element.
 * @param {number} alphaInput - Transparency of the element.
 * @param {HTMLElement} styleElement - The element we are changing.
 */
const updateBackgroundColor = (alphaInput, styleElement) => {
  const alphaValue = alphaInput / 100;
  const [r, g, b] = getComputedStyle(styleElement)
    .getPropertyValue("background-color")
    .match(/\d+/g)
    .map(Number);
  styleElement.style.setProperty(
    "background-color",
    `rgba(${r}, ${g}, ${b}, ${alphaValue})`
  );
};

/**
 * Retrieves the game data via game ID.
 * @param {number} gameId - The game ID we are retrieving data from.
 */
const getGameData = async (gameId) => {
  const result = await request(
    `${endpoints.game.view}${gameId}`,
    { method: "GET", headers: { "Content-Type": "application/json" } },
    true
  );
  if (result.ok) return result.response;
  throw new Error(`Unable to get game data: ${result}`);
};

/**
 * Modifies the retrieved game data.
 * @param {number} gameId - The game ID we are retrieving data from.
 */
const fetchGameData = async (gameId) => {
  const rawGameData = await getGameData(gameId);
  const createdDate = new Date(rawGameData.created_at);
  const updatedDate = new Date(rawGameData.updated);
  const currentDate = new Date();

  const createdFormattedDate = createdDate.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  const updatedFormattedDate = updatedDate.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  const datestodays = {
    publishedDaysAgo: Math.ceil(
      (currentDate - createdDate) / (1000 * 60 * 60 * 24)
    ),
    updatedDaysAgo: Math.ceil(
      (currentDate - updatedDate) / (1000 * 60 * 60 * 24)
    ),
  };

  return new GameData(
    rawGameData,
    createdFormattedDate,
    updatedFormattedDate,
    datestodays
  );
};

/**
 * Formats the file size to make it readable.
 * @param {number} fileSizeInBytes - The file size in bytes.
 */
const formatFileSize = (fileSizeInBytes) => {
  const units = ["KB", "MB", "GB"];
  const size =
    fileSizeInBytes < 1024
      ? fileSizeInBytes
      : fileSizeInBytes < Math.pow(1024, 2)
      ? fileSizeInBytes / 1024
      : fileSizeInBytes / Math.pow(1024, 2);
  return `${size.toFixed(2)} ${
    units[Math.floor(Math.log(size) / Math.log(1024))]
  }`;
};

/**
 * Previews the file when trying to upload one.
 * @param {File} file - The uploaded file.
 */
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

  fileCardDiv.appendChild(fileNameDiv);
  fileCardDiv.appendChild(fileSizeDiv);

  filesList.appendChild(fileCardDiv);
};

/**
 * Requests to overrite the game's original data with a new one.
 * @param {object} data - The new game data
 * @param {number} gameId - The game's ID to the one we're trying to update.
 * @param {HTMLButtonElement} - The button used to call the function.
 */
const updateGame = async (data, gameId, commitChangesButton) => {
  const result = await request(
    `${endpoints.game.update}${gameId}/${cookie}`,
    data,
    false
  );
  commitChangesButton.textContent = result.ok ? "Success" : result.response;
};

/**
 * Requests to delete's the game
 * @param {number} gameId - The game's ID to the one we're trying to remove.
 */
const removeGame = async (gameId) => {
  const deleteOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

  await request(`${endpoints.game.remove}${gameId}/${cookie}`, deleteOptions);
};

/**
 * Formats the time to make it readable.
 * @param {number} timeago - The amount of days since today.
 * @param {string} date - The exact date.
 * @param {string} unit - Time displaying unit (days, weeks, months, years).
 */
const formatTimeSingle = (timeago, date, unit) =>
  `${date} (${timeago} ${unit}${timeago === 1 ? "" : "s"} Ago)`;
const formatTime = (coru, yearsAgo, monthsAgo, weeksAgo, daysAgo) => {
  if (yearsAgo >= 1) return formatTimeSingle(yearsAgo, coru, "Year");
  if (monthsAgo >= 1) return formatTimeSingle(monthsAgo, coru, "Month");
  if (weeksAgo >= 1) return formatTimeSingle(weeksAgo, coru, "Week");
  if (daysAgo >= 1) return formatTimeSingle(daysAgo, coru, "Day");
  return "Just Now";
};

/**
 * Handles all of the game data and editing.
 * @param {number} gameId - The game ID to the game we're trying to display.
 */
const gameHandler = async (gameId) => {
  const gameData = await fetchGameData(gameId);
  const elements = {
    gameTitle: document.getElementById("game-title"),
    gameDesc: document.getElementById("description"),
    created: document.getElementById("created"),
    updated: document.getElementById("updated"),
    navigationTitle: document.getElementById("navigation-title"),
    icon: document.getElementById("icon"),
    developerName: document.getElementById("game-developer-name"),
    downloadButton: document.getElementById("download-button"),
    gameGenre: document.getElementById("game-genre"),
    gameSummary: document.getElementById("game-summary"),
    gameAge: document.getElementById("game-age"),
    gameSize: document.getElementById("game-size"),
    gamePrice: document.getElementById("game-price"),
    gameRefundTimeframe: document.getElementById("game-refund-timeframe"),
    gameRefundPercentage: document.getElementById("game-refund-percentage"),
    gameFeatures: document.getElementById("features"),
    gamePlatforms: document.getElementById("platforms"),
    gameColumn: document.getElementById("game-column"),
    gameTitleColumn: document.getElementById("game-title-column"),
    gameStats: document.getElementById("game-stats"),
    gameDescBackground: document.getElementById("game-description"),
  };

  elements.gameTitle.textContent = gameData.name;
  elements.gameDesc.innerHTML = DOMPurify.sanitize(gameData.description);
  elements.gamePrice.textContent = gameData.pricing.free
    ? "FREE"
    : `${gameData.pricing.price} ${gameData.pricing.currency}`;
  elements.created.textContent = formatTime(
    gameData.created,
    gameData.datestodays.publishedYearsAgo,
    gameData.datestodays.publishedMonthsAgo,
    gameData.datestodays.publishedWeeksAgo,
    gameData.datestodays.publishedDaysAgo
  );
  elements.updated.textContent = formatTime(
    gameData.updated,
    gameData.datestodays.updatedYearsAgo,
    gameData.datestodays.updatedMonthsAgo,
    gameData.datestodays.updatedWeeksAgo,
    gameData.datestodays.updatedDaysAgo
  );
  elements.navigationTitle.textContent = `${gameData.name} By ${gameData.developer.username}`;
  elements.developerName.textContent = gameData.developer.username;
  elements.gameGenre.textContent = gameData.genre.toUpperCase();
  elements.gameSummary.textContent = gameData.summary;
  elements.gameAge.textContent = gameData.agerating.toUpperCase();
  elements.gameRefundPercentage.textContent = `${gameData.refundPolicy.percentage}%`;
  elements.gameRefundTimeframe.textContent = `${gameData.refundPolicy.timeframe} Days`;

  elements.icon.setAttribute("href", gameData.icon.href);
  elements.developerName.setAttribute(
    "href",
    `user?id=${gameData.developer.id}`
  );
  elements.gameGenre.setAttribute(
    "href",
    `category?n=${gameData.genre.toUpperCase()}`
  );

  const features = [
    "Singleplayer",
    "Multiplayer",
    "Co1op",
    "Achievements",
    "Controller_Support",
    "Saves",
    "VR_Support",
  ].map((name) => ({ Name: name, Enabled: gameData.features[name] }));
  const platforms = [
    "windows",
    "mac",
    "linux",
    "android",
    "ios",
    "xbox",
    "playstation",
    "oculus",
  ].map((name) => ({
    Name: name.charAt(0).toUpperCase() + name.slice(1),
    Enabled: gameData.platforms[name],
  }));

  const elementAlphas = [
    {
      Amount: gameData.page.alphas.bg2_alpha,
      ElementChanging: elements.gameColumn,
    },
    {
      Amount: gameData.page.alphas.description_bg_alpha,
      ElementChanging: elements.gameDescBackground,
    },
    {
      Amount: gameData.page.alphas.game_details_bg_alpha,
      ElementChanging: elements.gameStats,
    },
  ];

  const elementShadows = [
    {
      Enabled: gameData.page.outlines.game_details_outline,
      ElementChanging: elements.gameStats,
    },
    {
      Enabled: gameData.page.outlines.description_outline,
      ElementChanging: elements.gameDescBackground,
    },
    {
      Enabled: gameData.page.outlines.bg2_outline,
      ElementChanging: elements.gameColumn,
    },
  ];

  const elementOutlines = [
    {
      Enabled: gameData.page.outlines.game_details_shadow,
      ElementChanging: elements.gameStats,
    },
    {
      Enabled: gameData.page.outlines.description_shadow,
      ElementChanging: elements.gameDescBackground,
    },
    {
      Enabled: gameData.page.outlines.bg2_shadow,
      ElementChanging: elements.gameColumn,
    },
  ];

  features.forEach((feature) => {
    if (feature.Enabled) {
      const featureContainer = document.createElement("div");
      featureContainer.setAttribute("class", "game-feature");
      featureContainer.textContent = feature.Name.replace(/_/g, " ").replace(
        /1/g,
        "-"
      );
      elements.gameFeatures.appendChild(featureContainer);
    }
  });

  platforms.forEach((platform) => {
    if (platform.Enabled) {
      const platformContainer = document.createElement("div");
      platformContainer.setAttribute("class", "game-feature");
      platformContainer.textContent = platform.Name;
      elements.gamePlatforms.appendChild(platformContainer);
    }
  });

  elementShadows.forEach((shadow) => {
    shadow.Enabled
      ? shadow.ElementChanging.classList.add("shadow-input")
      : shadow.ElementChanging.classList.remove("shadow-input");
  });

  elementOutlines.forEach((outline) => {
    outline.Enabled
      ? outline.ElementChanging.classList.add("outline-input")
      : outline.ElementChanging.classList.remove("outline-input");
  });

  elementAlphas.forEach((alpha) => {
    updateBackgroundColor(alpha.Amount, alpha.ElementChanging);
  });

  if (!gameData.page.default_colors) {
    // If the page doesn't use the default colors, use the modified ones
    const colors = gameData.page.colors;

    document.body.style.backgroundColor = colors.bg_color;
    elements.gameColumn.style.backgroundColor = colors.bg2_color;
    elements.gameTitleColumn.style.color = colors.title_color;
    elements.gameDesc.style.color = colors.desc_color;
    elements.gameDescBackground.style.backgroundColor = colors.desc_bg_color;
    elements.downloadButton.style.backgroundColor = colors.button_color;
    elements.downloadButton.style.color = colors.button_text_color;
    elements.gameStats.style.backgroundColor = colors.stats_bg_color;
    elements.gameStats.style.color = colors.stats_text_color;

    const linkStyleTag = document.createElement("style");
    linkStyleTag.id = `style-${elements.gameDesc.id}`;
    elements.gameDescBackground.appendChild(linkStyleTag);

    const linkRule = `#${elements.gameDesc.id} a { color: ${colors.link_color};} #${elements.gameDesc.id} a:hover { color: ${colors.link_hover_color}; }`;

    linkStyleTag.textContent = linkRule;

    elements.linkRule = linkRule;
    if (gameData.page.font_family) {
      elements.gameColumn.style.fontFamily = gameData.page.font_family;
    }
  }

  if (user && user.id === gameData.developer.id) {
    // If the user is the game developer, allow access to editing the game
    const editableElements = {
      gameTitleInput: document.getElementById("title-input"),
      gameSummaryInput: document.getElementById("summary-input"),
      gameGenreInput: document.getElementById("genre-input"),
      gameAgeInput: document.getElementById("age-sort"),
      gameThumbnailInput: document.getElementById("thumbnail-input"),
      gameFileInput: document.getElementById("download-file"),
      gamePriceInput: document.getElementById("price"),
      gameIsFreeInput: document.getElementById("isfree"),
      gameRefundTimeframeInput: document.getElementById("refund-timeframe"),
      gameRefundPercentageInput: document.getElementById("refund-percentage"),
      gameCurrencyInput: document.getElementById("currency-sort"),
      fontSort: document.getElementById("font-sort"),
      commitChangesButton: document.createElement("button"),
      deleteButton: document.createElement("button"),
    };

    const colorInputs = [
      {
        Name: "bg_color",
        Element: document.getElementById("bg-color"),
        Property: "background-color",
        ElementChanging: document.body,
      },
      {
        Name: "bg2_color",
        Element: document.getElementById("bg2-color"),
        Property: "background-color",
        ElementChanging: elements.gameColumn,
      },
      {
        Name: "title_color",
        Element: document.getElementById("title-color"),
        Property: "color",
        ElementChanging: elements.gameTitleColumn,
      },
      {
        Name: "desc_color",
        Element: document.getElementById("description-color"),
        Property: "color",
        ElementChanging: elements.gameDesc,
      },
      {
        Name: "desc_bg_color",
        Element: document.getElementById("description-bg-color"),
        Property: "background-color",
        ElementChanging: elements.gameDescBackground,
      },
      {
        Name: "stats_text_color",
        Element: document.getElementById("game-details-color"),
        Property: "color",
        ElementChanging: elements.gameStats,
      },
      {
        Name: "stats_bg_color",
        Element: document.getElementById("game-details-bg-color"),
        Property: "background-color",
        ElementChanging: elements.gameStats,
      },
      {
        Name: "button_color",
        Element: document.getElementById("button-bg-color"),
        Property: "background-color",
        ElementChanging: elements.downloadButton,
      },
      {
        Name: "button_text_color",
        Element: document.getElementById("button-text-color"),
        Property: "color",
        ElementChanging: elements.downloadButton,
      },
    ];

    const alphaInputs = [
      {
        Name: "bg2_alpha",
        Element: document.getElementById("bg2-alpha"),
        Amount: gameData.page.alphas.bg2_alpha,
        ElementChanging: elements.gameColumn,
      },
      {
        Name: "description_bg_alpha",
        Element: document.getElementById("description-bg-alpha"),
        Amount: gameData.page.alphas.description_bg_alpha,
        ElementChanging: elements.gameDescBackground,
      },
      {
        Name: "game_details_bg_alpha",
        Element: document.getElementById("game-details-bg-alpha"),
        Amount: gameData.page.alphas.game_details_bg_alpha,
        ElementChanging: elements.gameStats,
      },
    ];

    const shadowCheckboxes = [
      {
        Name: "game_details_shadow",
        Element: document.getElementById("game-details-shadow-checkbox"),
        Enabled: gameData.page.outlines.game_details_shadow,
        ElementChanging: elements.gameStats,
      },
      {
        Name: "description_shadow",
        Element: document.getElementById("description-shadow-checkbox"),
        Enabled: gameData.page.outlines.description_shadow,
        ElementChanging: elements.gameDescBackground,
      },
      {
        Name: "bg2_shadow",
        Element: document.getElementById("bg2-shadow-checkbox"),
        Enabled: gameData.page.outlines.bg2_shadow,
        ElementChanging: elements.gameColumn,
      },
    ];

    const outlineCheckboxes = [
      {
        Name: "game_details_outline",
        Element: document.getElementById("game-details-outline-checkbox"),
        Enabled: gameData.page.outlines.game_details_outline,
        ElementChanging: elements.gameStats,
      },
      {
        Name: "description_outline",
        Element: document.getElementById("description-outline-checkbox"),
        Enabled: gameData.page.outlines.description_outline,
        ElementChanging: elements.gameDescBackground,
      },
      {
        Name: "bg2_outline",
        Element: document.getElementById("bg2-outline-checkbox"),
        Enabled: gameData.page.outlines.bg2_outline,
        ElementChanging: elements.gameColumn,
      },
    ];

    /**
     * Previews the thumbnail when the input changes
     */
    const thumbnailChanged = () => {
      const reader = new FileReader();
      const file = editableElements.gameThumbnailInput.files[0];
      reader.onload = () =>
        (document.getElementById("previewImage").src = reader.result);
      if (file) reader.readAsDataURL(file);
    };

    /**
     * Handles setting a minimum and maximum price when the input changes
     */
    const priceChanged = () => {
      editableElements.gamePriceInput.value = editableElements.gameIsFreeInput
        .checked
        ? 0
        : Math.min(
            maxPrice,
            Math.max(
              minPrice,
              editableElements.gamePriceInput.value.replace(/[^0-9]/g, "")
            )
          );
    };

    /**
     * Handles setting a minimum and maximum for refund timeframe and percentage
     */
    const updateRefund = () => {
      editableElements.gameRefundPercentageInput.value = Math.min(
        100,
        Math.max(
          25,
          editableElements.gameRefundPercentageInput.value.replace(
            /[^0-9]/g,
            ""
          )
        )
      );
      editableElements.gameRefundTimeframeInput.value = Math.max(
        1,
        editableElements.gameRefundTimeframeInput.value.replace(/[^0-9]/g, "")
      );
    };

    const options = {
      modules: {
        toolbar: true,
      },
      placeholder: "Your game",
      theme: "snow",
    };

    const description = document.getElementById("description");
    new Quill(description, options);

    editableElements.commitChangesButton.setAttribute(
      "class",
      "commit-changes-button"
    );
    editableElements.commitChangesButton.textContent = "Commit Changes";

    editableElements.deleteButton.setAttribute("class", "game-delete-button");
    editableElements.deleteButton.textContent = "Delete Game";

    // Setting all the changable elements to match the current game data.
    editableElements.gameTitleInput.value = gameData.name;
    editableElements.gameSummaryInput.value = gameData.summary;
    editableElements.gameGenreInput.value = gameData.genre.toUpperCase();
    editableElements.gamePriceInput.value = gameData.pricing.price;
    editableElements.gameIsFreeInput.checked = gameData.pricing.free;

    Array.from(editableElements.fontSort.options).forEach((option, i) => {
      if (option.value == gameData.page.font_family.toLowerCase()) {
        editableElements.fontSort.selectedIndex = i;
      }
    });

    Array.from(editableElements.gameAgeInput.options).forEach((option, i) => {
      if (option.value === gameData.agerating.toLowerCase()) {
        editableElements.gameAgeInput.selectedIndex = i;
      }
    });

    Array.from(editableElements.gameCurrencyInput.options).forEach(
      (option, i) => {
        if (option.value === gameData.agerating.toLowerCase()) {
          editableElements.gameCurrencyInput.selectedIndex = i;
        }
      }
    );

    editableElements.gameGenreInput.addEventListener("input", () => {
      editableElements.gameGenreInput.value =
        editableElements.gameGenreInput.value.toUpperCase();
    });

    editableElements.gamePriceInput.addEventListener("input", priceChanged);
    editableElements.gameIsFreeInput.addEventListener("change", priceChanged);
    editableElements.gameRefundPercentageInput.addEventListener(
      "input",
      updateRefund
    );
    editableElements.gameRefundTimeframeInput.addEventListener(
      "input",
      updateRefund
    );

    editableElements.gameTitleInput.addEventListener("input", () => {
      elements.gameTitle.textContent = editableElements.gameTitleInput.value;
    });

    editableElements.gameSummaryInput.addEventListener("input", () => {
      elements.gameSummary.textContent =
        editableElements.gameSummaryInput.value;
    });

    editableElements.gameThumbnailInput.addEventListener(
      "change",
      thumbnailChanged
    );

    editableElements.fontSort.addEventListener("change", () => {
      elements.gameColumn.style.fontFamily =
        editableElements.fontSort.options[
          editableElements.fontSort.selectedIndex
        ].value;
    });

    editableElements.gameFileInput.addEventListener("change", () => {
      const file = editableElements.gameFileInput.files[0];
      const isAboveMaxSize = file.size / Math.pow(1024, 3) > maxFileSize;
      const isAlreadyUploaded =
        files.findIndex((fle) => fle.name == file.name) !== -1;

      const fileErrorLabel = document.getElementById("file-error-label");

      let canUpload = true;

      if (isAboveMaxSize) {
        fileErrorLabel.textContent =
          "File size too large, select a file under 5GB";
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

      editableElements.gameFileInput.value = "";
    });

    elements.gameDesc.addEventListener("input", () => {
      const text = elements.gameDesc.innerHTML;
      if (text.length > maxDescriptionCharacters) {
        elements.gameDesc.innerHTML = text.substring(
          0,
          maxDescriptionCharacters
        );
      }
    });

    const isPublic = {
      Enabled: gameData.active,
      Element: document.getElementById("public"),
    };
    isPublic.Element.checked = isPublic.Enabled;
    isPublic.Element.addEventListener("change", () => {
      isPublic.Enabled = isPublic.Element.checked;
    });

    const gameFeatures = [
      "Singleplayer",
      "Multiplayer",
      "Co1op",
      "Achievements",
      "Controller_Support",
      "Saves",
      "VR_Support",
    ].map((name) => ({
      Name: name,
      Enabled: gameData.features[name],
      Element: document.getElementById(
        name.toLowerCase().replace(/1/g, "").replace(/_/g, "")
      ),
    }));

    gameFeatures.forEach((feature) => {
      feature.Element.checked = feature.Enabled;
      feature.Element.addEventListener("change", () => {
        feature.Enabled = feature.Element.checked;
      });
    });

    const gamePlatforms = [
      "Windows",
      "Mac",
      "Linux",
      "Android",
      "IOS",
      "XBOX",
      "PlayStation",
      "Oculus",
    ].map((name) => ({
      Name: name,
      Enabled: gameData.platforms[name.toLowerCase()],
      Element: document.getElementById(name.toLowerCase()),
    }));

    gamePlatforms.forEach((platform) => {
      platform.Element.checked = platform.Enabled;
      platform.Element.addEventListener("change", () => {
        platform.Enabled = platform.Element.checked;
      });
    });

    colorInputs.forEach((colorInput) => {
      colorInput.Element.value = getComputedStyle(
        colorInput.ElementChanging
      ).getPropertyValue("color");
      colorInput.Element.addEventListener("input", function () {
        colorInput.ElementChanging.style.setProperty(
          colorInput.Property,
          this.value
        );
      });
    });

    const linkColorInput = document.getElementById("link-text-color");
    const linkHoverColorInput = document.getElementById("link-hover-color");
    const styleDescription = document.getElementById("style-description");

    const changeLinkRule = () => {
      const linkRule = `#${elements.gameDesc.id} a { color: ${linkColorInput.value};} #${elements.gameDesc.id} a:hover { color: ${linkHoverColorInput.value}; }`;
      styleDescription.textContent = linkRule;
    };

    linkColorInput.addEventListener("input", changeLinkRule);
    linkHoverColorInput.addEventListener("input", changeLinkRule);

    alphaInputs.forEach((alphaInput) => {
      alphaInput.Element.value = alphaInput.Amount * 100;
      alphaInput.Element.addEventListener("input", function () {
        alphaInput.Amount = alphaInput.Element.value;
        updateBackgroundColor(alphaInput.Amount, alphaInput.ElementChanging);
      });
    });

    shadowCheckboxes.forEach((shadowCheckbox) => {
      shadowCheckbox.Element.checked = shadowCheckbox.Enabled;
      shadowCheckbox.Element.addEventListener("change", function () {
        shadowCheckbox.Enabled = this.checked;
        this.checked
          ? shadowCheckbox.ElementChanging.classList.add("shadow-input")
          : shadowCheckbox.ElementChanging.classList.remove("shadow-input");
      });
    });

    outlineCheckboxes.forEach((outlineCheckbox) => {
      outlineCheckbox.Element.checked = outlineCheckbox.Enabled;
      outlineCheckbox.Element.addEventListener("change", function () {
        outlineCheckbox.Enabled = this.checked;
        this.checked
          ? outlineCheckbox.ElementChanging.classList.add("outline-input")
          : outlineCheckbox.ElementChanging.classList.remove("outline-input");
      });
    });

    /**
     * Commits changes to the game.
     */
    const commitChanges = async () => {
      const confirmCommit = confirm(
        `Are you sure you want to overwrite ${gameData.name}?`
      );

      if (confirmCommit) {
        editableElements.commitChangesButton.disabled = true;

        const combinedCheckboxes = [
          ...outlineCheckboxes.map((checkbox) => ({
            Name: checkbox.Name,
            Enabled: checkbox.Enabled,
          })),
          ...shadowCheckboxes.map((checkbox) => ({
            Name: checkbox.Name,
            Enabled: checkbox.Enabled,
          })),
        ];

        const combinedColors = [
          ...colorInputs.map((c) => ({
            Name: c.Name,
            Color: getComputedStyle(c.ElementChanging).getPropertyValue(
              c.Property
            ),
          })),
          {
            Name: "link_color",
            Color: linkColorInput.value,
          },
          {
            Name: "link_hover_color",
            Color: linkHoverColorInput.value,
          },
        ];

        const imageURI =
          editableElements.gameThumbnailInput.files.length > 0
            ? await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(
                  editableElements.gameThumbnailInput.files[0]
                );
              })
            : null;

        const updateGameOptionsBody = {
          name: editableElements.gameTitleInput.value,
          description: DOMPurify.sanitize(
            elements.gameDesc.getElementsByClassName("ql-editor")[0].innerHTML
          ), // Sanitize the description before uploading.
          summary: editableElements.gameSummaryInput.value,
          genre: editableElements.gameGenreInput.value.toLowerCase(),
          age_rating: editableElements.gameAgeInput.value,
          icon_upload: imageURI,
          active: isPublic.Enabled,
          pricing: {
            price: editableElements.gamePriceInput.value,
            free: editableElements.gameIsFreeInput.checked,
            currency: editableElements.gameCurrencyInput.value.toUpperCase(),
          },
          refund_policy: {
            timeframe: editableElements.gameRefundTimeframeInput.value,
            percentage: editableElements.gameRefundPercentageInput.value,
          },
          platforms: Object.fromEntries(
            gamePlatforms.map((p) => [
              p.Name.toLowerCase(),
              p.Enabled,
            ])
          ),
          features: Object.fromEntries(
            gameFeatures.map((f) => [f.Name, f.Enabled])
          ),
          page: {
            font_family: getComputedStyle(elements.gameColumn).getPropertyValue(
              "font-family"
            ),
            defaultColors: false,
            outlines: Object.fromEntries(
              combinedCheckboxes.map((o) => [o.Name, o.Enabled])
            ),
            alphas: Object.fromEntries(
              alphaInputs.map((a) => [a.Name, a.Amount])
            ),
            colors: Object.fromEntries(
              combinedColors.map((c) => [c.Name, c.Color])
            ),
          },
        };

        await updateGame(
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateGameOptionsBody),
          },
          gameData.id,
          editableElements.commitChangesButton
        );

        editableElements.commitChangesButton.disabled = false;
      }
    };

    /**
     * Deletes the game with confirmation
     */
    const deleteGame = async () => {
      const isConfirmed = confirm("Do you want to delete this game?");
      const confirmation = gameData.name.toUpperCase();

      if (isConfirmed) {
        const secondaryConfirm = prompt(
          `Type ${confirmation} to confirm deletion:`
        );

        if (secondaryConfirm == confirmation) {
          await removeGame(gameData.id);
          window.location.assign("dashboard"); // Assign the user back to their dashboard
        } else {
          alert("Invalid confirmation.");
        }
      } else {
        alert("Deletion Canceled");
      }
    };

    editableElements.commitChangesButton.addEventListener("click", () =>
      commitChanges()
    );
    editableElements.deleteButton.addEventListener("click", () => deleteGame());

    document
      .getElementById("buttons")
      .appendChild(editableElements.commitChangesButton);
    document
      .getElementById("buttons")
      .appendChild(editableElements.deleteButton);
  } else {
    document.getElementById("game-editing").remove();
  }
};

if (gameIdParam) {
  gameHandler(gameIdParam);
} else {
  // If the game does not exist, continue no further.
  window.location.assign("404?code=404");
}
