const update_product_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/"; // + game id
const get_game_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games/"; // + game id
const get_price_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices/" // + price id

import { getUser } from "./exportuser.js";

const urlParams = new URLSearchParams(window.location.search);
const gameIdParam = urlParams.get("g");

async function retrieveGameData(gameId) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  async function getGameData() {
    try {
      const response = await fetch(get_game_url + gameId, options);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      return result_parse;
    } catch (error) {
      console.error("There was an error trying to get game: ", error);
      window.location.assign("404");
    }
  }

  const rawGameData = await getGameData();

  const createdDate = new Date(rawGameData.created_at);
  const updatedDate = new Date(rawGameData.updated_at);

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
      try {
        const response = await fetch(get_price_url + rawGameData.product_id, options);
        const result = await response.text();
        const result_parse = JSON.parse(result);
  
        return result_parse;
      } catch (error) {
        console.error("There was an error trying to get price: ", error);
        window.location.assign("404");
      };
    };

    const response = await getPriceData();

    if (response.currency) {
      priceData = {
        currency: response.currency.toUpperCase(),
        amount: parseFloat(response.unit_amount / 100),
      }
    }
  }

  const gameData = {
    id: rawGameData.id,
    name: rawGameData.name,
    active: rawGameData.active,
    description: rawGameData.description,
    fontFamily: rawGameData.font,
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
    useDefaultColors: rawGameData.defaultColors,
    colors: rawGameData.colors,
    price: priceData,
  };

  return gameData;
}

async function changeProduct(data, gameId, commitChangesButton) {
  try {
    const response = await fetch(update_product_url + gameId, data);

    if (response.ok) {
      commitChangesButton.innerHTML = "Success";
    } else {
      commitChangesButton.innerHTML = "An error occured";
      console.error(
        "There was an error trying to update the product:",
        response.status
      );
    }
  } catch (error) {
    commitChangesButton.innerHTML = "An error occured";
    console.error("There was an error trying to update the product:", error);
  }
}

const gameHandler = async (gameId) => {
  if (gameId != null) {
    const user = await getUser();
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

    // main data
    game_title.textContent = gameData.name;
    game_desc.innerHTML = gameData.description;
    game_price.textContent = `${gameData.price.amount} ${gameData.price.currency}`;

    function formatTimeAgo(
      createdOrUpdated,
      publishedOrUpdatedYearsAgo,
      publishedOrUpdatedMonthsAgo,
      publishedOrUpdatedWeeksAgo,
      publishedOrUpdatedDaysAgo
    ) {
      if (publishedOrUpdatedYearsAgo >= 1) {
        return publishedOrUpdatedYearsAgo === 1
          ? `${createdOrUpdated} (1 Year Ago)`
          : publishedOrUpdatedYearsAgo > 1
          ? `${createdOrUpdated} (${publishedOrUpdatedYearsAgo} Years Ago)`
          : false;
      } else if (publishedOrUpdatedMonthsAgo >= 1) {
        return publishedOrUpdatedMonthsAgo === 1
          ? `${createdOrUpdated} (1 Month Ago)`
          : publishedOrUpdatedMonthsAgo > 1
          ? `${createdOrUpdated} (${publishedOrUpdatedMonthsAgo} Months Ago)`
          : false;
      } else if (publishedOrUpdatedWeeksAgo >= 1) {
        return publishedOrUpdatedWeeksAgo === 1
          ? `${createdOrUpdated} (1 Week Ago)`
          : publishedOrUpdatedWeeksAgo > 1
          ? `${createdOrUpdated} (${publishedOrUpdatedWeeksAgo} Weeks Ago)`
          : false;
      } else if (publishedOrUpdatedDaysAgo >= 1) {
        return publishedOrUpdatedDaysAgo === 1
          ? `${createdOrUpdated} (1 Day Ago)`
          : publishedOrUpdatedDaysAgo > 1
          ? `${createdOrUpdated} (${publishedOrUpdatedDaysAgo} Days Ago)`
          : false;
      } else {
        return false;
      }
    }

    created.innerHTML = formatTimeAgo(
      gameData.created,
      gameData.datestodays.publishedYearsAgo,
      gameData.datestodays.publishedMonthsAgo,
      gameData.datestodays.publishedWeeksAgo,
      gameData.datestodays.publishedDaysAgo
    );
    updated.innerHTML = formatTimeAgo(
      gameData.updated,
      gameData.datestodays.updatedYearsAgo,
      gameData.datestodays.updatedMonthsAgo,
      gameData.datestodays.updatedWeeksAgo,
      gameData.datestodays.updatedDaysAgo
    );

    icon.setAttribute("href", gameData.icon);
    navigation_title.textContent = `${gameData.name} By ${gameData.developer_name}`;

    // metadata
    developer_name.textContent = gameData.developer_name;
    game_genre.textContent = gameData.genre.toUpperCase();
    game_summary.textContent = gameData.summary;
    game_art.textContent = gameData.artstyle.toUpperCase();
    game_age.textContent = gameData.agerating.toUpperCase();
    game_size.textContent = `${gameData.filesize} MB`;

    developer_name.setAttribute("href", `user?id=${gameData.developer_id}`);
    game_genre.setAttribute("href", `category?n=${gameData.genre.toUpperCase()}`);

    if (!gameData.useDefaultColors) {
      const elements = document.getElementsByClassName("game-stat");

      for (let i = 0; i < elements.length; i++) {
        elements[i].style.color = gameData.colors.statsColor;
      }

      document.body.style.backgroundColor = gameData.colors.bgColor;
      document.getElementById("game-column").style.backgroundColor =
        gameData.colors.bg2Color;
      document.getElementById("game-title-column").style.color =
        gameData.colors.titleColor;
      document.getElementById("description").style.color =
        gameData.colors.descColor;
      document.getElementById("download-button").style.backgroundColor =
        gameData.colors.buttonColor;
      document.getElementById("download-button").style.color =
        gameData.colors.buttonTextColor;
      document.getElementById("game-stats").style.color =
        gameData.colors.statsBGColor;

      if (gameData.fontFamily != undefined) {
        document.getElementById("game-column").style.fontFamily =
          gameData.fontFamily;
      }
    }

    download_button.addEventListener("click", function () {
      const newGameId = realGameId.replace(/^prod_/, "");
      const newPriceId = gameId.replace(/^price_/, "");
      window.location.assign(`download?g=${newGameId}&p=${newPriceId}`);
    });

    if (user != null && user.name == gameData.developer_name) {
    const game_public = document.getElementById("public");
    const game_genre_input = document.getElementById("genre-input");
    const game_age_input = document.getElementById("age-sort");
    const game_icon_input = document.getElementById("thumbnail");

    game_public.checked = gameData.active ? "true" : "false";
    let isChecked = gameData.active ? "true" : "false";
    game_public.addEventListener("change", function () {
      isChecked = game_public.checked ? "true" : "false";
    });

      game_title.contentEditable = true;
      game_desc.contentEditable = true;
      game_summary.contentEditable = true;

      const commitChangesButton = document.createElement("button");
      commitChangesButton.className = "game-download-button";
      commitChangesButton.innerHTML = "Commit Changes";

      game_title.addEventListener("input", function () {
        const text = this.textContent;

        if (text.length > 120) {
          this.innerHTML = text.slice(0, 120);
        }
      });

      game_summary.addEventListener("input", function () {
        const text = this.innerHTML;

        if (text.length > 120) {
          this.innerHTML = text.slice(0, 120);
        }
      });

      game_desc.addEventListener("input", function () {
        const text = this.innerHTML;

        if (text.length > 4000) {
          this.innerHTML = text.slice(0, 4000);
        }
      });

      function create_stat(stat_name) {
        const game_stat = document.createElement("div");
        game_stat.className = "game-setting";

        const stat_title = document.createElement("div");
        stat_title.textContent = stat_name;
        game_stat.appendChild(stat_title);

        const changeBGcolor = document.createElement("input");
        changeBGcolor.className = "game-download-input";
        changeBGcolor.type = "color";
        game_stat.appendChild(changeBGcolor);
        document.getElementById("game-settings").appendChild(game_stat);

        return changeBGcolor;
      }

      const changeBGcolor = create_stat("BG Color");
      const changeBG2color = create_stat("BG2 Color");
      const changeTitleColor = create_stat("Title Color");
      const changeDescColor = create_stat("Description Color");
      const changeDescBGColor = create_stat("Description BG Color");
      const changeStatsColor = create_stat("Game Details Color");
      const changeStatsBGColor = create_stat("Game Details BG Color");
      const changeButtonColor = create_stat("Button BG Color");
      const changeButtonText = create_stat("Button Text Color");

      changeBGcolor.value = document.body.style.backgroundColor;
      changeBGcolor.onchange = function () {
        document.body.style.backgroundColor = changeBGcolor.value;
      };

      changeBG2color.onchange = function () {
        document.getElementById("game-column").style.backgroundColor =
          changeBG2color.value;
      };

      changeTitleColor.onchange = function () {
        document.getElementById("game-title-column").style.color =
          changeTitleColor.value;
      };

      changeDescColor.onchange = function () {
        document.getElementById("description").style.color =
          changeDescColor.value;
      };

      changeDescBGColor.onchange = function () {
        document.getElementById("description").style.backgroundColor =
          changeDescBGColor.value;
      };

      changeButtonColor.onchange = function () {
        document.getElementById("download-button").style.backgroundColor =
          changeButtonColor.value;
      };

      changeButtonText.onchange = function () {
        document.getElementById("download-button").style.color =
          changeButtonText.value;
      };

      changeStatsColor.value =
        document.getElementById("game-stats").style.color;
      changeStatsColor.onchange = function () {
        const game_stats = document.getElementById("game-stats");
        game_stats.style.color = changeStatsColor.value;
      };

      changeStatsBGColor.value =
        document.getElementById("game-stats").style.backgroundColor;
      changeStatsBGColor.onchange = function () {
        const game_stats = document.getElementById("game-stats");
        game_stats.style.backgroundColor = changeStatsBGColor.value;
      };

      let isLoading = false;
      commitChangesButton.addEventListener("click", async function () {
        if (!isLoading) {
          isLoading = true;
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");

          const update_product_options = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
              name: game_title.textContent,
              description: game_desc.innerHTML,
              summary: game_summary.textContent,
              font: document.getElementById("game-column").style.fontFamily,
              active: isChecked,
              defaultColors: false,
              metadata: {
                bgColor: document.body.style.backgroundColor,
                bg2Color:
                  document.getElementById("game-column").style
                    .backgroundColor,
                titleColor:
                  document.getElementById("game-title-column").style.color,
                descColor: document.getElementById("description").style.color,
                descBGColor:
                  document.getElementById("description").style
                    .backgroundColor,
                buttonColor:
                  document.getElementById("download-button").style
                    .backgroundColor,
                buttonTextColor:
                  document.getElementById("download-button").style.color,
                statsColor:
                  document.getElementsByClassName("game-stat")[0].style.color,
                statsBGColor:
                  document.getElementById("game-stats").style.backgroundColor,
              },
            }),
          };

          commitChangesButton.innerHTML = "Uploading..";
          await changeProduct(
            update_product_options,
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
  } else {
    console.warn("There is no valid game id.");
    window.location.assign("404");
  }
};

if (gameIdParam != null) {
  gameHandler(gameIdParam);
} else {
  console.warn("There is no game id.");
  window.location.assign("404");
}
