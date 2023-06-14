const get_product_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id
const update_product_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id

import {filter} from "./moderation.js";
import {getUser} from "./exportuser.js";

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("j");

async function retrieveGameData(gameId) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var options = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    }

    async function getGameData() {
        try {
            const response = await fetch(get_product_url + gameId, options);
            const result = await response.text();
            const result_parse = JSON.parse(result);

            return result_parse;
        } catch (error) {
            console.warn(error);
            window.location.assign("404.html");
        };
    };

    const rawGameData = await getGameData();

    const createdTimestampMs = rawGameData.created * 1000;
    const updatedTimestampMs = rawGameData.updated * 1000;

    const createdDate = new Date(createdTimestampMs);
    const updatedDate = new Date(updatedTimestampMs);

    const createdFormattedDate = createdDate.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
    });

    const updatedFormattedDate = updatedDate.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
    });

    var colors = {}
    var defaultColors = true;
    const metadata = rawGameData.metadata

    if (metadata.bgColor && metadata.bg2Color && metadata.titleColor && metadata.descColor && metadata.buttonColor && metadata.buttonTextColor && metadata.statsColor) {
        defaultColors = false;
        colors = {
            "bgColor": metadata.bgColor,
            "bg2Color": metadata.bg2Color,
            "titleColor": metadata.titleColor,
            "descColor": metadata.descColor,
            "buttonColor": metadata.buttonColor,
            "buttonTextColor": metadata.buttonTextColor,
            "statsColor": metadata.statsColor,
        }
    } else {
        defaultColors = true;
        console.log("Project uses default color parameters");
    }

    const gameData = {
        "name": rawGameData.name,
        "description": rawGameData.description,
        "developer_name": rawGameData.metadata.developer_name,
        "genre": rawGameData.metadata.genre,
        "summary": rawGameData.metadata.summary,
        "artstyle": rawGameData.metadata.artstyle,
        "icon": rawGameData.images[0],
        "created": createdFormattedDate,
        "updated": updatedFormattedDate,
        "useDefaultColors": defaultColors,
        "colors": colors,
    }

    return gameData;
}

const gameHandler = async (gameId) => {
    const gameData = await retrieveGameData(gameId);

    const game_title = document.getElementById("game-title");
    const game_desc = document.getElementById("game-description");
    const created = document.getElementById("created");
    const updated = document.getElementById("updated");
    const icon = document.getElementById("icon");

    const developer_name = document.getElementById("game-developer-name");
    const game_genre = document.getElementById("game-genre");
    const game_summary = document.getElementById("game-summary");
    const game_art = document.getElementById("game-art")

    // main data
    game_title.innerHTML = gameData.name;
    game_desc.innerHTML = gameData.description;
    created.innerHTML = gameData.created;
    updated.innerHTML = gameData.updated;
    icon.setAttribute("href", gameData.icon);

    // metadata
    developer_name.innerHTML = "By: "+gameData.developer_name;
    game_genre.innerHTML = gameData.genre;
    game_summary.innerHTML = gameData.summary;
    game_art.innerHTML = gameData.artstyle;

    if (!gameData.useDefaultColors) {
        var elements = document.getElementsByClassName("game-stat");

        for (var i = 0; i < elements.length; i++) {
            elements[i].style.color = gameData.colors.statsColor;
        }

        document.body.style.backgroundColor = gameData.colors.bgColor;
        document.getElementById("game-column").style.backgroundColor = gameData.colors.bg2Color;
        document.getElementById("game-title-column").style.color = gameData.colors.titleColor;
        document.getElementById("game-description").style.color = gameData.colors.descColor;
        document.getElementById("download-button").style.backgroundColor = gameData.colors.buttonColor;
        document.getElementById("download-button").style.color = gameData.colors.buttonTextColor;
    }

    document.getElementById("download-button").addEventListener("click", function() {
        // send user to the stripe payment session
    });

    const user = await getUser();

    if (user.name == gameData.developer_name) {
        game_title.contentEditable = true;
        game_desc.contentEditable = true;
        game_summary.contentEditable = true;

        var commitChangesButton = document.createElement("button");
        commitChangesButton.className = "game-download-button";
        commitChangesButton.innerHTML = "Commit Changes";

        function create_stat(stat_name) {
            var game_stat = document.createElement("div");
            game_stat.className = "game-stat";
    
            var stat_title = document.createElement("div");
            stat_title.className = "game-updated-title";
            stat_title.innerHTML = stat_name;
            game_stat.appendChild(stat_title);
    
            var changeBGcolor = document.createElement("input");
            changeBGcolor.className = "game-download-input";
            changeBGcolor.type = "color";
            game_stat.appendChild(changeBGcolor);
            document.getElementById("game-column").appendChild(game_stat);

            return changeBGcolor;
        }

        var changeBGcolor = create_stat("BG Color");
        var changeBG2color = create_stat("BG2 Color");
        var changeTitleColor = create_stat("Title Color");
        var changeDescColor = create_stat("Description Color");
        var changeStatsColor = create_stat("Stats Color");
        var changeButtonColor = create_stat("Button BG Color");
        var changeButtonText = create_stat("Button Text Color");

        changeBGcolor.onchange = function() {
            document.body.style.backgroundColor = changeBGcolor.value;
        };

        changeBG2color.onchange = function() {
            document.getElementById("game-column").style.backgroundColor = changeBG2color.value;
        };

        changeTitleColor.onchange = function() {
            document.getElementById("game-title-column").style.color = changeTitleColor.value;
        };

        changeDescColor.onchange = function() {
            document.getElementById("game-description").style.color = changeDescColor.value;
        };

        changeButtonColor.onchange = function() {
            document.getElementById("download-button").style.backgroundColor = changeButtonColor.value;
        }

        changeButtonText.onchange = function() {
            document.getElementById("download-button").style.color = changeButtonText.value;
        }

        changeStatsColor.onchange = function() {
            var elements = document.getElementsByClassName("game-stat");

            for (var i = 0; i < elements.length; i++) {
                elements[i].style.color = changeStatsColor.value;
            }
        };
        
        var isLoading = false;
        commitChangesButton.addEventListener("click", async function() {
            if (!isLoading) {
                isLoading = true;
                commitChangesButton.innerHTML = "Uploading..";
                const titleFilter = await filter(game_title.innerHTML);
                const descFilter = await filter(game_desc.innerHTML);
                
                if (titleFilter == "No reason" && descFilter == "No reason") {
                    const myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");

                    var update_product_options = {
                        method: "POST",
                        headers: myHeaders,
                        redirect: "follow",
                        body: JSON.stringify({
                            "product": {
                              "name": game_title.innerHTML,
                              "description": game_desc.innerHTML,
                              "metadata": {
                                "summary": game_summary.innerHTML,
                                "bgColor": document.body.style.backgroundColor,
                                "bg2Color": document.getElementById("game-column").style.backgroundColor,
                                "titleColor": document.getElementById("game-title-column").style.color,
                                "descColor": document.getElementById("game-description").style.color,
                                "buttonColor": document.getElementById("download-button").style.backgroundColor,
                                "buttonTextColor": document.getElementById("download-button").style.color,
                                "statsColor": document.getElementsByClassName("game-stat")[0].style.color,
                              }
                            },
                            "id": game.id,
                        })
                    }
        
                    async function update_product() {
                        if (user.name == gameData.developer_name) {
                            try {
                                await fetch(update_product_url + game.id, update_product_options);
                                commitChangesButton.innerHTML = "Success";
                            } catch (error) {
                                commitChangesButton.innerHTML = "An error occured";
                                showError(error, false);
                            };
                        } else {
                            console.warn("User somehow accessed the developer panel onto a project they do not own.");
                            commitChangesButton.innerHTML = "You should not be editing this project.";
                        }
                    };
        
                    await update_product();
                } else {
                    if (titleFilter != "No reason") {
                        game_title.innerHTML = titleFilter;
                    };
    
                    if (descFilter != "No reason") {
                        game_desc.innerHTML = descFilter;
                    };
                    commitChangesButton.innerHTML = "Cannot upload";
                }
                isLoading = false;
            }
        })

        document.getElementById("buttons").appendChild(commitChangesButton);
    }
}

if (gameId != null) {
    gameHandler("prod_"+gameId);
} else {
    console.warn("There is no game id.");
    window.location.assign("404.html");
}
