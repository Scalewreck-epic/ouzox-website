const get_product_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id
const update_product_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id
const get_price_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices/"; // + price id

import { getUser } from "./exportuser.js";

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("j");

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
      const response = await fetch(get_product_url + gameId, options);
      const result = await response.text();
      const result_parse = JSON.parse(result);

      return result_parse;
    } catch (error) {
      console.warn(error);
      window.location.assign("404.html");
    }
  }

  const rawGameData = await getGameData();

  const createdTimestampMs = rawGameData.created * 1000;
  const updatedTimestampMs = rawGameData.updated * 1000;

  const createdDate = new Date(createdTimestampMs);
  const updatedDate = new Date(updatedTimestampMs);

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

  const publishedDaysAgo = Math.abs(
    currentDate.getTime() - createdDate.getTime()
  );

  const updatedDaysAgo = Math.abs(
    currentDate.getTime() - updatedDate.getTime()
  );

  const publishedWeeksAgo = publishedDaysAgo / 7
  const updatedWeeksAgo = updatedDaysAgo / 7

  const publishedMonthsAgo = publishedDaysAgo / 31
  const updatedMonthsAgo = publishedDaysAgo / 31

  const publishedYearsAgo = publishedDaysAgo / 365
  const updatedYearsAgo = updatedDaysAgo / 365

  let colors = {};
  let datestodays = {
    publishedDaysAgo: publishedDaysAgo,
    publishedWeeksAgo: publishedWeeksAgo,
    publishedMonthsAgo: publishedMonthsAgo,
    publishedYearsAgo: publishedYearsAgo,
    updatedDaysAgo: updatedDaysAgo,
    updatedWeeksAgo: updatedWeeksAgo,
    updatedMonthsAgo: updatedMonthsAgo,
    updatedYearsAgo: updatedYearsAgo,
  };

  let defaultColors = true;

  const metadata = rawGameData.metadata;

  if (
    metadata.bgColor &&
    metadata.bg2Color &&
    metadata.titleColor &&
    metadata.descColor &&
    metadata.buttonColor &&
    metadata.buttonTextColor &&
    metadata.statsColor
  ) {
    defaultColors = false;
    colors = {
      bgColor: metadata.bgColor,
      bg2Color: metadata.bg2Color,
      titleColor: metadata.titleColor,
      descColor: metadata.descColor,
      buttonColor: metadata.buttonColor,
      buttonTextColor: metadata.buttonTextColor,
      statsColor: metadata.statsColor,
      statsBGColor: metadata.statsBGColor,
    };
  } else {
    defaultColors = true;
    console.log("Project uses default color parameters");
  }

  const gameData = {
    name: rawGameData.name,
    description: rawGameData.description,
    developer_name: rawGameData.metadata.developer_name,
    genre: rawGameData.metadata.genre,
    summary: rawGameData.metadata.summary,
    artstyle: rawGameData.metadata.artstyle,
    filesize: rawGameData.size,
    agerating: rawGameData.metadata.age_rating,
    icon: rawGameData.images[0],
    created: createdFormattedDate,
    updated: updatedFormattedDate,
    datestodays: datestodays,
    useDefaultColors: defaultColors,
    colors: colors,
  };

  return gameData;
}

const gameHandler = async (gameId) => {
  if (gameId != null) {
    const gameData = await retrieveGameData(gameId);

    const game_title = document.getElementById("game-title");
    const game_desc = document.getElementById("game-description");
    const created = document.getElementById("created");
    const updated = document.getElementById("updated");

    const navigation_title = document.getElementById("navigation-title");
    const icon = document.getElementById("icon");

    const developer_name = document.getElementById("game-developer-name");
    const game_genre = document.getElementById("game-genre");
    const game_summary = document.getElementById("game-summary");
    const game_art = document.getElementById("game-art");
    const game_age = document.getElementById("game-age");
    const game_size = document.getElementById("game-size");

    // main data
    game_title.innerHTML = gameData.name;
    game_desc.innerHTML = gameData.description;
    created.innerHTML = gameData.created;
    updated.innerHTML = gameData.updated;

    function formatTimeAgo(createdOrUpdated, publishedOrUpdatedYearsAgo, publishedOrUpdatedMonthsAgo, publishedOrUpdatedWeeksAgo, publishedOrUpdatedDaysAgo) {
      if (publishedOrUpdatedYearsAgo > 0) {
        return createdOrUpdated + "(" + publishedOrUpdatedYearsAgo + " Years Ago)";
      } else if (publishedOrUpdatedMonthsAgo > 0) {
        return createdOrUpdated + "(" + publishedOrUpdatedMonthsAgo + " Months Ago)";
      } else if (publishedOrUpdatedWeeksAgo > 0) {
        return createdOrUpdated + "(" + publishedOrUpdatedWeeksAgo + " Weeks Ago)";
      } else if (publishedDaysAgo > 0) {
        return createdOrUpdated + "(" + publishedOrUpdatedDaysAgo + " Days Ago)";
      } else {
        return "Today";
      };
    };
    
    created.innerHTML = formatTimeAgo("Created", gameData.created, gameData.datestodays.publishedYearsAgo, gameData.datestodays.publishedMonthsAgo, gameData.datestodays.publishedWeeksAgo, gameData.datestodays.publishedDaysAgo);
    updated.innerHTML = formatTimeAgo("Updated", gameData.updated, gameData.datestodays.updatedYearsAgo, gameData.datestodays.updatedMonthsAgo, gameData.datestodays.updatedWeeksAgo, gameData.datestodays.updatedDaysAgo);

    icon.setAttribute("href", gameData.icon);
    navigation_title.innerHTML =
      gameData.name + " By " + gameData.developer_name;

    // metadata
    developer_name.innerHTML = gameData.developer_name;
    game_genre.innerHTML = gameData.genre.toUpperCase();
    game_summary.innerHTML = gameData.summary;
    game_art.innerHTML = gameData.artstyle.toUpperCase();
    game_age.innerHTML = gameData.agerating.toUpperCase();
    game_size.innerHTML = gameData.size+" MB";

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
      document.getElementById("game-description").style.color =
        gameData.colors.descColor;
      document.getElementById("download-button").style.backgroundColor =
        gameData.colors.buttonColor;
      document.getElementById("download-button").style.color =
        gameData.colors.buttonTextColor;
      document.getElementById("game-stats").style.color =
        gameData.colors.statsBGColor;
    }

    document
      .getElementById("download-button")
      .addEventListener("click", function () {
        // send user to the stripe payment session
      });

    const user = await getUser();

    if (user != null && user.name == gameData.developer_name) {
      game_title.contentEditable = true;
      game_desc.contentEditable = true;
      game_summary.contentEditable = true;

      const commitChangesButton = document.createElement("button");
      commitChangesButton.className = "game-download-button";
      commitChangesButton.innerHTML = "Commit Changes";

      game_title.addEventListener("input", function () {
        const text = this.innerHTML;

        if (text.length > 120) {
          this.innerHTML = text.slice(0, 120);
        };
      });

      game_summary.addEventListener("input", function () {
        const text = this.innerHTML;

        if (text.length > 120) {
          this.innerHTML = text.slice(0, 120);
        };
      });

      game_desc.addEventListener("input", function () {
        const text = this.innerHTML;

        if (text.length > 4000) {
          this.innerHTML = text.slice(0, 4000);
        };
      });

      function create_stat(stat_name) {
        const game_stat = document.createElement("div");
        game_stat.className = "game-setting";

        const stat_title = document.createElement("div");
        stat_title.innerHTML = stat_name;
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
        document.getElementById("game-description").style.color =
          changeDescColor.value;
      };

      changeDescBGColor.onchange = function() {
        document.getElementById("game-description").style.backgroundColor = changeDescBGColor.value;
      };

      changeButtonColor.onchange = function () {
        document.getElementById("download-button").style.backgroundColor =
          changeButtonColor.value;
      };

      changeButtonText.onchange = function () {
        document.getElementById("download-button").style.color =
          changeButtonText.value;
      };

      changeStatsColor.value = document.getElementById("game-stats").style.color;
      changeStatsColor.onchange = function () {
        const game_stats = document.getElementById("game-stats");
        game_stats.style.color = changeStatsColor.value;
      };

      changeStatsBGColor.value = document.getElementById("game-stats").style.backgroundColor;
      changeStatsBGColor.onchange = function() {
        const game_stats = document.getElementById("game-stats");
        game_stats.style.backgroundColor = changeStatsBGColor.value;
      };

      let isLoading = false;
      commitChangesButton.addEventListener("click", async function () {
        if (!isLoading) {
          isLoading = true;
          commitChangesButton.innerHTML = "Uploading..";

          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");

          const update_product_options = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
              product: {
                name: game_title.innerHTML,
                description: game_desc.innerHTML,
                metadata: {
                  summary: game_summary.innerHTML,
                  bgColor: document.body.style.backgroundColor,
                  bg2Color:
                    document.getElementById("game-column").style
                      .backgroundColor,
                  titleColor:
                    document.getElementById("game-title-column").style.color,
                  descColor:
                    document.getElementById("game-description").style.color,
                  descBGColor:
                    document.getElementById("game-description").style.backgroundColor,
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
              },
              id: gameId,
            }),
          };

          async function update_product() {
            if (user.name == gameData.developer_name) {
              try {
                await fetch(
                  update_product_url + gameId,
                  update_product_options
                );
                commitChangesButton.innerHTML = "Success";
              } catch (error) {
                commitChangesButton.innerHTML = "An error occured";
                showError(error, false);
              }
            } else {
              console.warn(
                "User somehow accessed the developer panel onto a project they do not own."
              );
              commitChangesButton.innerHTML =
                "You should not be editing this project.";
            }
          }

          await update_product();
          isLoading = false;
        }
      });

      document.getElementById("buttons").appendChild(commitChangesButton);
    } else {
      document.getElementById("game-editing").remove();
    }
  } else {
    console.warn("There is no valid game id.");
    window.location.assign("404.html");
  };
};

if (gameId != null) {
  gameHandler("prod_" + gameId);
} else {
  console.warn("There is no game id.");
  window.location.assign("404.html");
};
