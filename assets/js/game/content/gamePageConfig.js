import { fetch_user } from "../../user/sessionManager.js";
import { request } from "../../base/apiManager.js";
import { endpoints } from "../../other/endpoints.js";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");
const user = await fetch_user();

// TODO: Add the color, background color, and alpha inputs from the depricated version to this script.

class GameData {
  constructor(rawGameData, priceData, createdFormattedDate, updatedFormattedDate, datestodays) {
    Object.assign(this, {
      id: rawGameData.id,
      name: rawGameData.name,
      active: rawGameData.active,
      description: rawGameData.description,
      genre: rawGameData.genre,
      summary: rawGameData.summary,
      artstyle: rawGameData.artstyle,
      filesize: rawGameData.size,
      agerating: rawGameData.age_rating,
      icon: new URL(rawGameData.icon.url),
      paymentLink: rawGameData.paymentLink,
      created: createdFormattedDate,
      updated: updatedFormattedDate,
      datestodays,
      features: rawGameData.features,
      platforms: rawGameData.platforms,
      price: priceData,
      download_key: rawGameData.product_id,
      page: rawGameData.page,
      developer: { username: rawGameData.username, id: rawGameData.id },
    });
  }
}

String.prototype.convertToHex = function () {
  if (/^#[0-9a-fA-F]{6}$/.test(this)) return this;
  const [r, g, b] = this.match(/\d+/g).map(Number);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
};

const updateBackgroundColor = (alphaInput, styleElement) => {
  const alphaValue = alphaInput.value / 100;
  const [r, g, b] = getComputedStyle(styleElement).getPropertyValue("background-color").match(/\d+/g).map(Number);
  styleElement.style.setProperty("background-color", `rgba(${r}, ${g}, ${b}, ${alphaValue})`);
};

const getGameData = async (gameId) => {
  const result = await request(`${endpoints.game.get_data}${gameId}`, { method: "GET", headers: { "Content-Type": "application/json" } }, true);
  if (result.ok) return result.response;
  throw new Error(`Unable to get game data: ${result}`);
};

const fetchPriceData = async (rawGameData) => {
  const result = await request(`${endpoints.game.get_price}${rawGameData.product_id}`, { method: "GET", headers: { "Content-Type": "application/json" } }, true);
  return result.ok ? result.response : null;
};

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

  let priceData = { currency: "USD", amount: "0" };
  if (!rawGameData.free) {
    const response = await fetchPriceData(rawGameData);
    if (response?.currency) priceData = { currency: response.currency.toUpperCase(), amount: parseFloat(response.unit_amount / 100) };
  }

  return new GameData(rawGameData, priceData, createdFormattedDate, updatedFormattedDate, datestodays);
};

const updateProduct = async (data, gameId, commitChangesButton) => {
  const result = await request(`${endpoints.game.update}${gameId}`, data, false);
  commitChangesButton.textContent = result.ok ? "Success" : result.response;
};

const formatTimeSingle = (timeago, option, unit) => `${option} (${timeago === 1 ? "1" : timeago} ${unit}${timeago === 1 ? "" : "s"} Ago)`;
const formatTime = (coru, yearsAgo, monthsAgo, weeksAgo, daysAgo) => {
  if (yearsAgo >= 1) return formatTimeSingle(yearsAgo, coru, "Year");
  if (monthsAgo >= 1) return formatTimeSingle(monthsAgo, coru, "Month");
  if (weeksAgo >= 1) return formatTimeSingle(weeksAgo, coru, "Week");
  if (daysAgo >= 1) return formatTimeSingle(daysAgo, coru, "Day");
  return "Just Now";
};

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
  elements.gameDesc.innerHTML = DOMPurify.sanitize(gameData.description);
  elements.gamePrice.textContent = `${gameData.price.amount} ${gameData.price.currency}`;
  elements.created.textContent = formatTime(gameData.created, gameData.datestodays.publishedYearsAgo, gameData.datestodays.publishedMonthsAgo, gameData.datestodays.publishedWeeksAgo, gameData.datestodays.publishedDaysAgo);
  elements.updated.textContent = formatTime(gameData.updated, gameData.datestodays.updatedYearsAgo, gameData.datestodays.updatedMonthsAgo, gameData.datestodays.updatedWeeksAgo, gameData.datestodays.updatedDaysAgo);
  elements.icon.setAttribute("href", gameData.icon);
  elements.navigationTitle.textContent = `${gameData.name} By ${gameData.developer.username}`;
  elements.developerName.textContent = gameData.developer.username;
  elements.gameGenre.textContent = DOMPurify.sanitize(gameData.genre).toUpperCase();
  elements.gameSummary.textContent = gameData.summary;
  elements.gameArt.textContent = DOMPurify.sanitize(gameData.artstyle).toUpperCase();
  elements.gameAge.textContent = gameData.agerating.toUpperCase();
  elements.gameSize.textContent = gameData.filesize;

  elements.developerName.setAttribute("href", `user?id=${gameData.developer.id}`);
  elements.gameGenre.setAttribute("href", `category?n=${DOMPurify.sanitize(gameData.genre).toUpperCase()}`);

  const features = ["Singleplayer", "Multiplayer", "Coop", "Achievements", "Controller Support", "Saves"].map(name => ({ Name: name, Enabled: gameData.features[name] }));
  const platforms = ["windows", "mac", "linux", "android", "ios", "xbox", "playstation", "oculus"].map(name => ({ Name: name.charAt(0).toUpperCase() + name.slice(1), Enabled: gameData.platforms[name] }));

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

  if (!gameData.page.default_colors) {
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

  elements.downloadButton.setAttribute("href", gameData.paymentLink);

  if (user && user.id === gameData.developer.id) {
    const editableElements = {
      gameGenreInput: document.getElementById("genre-input"),
      gameArtStyleInput: document.getElementById("art-style-input"),
      gameAgeInput: document.getElementById("age-sort"),
      gameThumbnailInput: document.getElementById("thumbnail-input"),
      commitChangesButton: document.createElement("button"),
    };

    elements.gameTitle.contentEditable = true;
    elements.gameDesc.contentEditable = true;
    elements.gameSummary.contentEditable = true;

    editableElements.commitChangesButton.setAttribute("class", "game-download-button");
    editableElements.commitChangesButton.textContent = "Commit Changes";

    editableElements.gameGenreInput.value = gameData.genre;
    editableElements.gameArtStyleInput.value = gameData.artstyle;

    Array.from(editableElements.gameAgeInput.options).forEach((option, i) => {
      if (option.value === gameData.agerating.toLowerCase()) {
        editableElements.gameAgeInput.selectedIndex = i;
      }
    });

    editableElements.gameGenreInput.addEventListener("input", () => {
      editableElements.gameGenreInput.value = editableElements.gameGenreInput.value.toUpperCase();
    });

    editableElements.gameArtStyleInput.addEventListener("input", () => {
      editableElements.gameArtStyleInput.value = editableElements.gameArtStyleInput.value.toUpperCase();
    });

    const isPublic = { Enabled: gameData.active, Element: document.getElementById("public") };
    isPublic.Element.checked = isPublic.Enabled;
    isPublic.Element.addEventListener("change", () => {
      isPublic.Enabled = isPublic.Element.checked;
    });

    const gameFeatures = ["Singleplayer", "Multiplayer", "Coop", "Achievements", "Controller Support", "Saves", "VR Support"].map(name => ({
      Name: name,
      Enabled: gameData.features[name],
      Element: document.getElementById(name.toLowerCase().replace(" ", "-")),
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

    editableElements.commitChangesButton.addEventListener("click", async () => {
      const updateGameOptionsBody = {
        name: elements.gameTitle.textContent,
        description: elements.gameDesc.innerHTML,
        summary: elements.gameSummary.textContent,
        genre: editableElements.gameGenreInput.value,
        artstyle: editableElements.gameArtStyleInput.value,
        age_rating: editableElements.gameAgeInput.value,
        active: isPublic.Enabled ? "true" : "false",
        uploader_id: user.id,
        platforms: Object.fromEntries(gamePlatforms.map(p => [p.Name.toLowerCase(), p.Enabled ? "true" : "false"])),
        features: Object.fromEntries(gameFeatures.map(f => [f.Name, f.Enabled ? "true" : "false"])),
        page: {
          font_family: getComputedStyle(elements.gameColumn).getPropertyValue("font-family"),
          defaultColors: false,
          outlines: gameData.page.outlines,
          alphas: gameData.page.alphas,
          colors: gameData.page.colors,
        },
      };

      const image = editableElements.gameThumbnailInput.files[0];
      if (image) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          updateGameOptionsBody.icon = event.target.result;
          await updateProduct({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updateGameOptionsBody) }, gameData.id, editableElements.commitChangesButton);
        };
        reader.readAsDataURL(image);
      } else {
        await updateProduct({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updateGameOptionsBody) }, gameData.id, editableElements.commitChangesButton);
      }
    });

    document.getElementById("buttons").appendChild(editableElements.commitChangesButton);
  } else {
    document.getElementById("game-editing").remove();
  }
};

if (gameIdParam) {
  gameHandler(gameIdParam);
} else {
  console.warn("There is no game id.");
  window.location.assign("404");
}