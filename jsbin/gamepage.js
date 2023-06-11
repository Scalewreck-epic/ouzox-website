const get_product_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id
const get_user_url = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/user/"; // + session id

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("id");

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

async function isOwnerOfGame(ownerName) {
    const cookie = getCookieData("session_id");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var options = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    }

    if (cookie.Valid) {
        async function getUser() {
            try {
                const response = await fetch(get_user_url + cookie.Data, options);
                const result = await response.text();
                const result_parse = JSON.parse(result);

                return result_parse;
            } catch (error) {
                console.warn(error);
            }
        }

        var user = await getUser();

        if (user != null) {
            if (user.name == ownerName) {
                return true;
            }
        } else {
            return false;
        }
    } else {
        return false;
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

    // main data
    document.getElementById("game-title").innerHTML = gameData.name;
    document.getElementById("game-description").innerHTML = gameData.description;
    document.getElementById("created").innerHTML = "Created: "+gameData.created;
    document.getElementById("updated").innerHTML = "Updated: "+gameData.updated;
    document.getElementById("icon").setAttribute("href", gameData.icon);

    // metadata
    document.getElementById("game-developer-name").innerHTML = "By: "+gameData.developer_name;
    document.getElementById("game-genre").innerHTML = "Genre: "+gameData.genre;
    document.getElementById("game-summary").innerHTML = gameData.summary;
    document.getElementById("game-art").innerHTML = "Style: "+gameData.artstyle;

    document.getElementById("game-download-button").addEventListener("click", function() {
        // send user to the stripe payment session
    });

    if (isOwnerOfGame(gameData.developer_name)) {
        // handle game editing
    }
}

if (gameId != null) {
    gameHandler(gameId);
} else {
    console.warn("There is no game id.");
    window.location.assign("404.html");
}
