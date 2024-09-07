const updateGame = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/";
const getGame = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/";
const getPrice = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices/";

import { fetch_user } from "../../user/sessionManager.js";
import { request } from "../../base/apiManager.js";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");

class GameData {
  constructor(
    rawGameData,
    priceData,
    createdFormattedDate,
    updatedFormattedDate,
    datestodays
  ) {
    this.id = rawGameData.id;
    this.name = rawGameData.name;
    this.active = rawGameData.active;
    this.description = rawGameData.description;
    this.genre = rawGameData.genre;
    this.summary = rawGameData.summary;
    this.artstyle = rawGameData.artstyle;
    this.filesize = rawGameData.size;
    this.agerating = rawGameData.age_rating;
    this.icon = new URL(rawGameData.icon.url);
    this.paymentLink = new URL(rawGameData.payment_link);
    this.created = createdFormattedDate;
    this.updated = updatedFormattedDate;
    this.datestodays = datestodays;
    this.features = rawGameData.features;
    this.platforms = rawGameData.platforms;
    this.price = priceData;
    this.download_key = rawGameData.product_id;
    this.page = rawGameData.page;
    this.developer = {
      username: rawGameData.username,
      id: rawGameData.id,
    };
  }
}

String.prototype.convertToHex = function () {
  if (/^#[0-9a-fA-F]{6}$/.test(this)) {
    return this;
  }

  const rgbValues = this.match(/\d+/g).map(Number);

  const r = rgbValues[0];
  const g = rgbValues[1];
  const b = rgbValues[2];

  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");

  return `#${hexR}${hexG}${hexB}`;
};

const updateBackgroundColor = (alphaInput, styleElement) => {
  const alphaValue = alphaInput.value / 100;

  const rgbValues =
    getComputedStyle(styleElement).getPropertyValue("background-color");
  const match = rgbValues.match(/\d+/g).map(Number);
  const r = match[0];
  const g = match[1];
  const b = match[2];

  const newBackgroundColor = `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
  styleElement.style.setProperty("background-color", newBackgroundColor);
};

const getGameData = async (gameId) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: myHeaders,
  };

  const result = await request(`${getGame}${gameId}`, options, true);

  if (result) {
    return result;
  } else {
    throw new Error(`Unable to get game data: ${result}`);
  }
};
const fetchPriceData = async (rawGameData) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: myHeaders,
  };

  const result = await request(
    `${getPrice}${rawGameData.product_id}`,
    options,
    true
  );

  if (result) {
    return result;
  }
};

const fetchGameData = async (gameId) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

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

  const publishedDifference = Math.abs(
    currentDate.getTime() - createdDate.getTime()
  );

  const updatedDifference = Math.abs(
    currentDate.getTime() - updatedDate.getTime()
  );

  const publishedDaysAgo = Math.ceil(
    publishedDifference / (1000 * 60 * 60 * 24)
  );
  const publishedWeeksAgo = Math.floor(publishedDaysAgo / 7);
  const publishedMonthsAgo = Math.floor(publishedDaysAgo / 31);
  const publishedYearsAgo = Math.floor(publishedDaysAgo / 365);

  const updatedDaysAgo = Math.ceil(updatedDifference / (1000 * 60 * 60 * 24));
  const updatedWeeksAgo = Math.floor(updatedDaysAgo / 7);
  const updatedMonthsAgo = Math.floor(publishedDaysAgo / 31);
  const updatedYearsAgo = Math.floor(updatedDaysAgo / 365);

  const datestodays = {
    publishedDaysAgo: publishedDaysAgo,
    publishedWeeksAgo: publishedWeeksAgo,
    publishedMonthsAgo: publishedMonthsAgo,
    publishedYearsAgo: publishedYearsAgo,
    updatedDaysAgo: updatedDaysAgo,
    updatedWeeksAgo: updatedWeeksAgo,
    updatedMonthsAgo: updatedMonthsAgo,
    updatedYearsAgo: updatedYearsAgo,
  };

  let priceData = {
    currency: "USD",
    amount: "0",
  };

  if (!rawGameData.free) {
    const response = await fetchPriceData(rawGameData);

    if (response.currency) {
      priceData = {
        currency: response.currency.toUpperCase(),
        amount: parseFloat(response.unit_amount / 100),
      };
    }
  }

  const gameData = new GameData(
    rawGameData,
    priceData,
    createdFormattedDate,
    updatedFormattedDate,
    datestodays
  );

  return gameData;
};
const updateProduct = async (data, gameId, commitChangesButton) => {
  const result = await request(`${updateGame}${gameId}`, data, false);

  if (result) {
    commitChangesButton.textContent = "Success";
  } else {
    commitChangesButton.textContent = "An error occured";
  }
};

const formatTimeSingle = (timeago, option, unit) => {
  return timeago === 1
    ? `${option} (1 ${unit} Ago)`
    : `${option} (${timeago} ${unit}s Ago)`;
};
const formatTime = (coru, yearsAgo, monthsAgo, weeksAgo, daysAgo) => {
  switch (true) {
    case yearsAgo >= 1:
      return formatTimeSingle(yearsAgo, coru, "Year");
    case monthsAgo >= 1:
      return formatTimeSingle(monthsAgo, coru, "Month");
    case weeksAgo >= 1:
      return formatTimeSingle(weeksAgo, coru, "Week");
    case daysAgo >= 1:
      return formatTimeSingle(daysAgo, coru, "Day");
    default:
      return "Just Now";
  }
};

const gameHandler = async (gameId) => {
  const user = await fetch_user();
  const gameData = await fetchGameData(gameId);

  const realGameId = gameData.id;

  const gameTitle = document.getElementById("game-title");
  const gameDesc = document.getElementById("description");
  const created = document.getElementById("created");
  const updated = document.getElementById("updated");

  const navigationTitle = document.getElementById("navigation-title");
  const icon = document.getElementById("icon");

  const developerName = document.getElementById("game-developer-name");
  const downloadButton = document.getElementById("download-button");
  const gameGenre = document.getElementById("game-genre");
  const gameSummary = document.getElementById("game-summary");
  const gameArt = document.getElementById("game-art");
  const gameAge = document.getElementById("game-age");
  const gameSize = document.getElementById("game-size");
  const gamePrice = document.getElementById("game-price");
  const gameFeatures = document.getElementById("features");
  const gamePlatforms = document.getElementById("platforms");

  const gameColumn = document.getElementById("game-column");
  const gameTitleColumn = document.getElementById("game-title-column");
  const gameStats = document.getElementById("game-stats");
  const gameDescBackground = document.getElementById("game-description");

  gameTitle.textContent = gameData.name;
  gameDesc.innerHTML = DOMPurify.sanitize(gameData.description);
  gamePrice.textContent = `${gameData.price.amount} ${gameData.price.currency}`;

  created.textContent = formatTime(
    gameData.created,
    gameData.datestodays.publishedYearsAgo,
    gameData.datestodays.publishedMonthsAgo,
    gameData.datestodays.publishedWeeksAgo,
    gameData.datestodays.publishedDaysAgo
  );
  updated.textContent = formatTime(
    gameData.updated,
    gameData.datestodays.updatedYearsAgo,
    gameData.datestodays.updatedMonthsAgo,
    gameData.datestodays.updatedWeeksAgo,
    gameData.datestodays.updatedDaysAgo
  );

  icon.setAttribute("href", gameData.icon);
  navigationTitle.textContent = `${gameData.name} By ${gameData.developer.username}`;

  developerName.textContent = gameData.developer.username;
  gameGenre.textContent = DOMPurify.sanitize(gameData.genre).toUpperCase();
  gameSummary.textContent = gameData.summary;
  gameArt.textContent = DOMPurify.sanitize(gameData.artstyle).toUpperCase();
  gameAge.textContent = gameData.agerating.toUpperCase();
  gameSize.textContent = gameData.filesize;

  developerName.setAttribute("href", `user?id=${gameData.developer.id}`);
  gameGenre.setAttribute(
    "href",
    `category?n=${DOMPurify.sanitize(gameData.genre).toUpperCase()}`
  );

  let features = [
    {
      ["Name"]: "Singleplayer",
      ["Enabled"]: gameData.features.Singleplayer,
    },
    {
      ["Name"]: "Multiplayer",
      ["Enabled"]: gameData.features.Multiplayer,
    },
    {
      ["Name"]: "Co-op",
      ["Enabled"]: gameData.features.Coop,
    },
    {
      ["Name"]: "Achievements",
      ["Enabled"]: gameData.features.Achievements,
    },
    {
      ["Name"]: "Controller Support",
      ["Enabled"]: gameData.features.ControllerSupport,
    },
    {
      ["Name"]: "Saves",
      ["Enabled"]: gameData.features.Saves,
    },
  ];

  let platforms = [
    {
      ["Name"]: "Windows",
      ["Enabled"]: gameData.platforms.windows,
    },
    {
      ["Name"]: "Mac",
      ["Enabled"]: gameData.platforms.mac,
    },
    {
      ["Name"]: "Linux",
      ["Enabled"]: gameData.platforms.linux,
    },
    {
      ["Name"]: "Android",
      ["Enabled"]: gameData.platforms.android,
    },
    {
      ["Name"]: "IOS",
      ["Enabled"]: gameData.platforms.ios,
    },
    {
      ["Name"]: "XBOX",
      ["Enabled"]: gameData.platforms.xbox,
    },
    {
      ["Name"]: "PlayStation",
      ["Enabled"]: gameData.platforms.playstation,
    },
    {
      ["Name"]: "Oculus",
      ["Enabled"]: gameData.platforms.oculus,
    },
  ];

  let pageOutlines = [
    {
      Enabled: gameData.page.outlines.game_details_outline,
      Element: gameStats,
      Class: "outline-input",
    },
    {
      Enabled: gameData.page.outlines.game_details_shadow,
      Element: gameStats,
      Class: "shadow-input",
    },
    {
      Enabled: gameData.page.outlines.description_outline,
      Element: gameDescBackground,
      Class: "outline-input",
    },
    {
      Enabled: gameData.page.outlines.description_shadow,
      Element: gameDescBackground,
      Class: "shadow-input",
    },
    {
      Enabled: gameData.page.outlines.bg2_outline,
      Element: gameColumn,
      Class: "outline-input",
    },
    {
      Enabled: gameData.page.outlines.bg2_shadow,
      Element: gameColumn,
      Class: "shadow-input",
    },
  ];

  let pageAlphas = [
    {
      Amount: gameData.page.alphas.bg2_alpha,
      Element: gameColumn,
    },
    {
      Amount: gameData.page.alphas.description_bg_alpha,
      Element: gameDescBackground,
    },
    {
      Amount: gameData.page.alphas.game_details_bg_alpha,
      Element: gameStats,
    },
  ];

  pageOutlines.forEach(function (outline) {
    if (!outline.Enabled) {
      outline.Element.classList.remove(outline.Class);
    }
  });

  pageAlphas.forEach(function (alpha) {
    updateBackgroundColor(alpha.Amount, alpha.Element);
  });

  features.forEach(function (feature) {
    if (feature.Enabled) {
      const featureContainer = document.createElement("div");
      featureContainer.setAttribute("class", "game-feature");
      featureContainer.textContent = feature.Name;

      gameFeatures.appendChild(featureContainer);
    }
  });

  platforms.forEach(function (platform) {
    if (platform.Enabled) {
      const platformContainer = document.createElement("div");
      platformContainer.setAttribute("class", "game-feature");
      platformContainer.textContent = platform.Name;

      gamePlatforms.appendChild(platformContainer);
    }
  });

  if (!gameData.page.default_colors) {
    const elements = document.getElementsByClassName("game-stat");

    document.body.style.backgroundColor = gameData.page.colors.bg_color;
    gameColumn.style.backgroundColor = gameData.page.colors.bg2_color;
    gameTitleColumn.style.color = gameData.page.colors.title_color;
    gameDesc.style.color = gameData.page.colors.desc_color;
    gameDescBackground.style.backgroundColor =
      gameData.page.colors.desc_bg_color;
    downloadButton.style.backgroundColor = gameData.page.colors.button_color;
    downloadButton.style.color = gameData.page.colors.button_text_color;
    gameStats.style.backgroundColor = gameData.page.colors.stats_bg_color;

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.color = gameData.page.colors.stats_text_color;
    }

    if (gameData.page.font_family != undefined) {
      gameColumn.style.fontFamily = gameData.page.font_family;
    }
  }

  downloadButton.setAttribute("href", gameData.paymentLink);

  if (user != null && user.name == gameData.developer.username) {
    const gamePublic = document.getElementById("public");
    const singlePlayer = document.getElementById("single-player");
    const multiPlayer = document.getElementById("multi-player");
    const coOp = document.getElementById("co-op");
    const achievements = document.getElementById("achievements");
    const controllerSupport = document.getElementById("controller-support");
    const saves = document.getElementById("saves");
    const vrSupport = document.getElementById("vr-support");

    const windows = document.getElementById("windows");
    const mac = document.getElementById("mac");
    const linux = document.getElementById("linux");
    const android = document.getElementById("android");
    const ios = document.getElementById("ios");
    const xbox = document.getElementById("xbox");
    const playstation = document.getElementById("playstation");
    const oculus = document.getElementById("oculus");

    const gameGenreInput = document.getElementById("genre-input");
    const gameArtStyleInput = document.getElementById("art-style-input");
    const gameAgeInput = document.getElementById("age-sort");
    const gameThumbnailInput = document.getElementById("thumbnail-input");

    const bgColorInput = document.getElementById("bg-color");
    const bg2ColorInput = document.getElementById("bg2-color");
    const titleColorInput = document.getElementById("title-color");
    const descColorInput = document.getElementById("description-color");
    const descBgColorInput = document.getElementById("description-bg-color");
    const detailsColorInput = document.getElementById("game-details-color");
    const detailsBgColorInput = document.getElementById(
      "game-details-bg-color"
    );
    const buttonBgColorInput = document.getElementById("button-bg-color");
    const buttonTextColorInput = document.getElementById("button-text-color");
    const bg2AlphaInput = document.getElementById("bg2-alpha");
    const descriptionBgAlphaInput = document.getElementById(
      "description-bg-alpha"
    );
    const detailsBgAlphaInput = document.getElementById(
      "game-details-bg-alpha"
    );
    const detailsOutlineCheckbox = document.getElementById(
      "game-details-outline-checkbox"
    );
    const detailsShadowCheckbox = document.getElementById(
      "game-details-shadow-checkbox"
    );
    const descriptionOutlineCheckbox = document.getElementById(
      "description-outline-checkbox"
    );
    const descriptionShadowCheckbox = document.getElementById(
      "description-shadow-checkbox"
    );
    const bg2OutlineCheckbox = document.getElementById("bg2-outline-checkbox");
    const bg2ShadowCheckbox = document.getElementById("bg2-shadow-checkbox");

    gameGenreInput.value = gameData.genre;
    gameArtStyleInput.value = gameData.artstyle;

    for (let i = 0; i < gameAgeInput.options.length; i++) {
      if (gameAgeInput.options[i].value == gameData.agerating.toLowerCase()) {
        gameAgeInput.selectedIndex = i;
        break;
      }
    }

    gameGenreInput.addEventListener("input", function () {
      gameGenreInput.value = gameGenreInput.value.toUpperCase();
    });

    gameArtStyleInput.addEventListener("input", function () {
      gameArtStyleInput.value = gameArtStyleInput.value.toUpperCase();
    });

    let ispublic = {
      Enabled: gameData.active ? "true" : "false",
      Element: gamePublic,
    };

    let gameFeatures = [
      {
        Name: "Singleplayer",
        Enabled: gameData.features.Singleplayer,
        Element: singlePlayer,
      },
      {
        Name: "Multiplayer",
        Enabled: gameData.features.Multiplayer,
        Element: multiPlayer,
      },
      {
        Name: "Co-op",
        Enabled: gameData.features.Coop,
        Element: coOp,
      },
      {
        Name: "Achievements",
        Enabled: gameData.features.Achievements,
        Element: achievements,
      },
      {
        Name: "Controller Support",
        Enabled: gameData.features.ControllerSupport,
        Element: controllerSupport,
      },
      {
        Name: "Saves",
        Enabled: gameData.features.Saves,
        Element: saves,
      },
      {
        Name: "VR Support",
        Enabled: gameData.features.VRSupport,
        Element: vrSupport,
      },
    ];

    let gamePlatforms = [
      {
        Name: "Windows",
        Enabled: gameData.platforms.windows,
        Element: windows,
      },
      {
        Name: "Mac",
        Enabled: gameData.platforms.mac,
        Element: mac,
      },
      {
        Name: "Linux",
        Enabled: gameData.platforms.linux,
        Element: linux,
      },
      {
        Name: "Android",
        Enabled: gameData.platforms.android,
        Element: android,
      },
      {
        Name: "IOS",
        Enabled: gameData.platforms.ios,
        Element: ios,
      },
      {
        Name: "XBOX",
        Enabled: gameData.platforms.xbox,
        Element: xbox,
      },
      {
        Name: "PlayStation",
        Enabled: gameData.platforms.playstation,
        Element: playstation,
      },
      {
        Name: "Oculus",
        Enabled: gameData.platforms.oculus,
        Element: oculus,
      },
    ];

    let pageDetailsCheckbox = [
      {
        Name: "game_details_outline",
        Enabled: gameData.page.outlines.game_details_outline,
        Element: detailsOutlineCheckbox,
        Element_Changing: gameStats,
        Class: "outline-input",
      },
      {
        Name: "game_details_shadow",
        Enabled: gameData.page.outlines.game_details_shadow,
        Element: detailsShadowCheckbox,
        Element_Changing: gameStats,
        Class: "shadow-input",
      },
      {
        Name: "description_outline",
        Enabled: gameData.page.outlines.description_outline,
        Element: descriptionOutlineCheckbox,
        Element_Changing: gameDescBackground,
        Class: "outline-input",
      },
      {
        Name: "description_shadow",
        Enabled: gameData.page.outlines.description_shadow,
        Element: descriptionShadowCheckbox,
        Element_Changing: gameDescBackground,
        Class: "shadow-input",
      },
      {
        Name: "bg2_outline",
        Enabled: gameData.page.outlines.bg2_outline,
        Element: bg2OutlineCheckbox,
        Element_Changing: gameColumn,
        Class: "outline-input",
      },
      {
        Name: "bg2_shadow",
        Enabled: gameData.page.outlines.bg2_shadow,
        Element: bg2ShadowCheckbox,
        Element_Changing: gameColumn,
        Class: "shadow-input",
      },
    ];

    let pageDetailsAlphas = [
      {
        Name: "bg2_alpha",
        Amount: gameData.page.alphas.bg2_alpha,
        Element: bg2AlphaInput,
        Element_Changing: gameColumn,
      },
      {
        Name: "description_bg_alpha",
        Amount: gameData.page.alphas.description_bg_alpha,
        Element: descriptionBgAlphaInput,
        Element_Changing: gameDescBackground,
      },
      {
        Name: "game_details_bg_alpha",
        Amount: gameData.page.alphas.game_details_bg_alpha,
        Element: detailsBgAlphaInput,
        Element_Changing: gameStats,
      },
    ];

    gameTitle.contentEditable = true;
    gameDesc.contentEditable = true;
    gameSummary.contentEditable = true;

    ispublic.Element.checked = ispublic.Enabled;
    ispublic.Element.addEventListener("change", function () {
      ispublic.Enabled = ispublic.Element.checked;
    });

    gameFeatures.forEach(function (feature) {
      feature.Element.checked = feature.Enabled;
      feature.Element.addEventListener("change", function () {
        feature.Enabled = feature.Element.checked;
      });
    });

    gamePlatforms.forEach(function (platform) {
      platform.Element.checked = platform.Enabled;
      platform.Element.addEventListener("change", function () {
        platform.Enabled = platform.Element.checked;
      });
    });

    const commitChangesButton = document.createElement("button");
    commitChangesButton.setAttribute("class", "game-download-button");
    commitChangesButton.textContent = "Commit Changes";

    gameTitle.addEventListener("input", function () {
      const text = DOMPurify.sanitize(this.textContent);

      if (text.length > 120) {
        this.textContent = text.substr(0, 120);
      }
    });

    gameSummary.addEventListener("input", function () {
      const text = DOMPurify.sanitize(this.textContent);

      if (text.length > 120) {
        this.textContent = text.substr(0, 120);
      }
    });

    gameDesc.addEventListener("input", function () {
      const text = DOMPurify.sanitize(this.innerHTML);

      if (text.length > 4000) {
        this.innerHTML = text.substr(0, 4000);
      }
    });

    bgColorInput.value = getComputedStyle(document.body)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    bgColorInput.addEventListener("input", function () {
      document.body.style.setProperty("background-color", this.value);
    });

    bg2ColorInput.value = getComputedStyle(gameColumn)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    bg2ColorInput.addEventListener("input", function () {
      gameColumn.style.setProperty("background-color", this.value);
    });

    titleColorInput.value = getComputedStyle(gameTitleColumn)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    titleColorInput.addEventListener("input", function () {
      gameTitleColumn.style.setProperty("color", this.value);
    });

    descColorInput.value = getComputedStyle(gameDesc)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    descColorInput.addEventListener("input", function () {
      gameDesc.style.setProperty("color", this.value);
    });

    descBgColorInput.value = getComputedStyle(gameDescBackground)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    descBgColorInput.addEventListener("input", function () {
      gameDescBackground.style.setProperty("background-color", this.value);
    });

    buttonBgColorInput.value = getComputedStyle(downloadButton)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    buttonBgColorInput.addEventListener("input", function () {
      downloadButton.style.setProperty("background-color", this.value);
    });

    buttonTextColorInput.value = getComputedStyle(downloadButton)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    buttonTextColorInput.addEventListener("input", function () {
      downloadButton.style.setProperty("color", this.value);
    });

    detailsColorInput.value = getComputedStyle(gameStats)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    detailsColorInput.addEventListener("input", function () {
      gameStats.style.setProperty("color", this.value);
    });

    detailsBgColorInput.value = getComputedStyle(gameStats)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    detailsBgColorInput.addEventListener("input", function () {
      gameStats.style.setProperty("background-color", this.value);
    });

    pageDetailsAlphas.forEach(function (pageDetail) {
      pageDetail.Element.value = pageDetail.Amount;
      pageDetail.Element.addEventListener("input", function () {
        pageDetail.Amount = pageDetail.Element.value;
        updateBackgroundColor(pageDetail.Element, pageDetail.Element_Changing);
      });
    });

    pageDetailsCheckbox.forEach(function (pageDetail) {
      pageDetail.Element.checked = pageDetail.Enabled;
      pageDetail.Element.addEventListener("change", function () {
        pageDetail.Enabled = this.checked;

        if (this.checked) {
          pageDetail.Element_Changing.classList.add(pageDetail.Class);
        } else {
          pageDetail.Element_Changing.classList.remove(pageDetail.Class);
        }
      });
    });

    let isLoading = false;
    commitChangesButton.addEventListener("click", async function () {
      const gameStatElements = document.getElementsByClassName("game-stat");

      if (!isLoading) {
        isLoading = true;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const image = gameThumbnailInput.files[0];
        const reader = new FileReader();
        let imageURI;

        if (image instanceof Blob) {
          reader.onload = function (event) {
            imageURI = event.target.result;
          };

          await new Promise((resolve) => {
            reader.onloadend = () => resolve();
            reader.readAsDataURL(image);
          });
        }

        const updateGameOptionsBody = {
          name: gameTitle.textContent,
          description: gameDesc.innerHTML,
          summary: gameSummary.textContent,
          genre: gameGenreInput.textContent,
          artstyle: gameArtStyleInput.textContent,
          age_rating: gameAgeInput.options[gameAgeInput.selectedIndex].value,
          active: ispublic.Enabled ? "true" : "false",
          platforms: {
            windows: gamePlatforms[0].Enabled ? "true" : "false",
            mac: gamePlatforms[1].Enabled ? "true" : "false",
            linux: gamePlatforms[2].Enabled ? "true" : "false",
            android: gamePlatforms[3].Enabled ? "true" : "false",
            ios: gamePlatforms[4].Enabled ? "true" : "false",
            xbox: gamePlatforms[5].Enabled ? "true" : "false",
            playstation: gamePlatforms[6].Enabled ? "true" : "false",
            oculus: gamePlatforms[7].Enabled ? "true" : "false",
          },
          features: {
            Singleplayer: gameFeatures[0].Enabled ? "true" : "false",
            Multiplayer: gameFeatures[1].Enabled ? "true" : "false",
            Coop: gameFeatures[2].Enabled ? "true" : "false",
            Achievements: gameFeatures[3].Enabled ? "true" : "false",
            ControllerSupport: gameFeatures[4].Enabled ? "true" : "false",
            Saves: gameFeatures[5].Enabled ? "true" : "false",
            VRSupport: gameFeatures[6].Enabled ? "true" : "false",
          },
          page: {
            font_family: getComputedStyle(gameColumn)
              .getPropertyValue("font-family")
              .toString(),
            defaultColors: false,
            outlines: {
              game_details_outline: pageDetailsCheckbox[0].Enabled
                ? "true"
                : "false",
              game_details_shadow: pageDetailsCheckbox[1].Enabled
                ? "true"
                : "false",
              description_outline: pageDetailsCheckbox[2].Enabled
                ? "true"
                : "false",
              description_shadow: pageDetailsCheckbox[3].Enabled
                ? "true"
                : "false",
              bg2_outline: pageDetailsCheckbox[4].Enabled ? "true" : "false",
              bg2_shadow: pageDetailsCheckbox[5].Enabled ? "true" : "false",
            },
            alphas: {
              bg2_alpha: pageDetailsAlphas[0].Amount,
              description_bg_alpha: pageDetailsAlphas[1].Amount,
              game_details_bg_alpha: pageDetailsAlphas[2].Amount,
            },
            colors: {
              bg_color: getComputedStyle(document.body).getPropertyValue(
                "background-color"
              ),
              bg2_color:
                getComputedStyle(gameColumn).getPropertyValue(
                  "background-color"
                ),
              title_color:
                getComputedStyle(gameTitleColumn).getPropertyValue("color"),
              desc_color: getComputedStyle(gameDesc).getPropertyValue("color"),
              desc_bg_color:
                getComputedStyle(gameDescBackground).getPropertyValue(
                  "background-color"
                ),
              button_color:
                getComputedStyle(downloadButton).getPropertyValue(
                  "background-color"
                ),
              button_text_color:
                getComputedStyle(downloadButton).getPropertyValue("color"),
              stats_bg_color:
                getComputedStyle(gameStats).getPropertyValue(
                  "background-color"
                ),
              stats_text_color: getComputedStyle(
                gameStatElements[0]
              ).getPropertyValue("color"),
            },
          },
        };

        if (imageURI !== null) {
          updateGameOptionsBody.icon = imageURI;
        }

        const updateGameOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(updateGameOptionsBody),
        };

        commitChangesButton.textContent = "Uploading..";
        await updateProduct(updateGameOptions, realGameId, commitChangesButton);
        isLoading = false;
      }
    });

    document.getElementById("buttons").appendChild(commitChangesButton);
  } else {
    document.getElementById("game-editing").remove();
  }
};

if (gameIdParam != null) {
  gameHandler(gameIdParam);
} else {
  console.warn("There is no game id.");
  window.location.assign("404");
}
