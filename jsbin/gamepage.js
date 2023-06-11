const get_product_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products/"; // + product id

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("id");

async function retrieveGameData(gameId) {
    // handle retrieving game data from database
    // return gameData (include title, description, price, metadata)
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
    
            console.log(result_parse);
            return result_parse;
        } catch (error) {
            console.error(error);
        };
    }

    const rawGameData = await getGameData();

    const createdTimestampMs = rawGameData.created * 1000;
    const createdDate = new Date(createdTimestampMs);
    const createdFormattedDate = createdDate.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
    })

    const updatedTimestampMs = rawGameData.updated * 1000;
    const updatedDate = new Date(updatedTimestampMs);
    const updatedFormattedDate = updatedDate.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
    })

    const gameData = {
        "name": rawGameData.name,
        "description": rawGameData.description,
        "developer_name": rawGameData.metadata.developer_name,
        "genre": rawGameData.metadata.genre,
        "summary": rawGameData.metadata.summary,
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

    // metadata
    document.getElementById("game-developer-name").innerHTML = "By: "+gameData.developer_name;
    document.getElementById("game-genre").innerHTML = "Genre: "+gameData.genre;
    document.getElementById("game-summary").innerHTML = gameData.summary;
}

gameHandler(gameId);