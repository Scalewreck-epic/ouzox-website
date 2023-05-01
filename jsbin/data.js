const games_list_api = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E:v1/products";
const games_prices_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";

var totalPages
var isFetching = false;
const refreshTime = 5;
let currentPage = 1;

var prices = []

function getGamePrice(game_id) {
    console.log(game_id);
    const result = prices.find(item => item.product === game_id);
    if (result) {
        return { price: result.unit_amount, currency: result.currency };
    }
        
}

function calculateDiffDays(timestamp) {
    var createdTimestamp = new Date(timestamp * 1000);
    var currentDate = new Date();

    var createdTimeDiff = Math.abs(currentDate.getTime() - createdTimestamp.getTime());
    var createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

    return createdDiffDays;
}

function loadGames(games, gameSortType, listSortType) {
    totalPages = Math.ceil(games.length / 20);

    for (let i = (currentPage-1)*20; i < currentPage*20 && i < games.length; i++) {
        var game = games[i];
        var game_price = getGamePrice((game.id).toString());

        if (game_price) {
            var price = game_price.price / 100;
            var currency = game_price.currency;

            if (game.active) {
                var gamesDiv = document.createElement("div");
                gamesDiv.className = "game";

                var gameImage = document.createElement("img");
                gameImage.className = "product-image";
                gameImage.setAttribute("src", game.images[0]);
        
                var gameImageHolder = document.createElement("a");

                gameImageHolder.setAttribute("href", game.url);
                gameImageHolder.target = "_blank";
        
                var gameTitle = document.createElement("div");
                gameTitle.className = "product-title";
                gameTitle.innerHTML = game.name;
        
                var gamePrice = document.createElement("div");
                gamePrice.className = "product-price";
                gamePrice.innerHTML = price+currency.toUpperCase();

                var diffDaysCreated = calculateDiffDays(game.created);
                var diffDaysUpdated = calculateDiffDays(game.updated);

                if (diffDaysCreated <= 7) {
                    var createdLabel = document.createElement("span");
                    createdLabel.className = "new-label";
                    createdLabel.innerHTML = "New";
                    createdLabel.setAttribute("data-days", diffDaysCreated);
                    gamesDiv.appendChild(createdLabel);
                } else if (diffDaysUpdated <= 7) {
                    var updatedLabel = document.createElement("span");
                    updatedLabel.className = "updated-label";
                    updatedLabel.innerHTML = "Updated";
                    updatedLabel.setAttribute("data-days", diffDaysUpdated);
                    gamesDiv.appendChild(updatedLabel);
                }

                gameImageHolder.appendChild(gameImage);
                gamesDiv.appendChild(gameImageHolder);
                gamesDiv.appendChild(gameTitle);
                gamesDiv.appendChild(gamePrice);
                
                if (gameSortType == "newest") {
                    gamesDiv.setAttribute("data-number", game.created);
                } else if (gameSortType == "upToDate") {
                    gamesDiv.setAttribute("data-number", game.updated);
                } else if (gameSortType == "price") {
                    gamesDiv.setAttribute("data-number", price);
                }

                document.getElementById("market").appendChild(gamesDiv);
            }
        }
    }

    var games = document.getElementById("market").querySelectorAll(".game");
    var gamesArray = Array.from(games);
    
    gamesArray.sort(function(a, b) {
        var aNumber = parseInt(a.dataset.number);
        var bNumber = parseInt(b.dataset.number);
        var result = aNumber - bNumber;
        if (listSortType == "descending") {
            result = -result;
        }
        return result;
    });
    
    var market = document.querySelector("#market");
    gamesArray.forEach(function(game) {
        market.appendChild(game);
    });
}

function showError(err) {
    console.warn("There was an error trying to get games: " , err);
    const error = document.createElement("div");
    error.className = "error";

    const errorImg = document.createElement("img");
    errorImg.setAttribute("src", "Images/error.png");
    errorImg.className = "errorImg";

    const errorMessage = document.createElement("div");
    errorMessage.className = "error-title";

    const errorCaption = document.createElement("div");
    errorCaption.className = "error-caption";

    errorMessage.innerHTML = "An error occurred.";
    errorCaption.innerHTML = "We apologize for any inconvenience. Please try again later.";

    error.appendChild(errorImg);
    error.appendChild(errorMessage);
    error.appendChild(errorCaption);
    document.getElementById("errors").appendChild(error);
}

async function fetchGamesRequest() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    var loadingGif = document.createElement("img");
    loadingGif.setAttribute("src", "Images/loading.gif");
    loadingGif.className = "loadingGif";

    document.getElementById("errors").appendChild(loadingGif);

    async function setPrices() {
        try {
            const response = await fetch(games_prices_url, requestOptions);
            const result = await response.text();
            const result_parse = JSON.parse(result);

            prices = result_parse.data;
        } catch (error) {
            showError(error, false);
        }
    }

    async function fetchData() {
        try {
            const response = await fetch(games_list_api, requestOptions);
            const result = await response.text();
            const result_parse = JSON.parse(result);
            
            const gameSort = document.getElementById("game-sort");
            const listSort = document.getElementById("list-sort");
            const selectedGameSort = gameSort.options[gameSort.selectedIndex].value;
            const selectedListSort = listSort.options[listSort.selectedIndex].value;
            
            loadGames(result_parse.data, selectedGameSort, selectedListSort);
        } catch (error) {
            showError(error, false);
        }
    }

    await setPrices();
    await fetchData();
    loadingGif.remove();
}

async function fetchGames() {
    isFetching = true;

    var games = document.getElementById("market");
    var errors = document.getElementById("errors");

    games.innerHTML = "";
    errors.innerHTML = "";

    fetchGamesRequest();

    await countdown(refreshTime);

    document.getElementById("refresh-button").innerHTML = "Refresh";
    isFetching = false;
}

async function countdown(time) {
    return new Promise(resolve => {
        var intervalId = setInterval(() => {
            document.getElementById("refresh-button").innerHTML = time;
            if (time <= 0) {
                clearInterval(intervalId);
                resolve();
            } else {
                time--;
            }
        }, 1000);
    })
}

window.addEventListener("loadstart", fetchGames());
document.getElementById("refresh-list").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!isFetching) {
        fetchGames();
    }
})

document.getElementById("generate-button").addEventListener("click", function() {
    if (currentPage >= totalPages) {
        document.getElementById("generate-button").disabled = true;
    } else {
        currentPage++;
        errors.innerHTML = "";
        fetchGamesRequest();
    }
});
