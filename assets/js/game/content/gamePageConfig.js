// Handles displaying games and editing games

import { user } from "../../user/userManager.js";
import { request } from "../../base/apiManager.js";
import { endpoints } from "../../other/endpoints.js";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g"); // the game ID

// TODO: Update price and currency options in stripe or create new ones when game changes from free to paid (destroy ones when game changes from paid to free).

const maxDescriptionCharacters = 4000;
const minPrice = 1, maxPrice = 5000;
const maxFileSize = 5; // GB

// New class for the current game
class GameData {
  constructor(rawGameData, createdFormattedDate, updatedFormattedDate, datestodays) {
    Object.assign(this, {
      id: rawGameData.id,
      name: rawGameData.name,
      active: rawGameData.active,
      description: rawGameData.description,
      genre: rawGameData.genre,
      summary: rawGameData.summary,
      artstyle: rawGameData.artstyle,
      agerating: rawGameData.age_rating,
      icon: new URL(rawGameData.icon.url),
      paymentLink: rawGameData.paymentLink ? new URL(rawGameData.paymentLink) : null,
      created: createdFormattedDate,
      updated: updatedFormattedDate,
      datestodays,
      features: rawGameData.features,
      platforms: rawGameData.platforms,
      pricing: rawGameData.pricing,
      download_key: rawGameData.product_id,
      page: rawGameData.page,
      developer: { username: rawGameData.developer.username, id: rawGameData.developer.id },
    });
  }
}

// converts colors to hex
String.prototype.convertToHex = function () {
  if (/^#[0-9a-fA-F]{6}$/.test(this)) return this;
  const [r, g, b] = this.match(/\d+/g).map(Number);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
};

// Updates the background color. Really only uses the alpha values
const updateBackgroundColor = (alphaInput, styleElement) => {
  const alphaValue = alphaInput / 100;
  const [r, g, b] = getComputedStyle(styleElement).getPropertyValue("background-color").match(/\d+/g).map(Number);
  styleElement.style.setProperty("background-color", `rgba(${r}, ${g}, ${b}, ${alphaValue})`);
};

// Retrieves the game data
const getGameData = async (gameId) => {
  const result = await request(`${endpoints.game.view}${gameId}`, { method: "GET", headers: { "Content-Type": "application/json" } }, true);
  if (result.ok) return result.response;
  throw new Error(`Unable to get game data: ${result}`);
};

// Edits the raw game data and returns new game data
const fetchGameData = async (gameId) => {
  const rawGameData = await getGameData(gameId);
  const createdDate = new Date(rawGameData.created_at);
  const updatedDate = new Date(rawGameData.updated);
  const currentDate = new Date();

  const createdFormattedDate = createdDate.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
  const updatedFormattedDate = updatedDate.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

  const datestodays = {
    publishedDaysAgo: Math.ceil((currentDate - createdDate) / (1000 * 60 * 60 * 24)),
    updatedDaysAgo: Math.ceil((currentDate - updatedDate) / (1000 * 60 * 60 * 24)),
  };

  return new GameData(rawGameData, createdFormattedDate, updatedFormattedDate, datestodays);
};

// Request to update the game
const updateGame = async (data, gameId, commitChangesButton) => {
  const result = await request(`${endpoints.game.update}${gameId}`, data, false);
  commitChangesButton.textContent = result.ok ? "Success" : result.response;
};

// Request to remove the game
const removeGame = async(gameId) => {
  const deleteOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      uploader_id: user.id,
    },
  }

  const response = await request(`${endpoints.game.remove}${gameId}`, deleteOptions);
  return response.ok
}

// Formats the time in a human-readable format
const formatTimeSingle = (timeago, option, unit) => `${option} (${timeago === 1 ? "1" : timeago} ${unit}${timeago === 1 ? "" : "s"} Ago)`;
const formatTime = (coru, yearsAgo, monthsAgo, weeksAgo, daysAgo) => {
  if (yearsAgo >= 1) return formatTimeSingle(yearsAgo, coru, "Year");
  if (monthsAgo >= 1) return formatTimeSingle(monthsAgo, coru, "Month");
  if (weeksAgo >= 1) return formatTimeSingle(weeksAgo, coru, "Week");
  if (daysAgo >= 1) return formatTimeSingle(daysAgo, coru, "Day");
  return "Just Now";
};

// Displays the game and handles editing
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
    gameArt: document.getElementById("game-art"),
    gameAge: document.getElementById("game-age"),
    gameSize: document.getElementById("game-size"),
    gamePrice: document.getElementById("game-price"),
    gameFeatures: document.getElementById("features"),
    gamePlatforms: document.getElementById("platforms"),
    gameColumn: document.getElementById("game-column"),
    gameTitleColumn: document.getElementById("game-title-column"),
    gameStats: document.getElementById("game-stats"),
    gameDescBackground: document.getElementById("game-description"),
  };

  elements.gameTitle.textContent = gameData.name;
  elements.gameDesc.innerHTML = gameData.description;
  elements.gamePrice.textContent = `${gameData.pricing.price} ${gameData.pricing.currency}`;
  elements.created.textContent = formatTime(gameData.created, gameData.datestodays.publishedYearsAgo, gameData.datestodays.publishedMonthsAgo, gameData.datestodays.publishedWeeksAgo, gameData.datestodays.publishedDaysAgo);
  elements.updated.textContent = formatTime(gameData.updated, gameData.datestodays.updatedYearsAgo, gameData.datestodays.updatedMonthsAgo, gameData.datestodays.updatedWeeksAgo, gameData.datestodays.updatedDaysAgo);
  elements.navigationTitle.textContent = `${gameData.name} By ${gameData.developer.username}`;
  elements.developerName.textContent = gameData.developer.username;
  elements.gameGenre.textContent = gameData.genre.toUpperCase();
  elements.gameSummary.textContent = gameData.summary;
  elements.gameArt.textContent = gameData.artstyle.toUpperCase();
  elements.gameAge.textContent = gameData.agerating.toUpperCase();

  elements.icon.setAttribute("href", gameData.icon.href);
  elements.developerName.setAttribute("href", `user?id=${gameData.developer.id}`);
  elements.gameGenre.setAttribute("href", `category?n=${gameData.genre.toUpperCase()}`);

  const features = ["Singleplayer", "Multiplayer", "Coop", "Achievements", "ControllerSupport", "Saves", "VRSupport"].map(name => ({ Name: name, Enabled: gameData.features[name] }));
  const platforms = ["windows", "mac", "linux", "android", "ios", "xbox", "playstation", "oculus"].map(name => ({ Name: name.charAt(0).toUpperCase() + name.slice(1), Enabled: gameData.platforms[name] }));

  const elementAlphas = [
    {
      Amount: gameData.page.alphas.bg2_alpha,
      ElementChanging: elements.gameColumn,
    },
    {
      Amount: gameData.page.alphas.description_bg_alpha,
      ElementChanging: elements.gameDesc,
    },
    {
      Amount: gameData.page.alphas.game_details_bg_alpha,
      ElementChanging: elements.gameStats,
    },
  ]

  const elementShadows = [
    {
      Enabled: gameData.page.outlines.game_details_outline,
      ElementChanging: elements.gameStats,
    },
    {
      Enabled: gameData.page.outlines.description_outline,
      ElementChanging: elements.gameDesc,
    },
    {
      Enabled: gameData.page.outlines.bg2_outline,
      ElementChanging: elements.gameColumn,
    },
  ]

  const elementOutlines = [
    {
      Enabled: gameData.page.outlines.game_details_shadow,
      ElementChanging: elements.gameStats,
    },
    {
      Enabled: gameData.page.outlines.description_shadow,
      ElementChanging: elements.gameDesc,
    },
    {
      Enabled: gameData.page.outlines.bg2_shadow,
      ElementChanging: elements.gameColumn,
    },
  ]

  features.forEach(feature => {
    if (feature.Enabled) {
      const featureContainer = document.createElement("div");
      featureContainer.setAttribute("class", "game-feature");
      featureContainer.textContent = feature.Name;
      elements.gameFeatures.appendChild(featureContainer);
    }
  });

  platforms.forEach(platform => {
    if (platform.Enabled) {
      const platformContainer = document.createElement("div");
      platformContainer.setAttribute("class", "game-feature");
      platformContainer.textContent = platform.Name;
      elements.gamePlatforms.appendChild(platformContainer);
    }
  });

  elementShadows.forEach(shadow => {
    shadow.Enabled ? shadow.ElementChanging.classList.add("shadow-input") : shadow.ElementChanging.classList.remove("shadow-input")
  });

  elementOutlines.forEach(outline => {
    outline.Enabled ? outline.ElementChanging.classList.add("outline-input") : outline.ElementChanging.classList.remove("outline-input")
  });

  elementAlphas.forEach(alpha => {
    updateBackgroundColor(alpha.Amount, alpha.ElementChanging);
  });

  if (!gameData.page.default_colors) { // If the page doesn't use the default colors, use the modified ones
    const colors = gameData.page.colors;
    document.body.style.backgroundColor = colors.bg_color;
    elements.gameColumn.style.backgroundColor = colors.bg2_color;
    elements.gameTitleColumn.style.color = colors.title_color;
    elements.gameDesc.style.color = colors.desc_color;
    elements.gameDescBackground.style.backgroundColor = colors.desc_bg_color;
    elements.downloadButton.style.backgroundColor = colors.button_color;
    elements.downloadButton.style.color = colors.button_text_color;
    elements.gameStats.style.backgroundColor = colors.stats_bg_color;

    Array.from(document.getElementsByClassName("game-stat")).forEach(stat => {
      stat.style.color = colors.stats_text_color;
    });

    if (gameData.page.font_family) {
      elements.gameColumn.style.fontFamily = gameData.page.font_family;
    }
  }

  // TODO: Make the game available to download
  //elements.downloadButton.setAttribute("href", gameData.paymentLink);

  if (user && user.id === gameData.developer.id) { // If the user is the game developer, allow access to editing the game
    const editableElements = {
      gameTitleInput: document.getElementById("title-input"),
      gameSummaryInput: document.getElementById("summary-input"),
      gameGenreInput: document.getElementById("genre-input"),
      gameArtStyleInput: document.getElementById("art-style-input"),
      gameAgeInput: document.getElementById("age-sort"),
      gameThumbnailInput: document.getElementById("thumbnail-input"),
      gamePriceInput: document.getElementById("price"),
      gameCurrencyInput: document.getElementById("currency-sort"),
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
        ElementChanging: elements.gameDescBackground,
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
    ]

    const alphaInputs = [
      {
        Name: "bg2_alpha",
        Element: document.getElementById("bg2-alpha"),
        Amount: gameData.page.alphas.bg2_alpha,
        ElementChanging: elements.gameColumn
      },
      {
        Name: "description_bg_alpha",
        Element: document.getElementById("description-bg-alpha"),
        Amount: gameData.page.alphas.description_bg_alpha,
        ElementChanging: elements.gameDescBackground
      },
      {
        Name: "game_details_bg_alpha",
        Element: document.getElementById("game-details-bg-alpha"),
        Amount: gameData.page.alphas.game_details_bg_alpha,
        ElementChanging: elements.gameStats
      },
    ]

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
    ]

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
    ]

    elements.gameDesc.contentEditable = true;

    editableElements.commitChangesButton.setAttribute("class", "commit-changes-button");
    editableElements.commitChangesButton.textContent = "Commit Changes";

    editableElements.deleteButton.setAttribute("class", "game-delete-button");
    editableElements.deleteButton.textContent = "Delete Game"

    editableElements.gameTitleInput.value = gameData.name;
    editableElements.gameSummaryInput.value = gameData.summary;
    editableElements.gameGenreInput.value = gameData.genre.toUpperCase();
    editableElements.gameArtStyleInput.value = gameData.artstyle.toUpperCase();
    editableElements.gamePriceInput.value = gameData.pricing.price;

    Array.from(editableElements.gameAgeInput.options).forEach((option, i) => {
      if (option.value === gameData.agerating.toLowerCase()) {
        editableElements.gameAgeInput.selectedIndex = i;
      }
    });

    Array.from(editableElements.gameCurrencyInput.options).forEach((option, i) => {
      if (option.value === gameData.agerating.toLowerCase()) {
        editableElements.gameCurrencyInput.selectedIndex = i;
      }
    });

    editableElements.gameGenreInput.addEventListener("input", () => {
      editableElements.gameGenreInput.value = editableElements.gameGenreInput.value.toUpperCase();
    });

    editableElements.gameArtStyleInput.addEventListener("input", () => {
      editableElements.gameArtStyleInput.value = editableElements.gameArtStyleInput.value.toUpperCase();
    });

    editableElements.gamePriceInput.addEventListener("input", () => {
      editableElements.gamePriceInput.value = Math.min(maxPrice, Math.max(minPrice, editableElements.gamePriceInput.value.replace(/[^0-9]/g, "")));
    });

    editableElements.gameTitleInput.addEventListener("input", () => {
      elements.gameTitle.textContent = editableElements.gameTitleInput.value;
    });

    editableElements.gameSummaryInput.addEventListener("input", () => {
      elements.gameSummary.textContent = editableElements.gameSummaryInput.value;
    });

    elements.gameDesc.addEventListener("input", () => {
      const text = DOMPurify.sanitize(elements.gameDesc.innerHTML);
      elements.gameDesc.innerHTML = text.length > maxDescriptionCharacters ? text.substr(0, maxDescriptionCharacters) : text;
    });

    const isPublic = { Enabled: gameData.active, Element: document.getElementById("public") };
    isPublic.Element.checked = isPublic.Enabled;
    isPublic.Element.addEventListener("change", () => {
      isPublic.Enabled = isPublic.Element.checked;
    });

    const gameFeatures = ["Singleplayer", "Multiplayer", "Coop", "Achievements", "ControllerSupport", "Saves", "VRSupport"].map(name => ({
      Name: name,
      Enabled: gameData.features[name],
      Element: document.getElementById(name.toLowerCase()),
    }));

    gameFeatures.forEach(feature => {
      feature.Element.checked = feature.Enabled;
      feature.Element.addEventListener("change", () => {
        feature.Enabled = feature.Element.checked;
      });
    });

    const gamePlatforms = ["Windows", "Mac", "Linux", "Android", "IOS", "XBOX", "PlayStation", "Oculus"].map(name => ({
      Name: name,
      Enabled: gameData.platforms[name.toLowerCase()],
      Element: document.getElementById(name.toLowerCase()),
    }));

    gamePlatforms.forEach(platform => {
      platform.Element.checked = platform.Enabled;
      platform.Element.addEventListener("change", () => {
        platform.Enabled = platform.Element.checked;
      });
    });

    colorInputs.forEach(colorInput => {
      colorInput.Element.value = getComputedStyle(colorInput.ElementChanging).getPropertyValue("color").toString().convertToHex();
      colorInput.Element.addEventListener("input", function () {
        colorInput.ElementChanging.style.setProperty(colorInput.Property, this.value);
      });
    });

    alphaInputs.forEach(alphaInput => {
      alphaInput.Element.value = alphaInput.Amount * 100;
      alphaInput.Element.addEventListener("input", function () {
        alphaInput.Amount = alphaInput.Element.value;
        updateBackgroundColor(alphaInput.Amount, alphaInput.ElementChanging);
      });
    });

    shadowCheckboxes.forEach(shadowCheckbox => {
      shadowCheckbox.Element.checked = shadowCheckbox.Enabled;
      shadowCheckbox.Element.addEventListener("change", function() {
        shadowCheckbox.Enabled = this.checked;
        this.checked ? shadowCheckbox.ElementChanging.classList.add("shadow-input") : shadowCheckbox.ElementChanging.classList.remove("shadow-input");
      });
    });

    outlineCheckboxes.forEach(outlineCheckbox => {
      outlineCheckbox.Element.checked = outlineCheckbox.Enabled;
      outlineCheckbox.Element.addEventListener("change", function() {
        outlineCheckbox.Enabled = this.checked;
        this.checked ? outlineCheckbox.ElementChanging.classList.add("outline-input") : outlineCheckbox.ElementChanging.classList.remove("outline-input");
      });
    });

    // Commiting the changes of the game
    const commitChanges = async () => {
      editableElements.commitChangesButton.disabled = true;
      const combinedCheckboxes = [
        ...outlineCheckboxes.map(checkbox => ({ Name: checkbox.Name, Enabled: checkbox.Enabled ? "true" : "false"})),
        ...shadowCheckboxes.map(checkbox => ({ Name: checkbox.Name, Enabled: checkbox.Enabled ? "true" : "false"})),
      ];

      const isFree = editableElements.gamePriceInput.value <= 0; // Identify if the game is free by the given price

      const updateGameOptionsBody = {
        name: editableElements.gameTitleInput.value,
        description: DOMPurify.sanitize(elements.gameDesc.innerHTML), // Sanitize the description
        summary: editableElements.gameSummaryInput.value,
        genre: editableElements.gameGenreInput.value,
        artstyle: editableElements.gameArtStyleInput.value,
        age_rating: editableElements.gameAgeInput.value,
        active: isPublic.Enabled ? "true" : "false",
        pricing: {
          price: editableElements.gamePriceInput.value,
          free: isFree,
          currency: editableElements.gameCurrencyInput.value,
        },
        uploader_id: user.id,
        platforms: Object.fromEntries(gamePlatforms.map(p => [p.Name.toLowerCase(), p.Enabled ? "true" : "false"])),
        features: Object.fromEntries(gameFeatures.map(f => [f.Name, f.Enabled ? "true" : "false"])),
        page: {
          font_family: getComputedStyle(elements.gameColumn).getPropertyValue("font-family"),
          defaultColors: false,
          outlines: Object.fromEntries(combinedCheckboxes.map(o => [o.Name, o.Enabled])),
          alphas: Object.fromEntries(alphaInputs.map(a => [a.Name, a.Amount])),
          colors: Object.fromEntries(colorInputs.map(c => [c.Name, getComputedStyle(c.ElementChanging).getPropertyValue(c.Property)])),
        },
      };

      const image = editableElements.gameThumbnailInput.files[0];

      // If the developer gave an image, send it to the server. Otherwise, don't send a null value
      if (image) {
        const reader = new FileReader();

        const readFile = () => {
          return new Promise((resolve, reject) => {
            reader.onload = (event) => {
              updateGameOptionsBody.icon = event.target.result;
              resolve();
            };
            reader.onerror = () => {
              reject(error);
            };
            reader.readAsDataURL(image);
          });
        };

        await readFile();
      };

      await updateGame({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updateGameOptionsBody) }, gameData.id, editableElements.commitChangesButton);
      editableElements.commitChangesButton.disabled = false;
    };

    // Deleting the game
    const deleteGame = async () => {
      const isConfirmed = confirm("Do you want to delete this game?");
      const confirmation = gameData.name.toUpperCase();

      if (isConfirmed) {
        const secondaryConfirm = prompt(`Type ${confirmation} to confirm deletion:`);

        if (secondaryConfirm == confirmation) { // Double confirmation to make sure no mistakes are made
          const response = await removeGame(gameData.id);
  
          if (response.ok) {
            window.location.assign("dashboard"); // Assign the user back to their dashboard
          } else {
            alert("Failed to delete game.");
          };
        } else {
          alert("Invalid confirmation.");
        };
      } else {
        alert("Deletion Canceled");
      };
    };

    editableElements.commitChangesButton.addEventListener("click", () => commitChanges());
    editableElements.deleteButton.addEventListener("click", () => deleteGame());

    document.getElementById("buttons").appendChild(editableElements.commitChangesButton);
    document.getElementById("buttons").appendChild(editableElements.deleteButton);
  } else {
    document.getElementById("game-editing").remove();
  }
};

if (gameIdParam) {
  gameHandler(gameIdParam);
} else { // If the game does not exist, continue no further.
  window.location.assign("404?code=404");
}