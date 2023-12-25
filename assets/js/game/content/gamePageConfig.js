const update_game = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/";
const get_game = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/";
const get_price = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices/";

import { fetch_user } from "../../user/sessionManager.js";
import { request } from "../../base/apiManager.js";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");

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

function updateBackgroundColor(alphaInput, styleElement) {
  const alphaValue = alphaInput.value / 100;

  const rgbValues =
    getComputedStyle(styleElement).getPropertyValue("background-color");
  const match = rgbValues.match(/\d+/g).map(Number);
  const r = match[0];
  const g = match[1];
  const b = match[2];

  const newBackgroundColor = `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
  styleElement.style.setProperty("background-color", newBackgroundColor);
}

async function retrieveGameData(gameId) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  async function getGameData() {
    const result = await request(
      `${get_game}${gameId}`,
      options,
      true,
      "game data"
    );

    if (result.Success) {
      return result.Result;
    } else {
      throw new Error(`Unable to get game data: ${result.Result}`);
    }
  }

  const rawGameData = await getGameData();

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

  const publishedDaysAgo = Math.ceil(publishedDifference / (1000 * 3600 * 24));
  const publishedWeeksAgo = Math.floor(publishedDaysAgo / 7);
  const publishedMonthsAgo = Math.floor(publishedDaysAgo / 31);
  const publishedYearsAgo = Math.floor(publishedDaysAgo / 365);

  const updatedDaysAgo = Math.ceil(updatedDifference / (1000 * 3600 * 24));
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
    async function getPriceData() {
      const result = await request(
        `${get_price}${rawGameData.product_id}`,
        options,
        true,
        "price data"
      );

      if (result.Success) {
        return result.Result;
      } else {
        throw new Error(`Unable to get price data: ${result.Result}`);
      }
    }

    const response = await getPriceData();

    if (response.currency) {
      priceData = {
        currency: response.currency.toUpperCase(),
        amount: parseFloat(response.unit_amount / 100),
      };
    }
  }

  const gameData = {
    id: rawGameData.id,
    name: rawGameData.name,
    active: rawGameData.active,
    description: rawGameData.description,
    developer_name: rawGameData.developer_name,
    developer_id: rawGameData.developer_id,
    genre: rawGameData.genre,
    summary: rawGameData.summary,
    artstyle: rawGameData.artstyle,
    filesize: rawGameData.size,
    agerating: rawGameData.age_rating,
    icon: rawGameData.icon,
    created: createdFormattedDate,
    updated: updatedFormattedDate,
    datestodays: datestodays,
    features: rawGameData.features,
    platforms: rawGameData.platforms,
    price: priceData,
    download_key: rawGameData.product_id,
    page: rawGameData.page,
  };

  return gameData;
}

async function changeProduct(data, gameId, commitChangesButton) {
  const result = await request(`${update_game}${gameId}`, data, false);

  if (result.Success) {
    commitChangesButton.textContent = "Success";
  } else {
    console.error(`Error trying to update game: ${result.Result}`);
    commitChangesButton.textContent = "An error occured";
  }
}

const gameHandler = async (gameId) => {
  const user = await fetch_user();
  const gameData = await retrieveGameData(gameId);

  const realGameId = gameData.id;

  const game_title = document.getElementById("game-title");
  const game_desc = document.getElementById("description");
  const created = document.getElementById("created");
  const updated = document.getElementById("updated");

  const navigation_title = document.getElementById("navigation-title");
  const icon = document.getElementById("icon");

  const developer_name = document.getElementById("game-developer-name");
  const download_button = document.getElementById("download-button");
  const game_genre = document.getElementById("game-genre");
  const game_summary = document.getElementById("game-summary");
  const game_art = document.getElementById("game-art");
  const game_age = document.getElementById("game-age");
  const game_size = document.getElementById("game-size");
  const game_price = document.getElementById("game-price");
  const game_features = document.getElementById("features");
  const game_platforms = document.getElementById("platforms");

  const game_column = document.getElementById("game-column");
  const game_title_column = document.getElementById("game-title-column");
  const game_stats = document.getElementById("game-stats");
  const game_desc_background = document.getElementById("game-description");

  game_title.textContent = gameData.name;
  game_desc.innerHTML = DOMPurify.sanitize(gameData.description);
  game_price.textContent = `${gameData.price.amount} ${gameData.price.currency}`;

  function format_time_single(timeago, option, unit) {
    return timeago === 1
      ? `${option} (1 ${unit} Ago)`
      : `${option} (${timeago} ${unit}s Ago)`;
  }

  function format_time(
    created_or_updated,
    years_ago,
    months_ago,
    weeks_ago,
    days_ago
  ) {
    switch (true) {
      case years_ago >= 1:
        return format_time_single(years_ago, created_or_updated, "Year");
      case months_ago >= 1:
        return format_time_single(months_ago, created_or_updated, "Month");
      case weeks_ago >= 1:
        return format_time_single(weeks_ago, created_or_updated, "Week");
      case days_ago >= 1:
        return format_time_single(days_ago, created_or_updated, "Day");
      default:
        return "Just Now";
    }
  }

  created.textContent = format_time(
    gameData.created,
    gameData.datestodays.publishedYearsAgo,
    gameData.datestodays.publishedMonthsAgo,
    gameData.datestodays.publishedWeeksAgo,
    gameData.datestodays.publishedDaysAgo
  );
  updated.textContent = format_time(
    gameData.updated,
    gameData.datestodays.updatedYearsAgo,
    gameData.datestodays.updatedMonthsAgo,
    gameData.datestodays.updatedWeeksAgo,
    gameData.datestodays.updatedDaysAgo
  );

  icon.setAttribute("href", gameData.icon.url);
  navigation_title.textContent = `${gameData.name} By ${gameData.developer_name}`;

  developer_name.textContent = gameData.developer_name;
  game_genre.textContent = gameData.genre.toUpperCase();
  game_summary.textContent = gameData.summary;
  game_art.textContent = gameData.artstyle.toUpperCase();
  game_age.textContent = gameData.agerating.toUpperCase();
  game_size.textContent = gameData.filesize;

  developer_name.setAttribute("href", `user?id=${gameData.developer_id}`);
  game_genre.setAttribute("href", `category?n=${gameData.genre.toUpperCase()}`);

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

  let page_outlines = [
    {
      Enabled: gameData.page.outlines.game_details_outline,
      Element: game_stats,
      Class: "outline-input",
    },
    {
      Enabled: gameData.page.outlines.game_details_shadow,
      Element: game_stats,
      Class: "shadow-input",
    },
    {
      Enabled: gameData.page.outlines.description_outline,
      Element: game_desc_background,
      Class: "outline-input",
    },
    {
      Enabled: gameData.page.outlines.description_shadow,
      Element: game_desc_background,
      Class: "shadow-input",
    },
    {
      Enabled: gameData.page.outlines.bg2_outline,
      Element: game_column,
      Class: "outline-input",
    },
    {
      Enabled: gameData.page.outlines.bg2_shadow,
      Element: game_column,
      Class: "shadow-input",
    },
  ];

  let page_alphas = [
    {
      Amount: gameData.page.alphas.bg2_alpha,
      Element: game_column,
    },
    {
      Amount: gameData.page.alphas.description_bg_alpha,
      Element: game_desc_background,
    },
    {
      Amount: gameData.page.alphas.game_details_bg_alpha,
      Element: game_stats,
    },
  ];

  page_outlines.forEach(function (outline) {
    if (!outline.Enabled) {
      outline.Element.classList.remove(outline.Class);
    }
  });

  page_alphas.forEach(function (alpha) {
    updateBackgroundColor(alpha.Amount, alpha.Element);
  });

  features.forEach(function (feature) {
    if (feature.Enabled) {
      const feature_element = document.createElement("div");
      feature_element.setAttribute("class", "game-feature");
      feature_element.textContent = feature.Name;

      game_features.appendChild(feature_element);
    }
  });

  platforms.forEach(function (platform) {
    if (platform.Enabled) {
      const platform_element = document.createElement("div");
      platform_element.setAttribute("class", "game-feature");
      platform_element.textContent = platform.Name;

      game_platforms.appendChild(platform_element);
    }
  });

  if (!gameData.page.default_colors) {
    const elements = document.getElementsByClassName("game-stat");

    document.body.style.backgroundColor = gameData.page.colors.bg_color;
    game_column.style.backgroundColor = gameData.page.colors.bg2_color;
    game_title_column.style.color = gameData.page.colors.title_color;
    game_desc.style.color = gameData.page.colors.desc_color;
    game_desc_background.style.backgroundColor =
      gameData.page.colors.desc_bg_color;
    download_button.style.backgroundColor = gameData.page.colors.button_color;
    download_button.style.color = gameData.page.colors.button_text_color;
    game_stats.style.backgroundColor = gameData.page.colors.stats_bg_color;

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.color = gameData.page.colors.stats_text_color;
    }

    if (gameData.page.font_family != undefined) {
      game_column.style.fontFamily = gameData.page.font_family;
    }
  }

  download_button.addEventListener("click", function () {
    window.location.assign(`download?g=${gameData.download_key}`);
  });

  if (user != null && user.name == gameData.developer_name) {
    const game_public = document.getElementById("public");
    const single_player = document.getElementById("single-player");
    const multi_player = document.getElementById("multi-player");
    const co_op = document.getElementById("co-op");
    const achievements = document.getElementById("achievements");
    const controller_support = document.getElementById("controller-support");
    const saves = document.getElementById("saves");
    const vr_support = document.getElementById("vr-support");

    const windows = document.getElementById("windows");
    const mac = document.getElementById("mac");
    const linux = document.getElementById("linux");
    const android = document.getElementById("android");
    const ios = document.getElementById("ios");
    const xbox = document.getElementById("xbox");
    const playstation = document.getElementById("playstation");
    const oculus = document.getElementById("oculus");

    const game_genre_input = document.getElementById("genre-input");
    const game_art_style_input = document.getElementById("art-style-input");
    const game_age_input = document.getElementById("age-sort");
    const game_thumbnail_input = document.getElementById("thumbnail-input");

    const bg_color_input = document.getElementById("bg-color");
    const bg2_color_input = document.getElementById("bg2-color");
    const title_color_input = document.getElementById("title-color");
    const desc_color_input = document.getElementById("description-color");
    const desc_bg_color_input = document.getElementById("description-bg-color");
    const details_color_input = document.getElementById("game-details-color");
    const details_bg_color_input = document.getElementById(
      "game-details-bg-color"
    );
    const button_bg_color_input = document.getElementById("button-bg-color");
    const button_text_color_input =
      document.getElementById("button-text-color");
    const bg2_alpha_input = document.getElementById("bg2-alpha");
    const description_bg_alpha_input = document.getElementById(
      "description-bg-alpha"
    );
    const details_bg_alpha_input = document.getElementById(
      "game-details-bg-alpha"
    );
    const details_outline_checkbox = document.getElementById(
      "game-details-outline-checkbox"
    );
    const details_shadow_checkbox = document.getElementById(
      "game-details-shadow-checkbox"
    );
    const description_outline_checkbox = document.getElementById(
      "description-outline-checkbox"
    );
    const description_shadow_checkbox = document.getElementById(
      "description-shadow-checkbox"
    );
    const bg2_outline_checkbox = document.getElementById(
      "bg2-outline-checkbox"
    );
    const bg2_shadow_checkbox = document.getElementById("bg2-shadow-checkbox");

    game_genre_input.value = gameData.genre;
    game_art_style_input.value = gameData.artstyle;

    for (let i = 0; i < game_age_input.options.length; i++) {
      if (game_age_input.options[i].value == gameData.agerating.toLowerCase()) {
        game_age_input.selectedIndex = i;
        break;
      }
    }

    game_genre_input.addEventListener("input", function () {
      game_genre_input.value = game_genre_input.value.toUpperCase();
    });

    game_art_style_input.addEventListener("input", function () {
      game_art_style_input.value = game_art_style_input.value.toUpperCase();
    });

    let ispublic = {
      Enabled: gameData.active ? "true" : "false",
      Element: game_public,
    };

    let game_features = [
      {
        Name: "Singleplayer",
        Enabled: gameData.features.Singleplayer,
        Element: single_player,
      },
      {
        Name: "Multiplayer",
        Enabled: gameData.features.Multiplayer,
        Element: multi_player,
      },
      {
        Name: "Co-op",
        Enabled: gameData.features.Coop,
        Element: co_op,
      },
      {
        Name: "Achievements",
        Enabled: gameData.features.Achievements,
        Element: achievements,
      },
      {
        Name: "Controller Support",
        Enabled: gameData.features.ControllerSupport,
        Element: controller_support,
      },
      {
        Name: "Saves",
        Enabled: gameData.features.Saves,
        Element: saves,
      },
      {
        Name: "VR Support",
        Enabled: gameData.features.VRSupport,
        Element: vr_support,
      },
    ];

    let game_platforms = [
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

    let page_details_checkboxes = [
      {
        Name: "game_details_outline",
        Enabled: gameData.page.outlines.game_details_outline,
        Element: details_outline_checkbox,
        Element_Changing: game_stats,
        Class: "outline-input",
      },
      {
        Name: "game_details_shadow",
        Enabled: gameData.page.outlines.game_details_shadow,
        Element: details_shadow_checkbox,
        Element_Changing: game_stats,
        Class: "shadow-input",
      },
      {
        Name: "description_outline",
        Enabled: gameData.page.outlines.description_outline,
        Element: description_outline_checkbox,
        Element_Changing: game_desc_background,
        Class: "outline-input",
      },
      {
        Name: "description_shadow",
        Enabled: gameData.page.outlines.description_shadow,
        Element: description_shadow_checkbox,
        Element_Changing: game_desc_background,
        Class: "shadow-input",
      },
      {
        Name: "bg2_outline",
        Enabled: gameData.page.outlines.bg2_outline,
        Element: bg2_outline_checkbox,
        Element_Changing: game_column,
        Class: "outline-input",
      },
      {
        Name: "bg2_shadow",
        Enabled: gameData.page.outlines.bg2_shadow,
        Element: bg2_shadow_checkbox,
        Element_Changing: game_column,
        Class: "shadow-input",
      },
    ];

    let page_details_alphas = [
      {
        Name: "bg2_alpha",
        Amount: gameData.page.alphas.bg2_alpha,
        Element: bg2_alpha_input,
        Element_Changing: game_column,
      },
      {
        Name: "description_bg_alpha",
        Amount: gameData.page.alphas.description_bg_alpha,
        Element: description_bg_alpha_input,
        Element_Changing: game_desc_background,
      },
      {
        Name: "game_details_bg_alpha",
        Amount: gameData.page.alphas.game_details_bg_alpha,
        Element: details_bg_alpha_input,
        Element_Changing: game_stats,
      },
    ];

    game_title.contentEditable = true;
    game_desc.contentEditable = true;
    game_summary.contentEditable = true;

    ispublic.Element.checked = ispublic.Enabled;
    ispublic.Element.addEventListener("change", function () {
      ispublic.Enabled = ispublic.Element.checked;
    });

    game_features.forEach(function (feature) {
      feature.Element.checked = feature.Enabled;
      feature.Element.addEventListener("change", function () {
        feature.Enabled = feature.Element.checked;
      });
    });

    game_platforms.forEach(function (platform) {
      platform.Element.checked = platform.Enabled;
      platform.Element.addEventListener("change", function () {
        platform.Enabled = platform.Element.checked;
      });
    });

    const commitChangesButton = document.createElement("button");
    commitChangesButton.className = "game-download-button";
    commitChangesButton.textContent = "Commit Changes";

    game_title.addEventListener("input", function () {
      const text = DOMPurify.sanitize(this.textContent);

      if (text.length > 120) {
        this.textContent = text.substr(0, 120);
      }
    });

    game_summary.addEventListener("input", function () {
      const text = DOMPurify.sanitize(this.textContent);

      if (text.length > 120) {
        this.textContent = text.substr(0, 120);
      }
    });

    game_desc.addEventListener("input", function () {
      const text = DOMPurify.sanitize(this.innerHTML);

      if (text.length > 4000) {
        this.innerHTML = text.substr(0, 4000);
      }
    });

    bg_color_input.value = getComputedStyle(document.body)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    bg_color_input.addEventListener("input", function () {
      document.body.style.setProperty("background-color", this.value);
    });

    bg2_color_input.value = getComputedStyle(game_column)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    bg2_color_input.addEventListener("input", function () {
      game_column.style.setProperty("background-color", this.value);
    });

    title_color_input.value = getComputedStyle(game_title_column)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    title_color_input.addEventListener("input", function () {
      game_title_column.style.setProperty("color", this.value);
    });

    desc_color_input.value = getComputedStyle(game_desc)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    desc_color_input.addEventListener("input", function () {
      game_desc.style.setProperty("color", this.value);
    });

    desc_bg_color_input.value = getComputedStyle(game_desc_background)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    desc_bg_color_input.addEventListener("input", function () {
      game_desc_background.style.setProperty("background-color", this.value);
    });

    button_bg_color_input.value = getComputedStyle(download_button)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    button_bg_color_input.addEventListener("input", function () {
      download_button.style.setProperty("background-color", this.value);
    });

    button_text_color_input.value = getComputedStyle(download_button)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    button_text_color_input.addEventListener("input", function () {
      download_button.style.setProperty("color", this.value);
    });

    details_color_input.value = getComputedStyle(game_stats)
      .getPropertyValue("color")
      .toString()
      .convertToHex();
    details_color_input.addEventListener("input", function () {
      game_stats.style.setProperty("color", this.value);
    });

    details_bg_color_input.value = getComputedStyle(game_stats)
      .getPropertyValue("background-color")
      .toString()
      .convertToHex();
    details_bg_color_input.addEventListener("input", function () {
      game_stats.style.setProperty("background-color", this.value);
    });

    page_details_alphas.forEach(function (page_detail) {
      page_detail.Element.value = page_detail.Amount;
      page_detail.Element.addEventListener("input", function () {
        page_detail.Amount = page_detail.Element.value;
        updateBackgroundColor(
          page_detail.Element,
          page_detail.Element_Changing
        );
      });
    });

    page_details_checkboxes.forEach(function (page_detail) {
      page_detail.Element.checked = page_detail.Enabled;
      page_detail.Element.addEventListener("change", function () {
        page_detail.Enabled = this.checked;

        if (this.checked) {
          page_detail.Element_Changing.classList.add(page_detail.Class);
        } else {
          page_detail.Element_Changing.classList.remove(page_detail.Class);
        }
      });
    });

    let isLoading = false;
    commitChangesButton.addEventListener("click", async function () {
      const game_stat_elemts = document.getElementsByClassName("game-stat");

      if (!isLoading) {
        isLoading = true;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const image = game_thumbnail_input.files[0];
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

        const update_game_options_body = {
          name: game_title.textContent,
          description: game_desc.innerHTML,
          summary: game_summary.textContent,
          genre: game_genre_input.textContent,
          artstyle: game_art_style_input.textContent,
          age_rating:
            game_age_input.options[game_age_input.selectedIndex].value,
          active: ispublic.Enabled ? "true" : "false",
          platforms: {
            windows: game_platforms[0].Enabled ? "true" : "false",
            mac: game_platforms[1].Enabled ? "true" : "false",
            linux: game_platforms[2].Enabled ? "true" : "false",
            android: game_platforms[3].Enabled ? "true" : "false",
            ios: game_platforms[4].Enabled ? "true" : "false",
            xbox: game_platforms[5].Enabled ? "true" : "false",
            playstation: game_platforms[6].Enabled ? "true" : "false",
            oculus: game_platforms[7].Enabled ? "true" : "false",
          },
          features: {
            Singleplayer: game_features[0].Enabled ? "true" : "false",
            Multiplayer: game_features[1].Enabled ? "true" : "false",
            Coop: game_features[2].Enabled ? "true" : "false",
            Achievements: game_features[3].Enabled ? "true" : "false",
            ControllerSupport: game_features[4].Enabled ? "true" : "false",
            Saves: game_features[5].Enabled ? "true" : "false",
            VRSupport: game_features[6].Enabled ? "true" : "false",
          },
          page: {
            font_family: getComputedStyle(game_column)
              .getPropertyValue("font-family")
              .toString(),
            defaultColors: false,
            outlines: {
              game_details_outline: page_details_checkboxes[0].Enabled
                ? "true"
                : "false",
              game_details_shadow: page_details_checkboxes[1].Enabled
                ? "true"
                : "false",
              description_outline: page_details_checkboxes[2].Enabled
                ? "true"
                : "false",
              description_shadow: page_details_checkboxes[3].Enabled
                ? "true"
                : "false",
              bg2_outline: page_details_checkboxes[4].Enabled
                ? "true"
                : "false",
              bg2_shadow: page_details_checkboxes[5].Enabled ? "true" : "false",
            },
            alphas: {
              bg2_alpha: page_details_alphas[0].Amount,
              description_bg_alpha: page_details_alphas[1].Amount,
              game_details_bg_alpha: page_details_alphas[2].Amount,
            },
            colors: {
              bg_color: getComputedStyle(document.body).getPropertyValue(
                "background-color"
              ),
              bg2_color:
                getComputedStyle(game_column).getPropertyValue(
                  "background-color"
                ),
              title_color:
                getComputedStyle(game_title_column).getPropertyValue("color"),
              desc_color: getComputedStyle(game_desc).getPropertyValue("color"),
              desc_bg_color:
                getComputedStyle(game_desc_background).getPropertyValue(
                  "background-color"
                ),
              button_color:
                getComputedStyle(download_button).getPropertyValue(
                  "background-color"
                ),
              button_text_color:
                getComputedStyle(download_button).getPropertyValue("color"),
              stats_bg_color:
                getComputedStyle(game_stats).getPropertyValue(
                  "background-color"
                ),
              stats_text_color: getComputedStyle(
                game_stat_elemts[0]
              ).getPropertyValue("color"),
            },
          },
        };

        if (imageURI !== null) {
          update_game_options_body.icon = imageURI;
        }

        const update_game_options = {
          method: "POST",
          headers: myHeaders,
          redirect: "follow",
          body: JSON.stringify(update_game_options_body),
        };

        commitChangesButton.textContent = "Uploading..";
        await changeProduct(
          update_game_options,
          realGameId,
          commitChangesButton
        );
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
