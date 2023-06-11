const get_product_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id
const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id

const update_product_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("id");

async function filter(text) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            "text": text,
        })
    }

    try {
        const response = await fetch(filter_api_url, requestOptions);
        const result = await response.text();

        var result_parse = JSON.parse(result);
        var response_result = result_parse.response.result;
        var result_response = response_result.response;

        if (result_response.categories) {
            for (let i = 0; i < result_response.categories.length; i++) {
                const category = result_response.categories[i];
                const label = category.label;
                const label_topic = label.substring(0, label.indexOf(">"));
                const label_reason = label.substring(label.indexOf(">") + 1);

                if (label_topic == "Sensitive Topics") {
                    return label_reason;
                }
            }
        }

        return "No reason";
    } catch (error) {
        console.warn("There was an error trying to fetch text filter: " , error);
        return "No reason";
    }
}

function getCookieData(trim) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i];
        const [name, value] = cookie.split("=");
        if (name.trim() === trim) {
            return {
                "Data": value.toString(),
                "Valid": true,
            };
        }
    }

    return {
        "Data": "no data.",
        "Valid": false,
    };
}

async function getUsername() {
    var data = getCookieData("session_id");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var get_user_options = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    }

    if (data.Valid) {
        async function get_user() {
            try {
                const response = await fetch(get_user_url + data.Data, get_user_options);
                const result = await response.text();
                const result_parse = JSON.parse(result);
    
                console.log(result_parse);
                return result_parse;
            } catch (error) {
                showError(error, false);
            };
        };
    
        var user = await get_user();
        return user;
    }
}

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

    document.getElementById("download-button").addEventListener("click", function() {
        // send user to the stripe payment session
    });

    if (getUsername() == gameData.developer_name) {
        game_title.contentEditable = true;
        game_desc.contentEditable = true;
        game_summary.contentEditable = true;

        var commitChangesButton = document.createElement("button");
        commitChangesButton.className = "game-download-button";
        commitChangesButton.innerHTML = "Commit Changes";
        
        commitChangesButton.addEventListener("click", async function() {
            const titleFilter = await filter(game_title.innerHTML);
            const descFilter = await filter(game_desc.innerHTML);
            
            if (titleFilter == "No reason" && descFilter == "No Reason") {
                var update_product_options = {
                    method: "POST",
                    headers: myHeaders,
                    redirect: "follow",
                    body: JSON.stringify({
                        "product": {
                          "name": game_title.innerHTML,
                          "description": game_desc.innerHTML,
                        },
                        "id": game.id,
                    })
                }
    
                async function update_product() {
                    if (getUsername() == gameData.developer_name) {
                        try {
                            const response = await fetch(update_product_url + game.id, update_product_options);
                            const result = await response.text();
                            const result_parse = JSON.parse(result);
            
                            console.log(result_parse);
                        } catch (error) {
                            showError(error, false);
                        };
                    }
                };
    
                await update_product();
            } else {
                if (titleFilter != "No reason") {
                    game_title.innerHTML = titleFilter;
                }

                if (descFilter != "No reason") {
                    game_desc.innerHTML = descFilter;
                }
            }
        })

        document.getElementById("buttons").appendChild(commitChangesButton);
    }
}

if (gameId != null) {
    gameHandler(gameId);
} else {
    console.warn("There is no game id.");
    window.location.assign("404.html");
}
