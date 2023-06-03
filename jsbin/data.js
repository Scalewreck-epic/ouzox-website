const games_list_api = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E:v1/products";
const games_prices_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";

const refreshTime = 5;
const gamesPerPage = 20;
var isFetching = false;
let currentPage = 0;

var prices = [];
var games = [];

function getGamePrice(game_id) {
    const result = prices.find(item => item.product === game_id);
    if (result) {
        return { price: result.unit_amount, currency: result.currency };
    };
};

function calculateDiffDays(timestamp) {
    var createdTimestamp = new Date(timestamp * 1000);
    var currentDate = new Date();

    var createdTimeDiff = Math.abs(currentDate.getTime() - createdTimestamp.getTime());
    var createdDiffDays = Math.ceil(createdTimeDiff / (1000 * 3600 * 24));

    return createdDiffDays;
};

function createGamePage(game, game_price) {
    var price = game_price.price / 100;
    var currency = game_price.currency;

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
    gamePrice.innerHTML = price+" "+currency.toUpperCase();

    var diffDaysCreated = calculateDiffDays(game.created);
    var diffDaysUpdated = calculateDiffDays(game.updated);

    if (diffDaysCreated <= 7) {
        var createdLabel = document.createElement("span");
        createdLabel.className = "new-label";
        createdLabel.innerHTML = "NEW";
        createdLabel.setAttribute("data-days", diffDaysCreated);
        gamesDiv.appendChild(createdLabel);

        createdLabel.addEventListener("mouseenter", function() {
            if (diffDaysUpdated > 1) {
                createdLabel.innerHTML = `${diffDaysCreated} DAYS AGO`;
            } else if (diffDaysUpdated == 1) {
                createdLabel.innerHTML = `1 DAY AGO`;
            } else {
                createdLabel.innerHTML = "TODAY";
            };
        });

        createdLabel.addEventListener("mouseleave", function() {
            updatedLabel.innerHTML = "NEW";
        });
    } else if (diffDaysUpdated <= 7) {
        var updatedLabel = document.createElement("span");
        updatedLabel.className = "updated-label";
        updatedLabel.innerHTML = "UPDATED";
        updatedLabel.setAttribute("data-days", diffDaysUpdated);
        gamesDiv.appendChild(updatedLabel);

        updatedLabel.addEventListener("mouseenter", function() {
            if (diffDaysUpdated > 1) {
                updatedLabel.innerHTML = `${diffDaysUpdated} DAYS AGO`;
            } else if (diffDaysUpdated == 1) {
                updatedLabel.innerHTML = `1 DAY AGO`;
            } else {
                updatedLabel.innerHTML = "TODAY";
            }
        })

        updatedLabel.addEventListener("mouseleave", function() {
            updatedLabel.innerHTML = "UPDATED";
        })
    }

    gameImageHolder.appendChild(gameImage);
    gamesDiv.appendChild(gameImageHolder);
    gamesDiv.appendChild(gameTitle);
    gamesDiv.appendChild(gamePrice);

    document.getElementById("market").appendChild(gamesDiv);
};

function sortGames(gameSortType, listSortType) {
    if (gameSortType == "newest") {
        if (listSortType == "descending") {
            games.sort((a, b) => (a.created > b.created) ? -1 : 1);
        } else {
            games.sort((a, b) => (a.created > b.created) ? 1 : -1);
        }
    } else if (gameSortType == "upToDate") {
        if (listSortType == "descending") {
            games.sort((a, b) => (a.updated > b.updated) ? -1 : 1);
        } else {
            games.sort((a, b) => (a.updated > b.updated) ? 1 : -1);
        };
    } else if (gameSortType == "price") {
        if (listSortType == "descending") {
            games.sort((a, b) => ((getGamePrice((a.id).toString()).price / 100) > (getGamePrice((b.id).toString()).price / 100)) ? -1 : 1);
        } else {
            games.sort((a, b) => ((getGamePrice((a.id).toString()).price / 100) > (getGamePrice((b.id).toString()).price / 100)) ? 1 : -1);
        }
    }
}

function loadGames() {
    for (let i = currentPage; i < currentPage + gamesPerPage && i < games.length; i++) {
        var game = games[i];

        if (game && game.active) {
            var game_price = getGamePrice((game.id).toString());

            if (game_price) {
                currentPage += 1;
                createGamePage(game, game_price);
            };
        };
    };
};

function loadDashboard() {
    const username = document.getElementById("username");

    for (let i = currentPage; i < currentPage + gamesPerPage && i < games.length; i++) {
        var game = games[i];

        if (game && game.active && game.metadata.developer_name == username.innerHTML) {
            var game_price = getGamePrice((game.id).toString());

            if (game_price) {
                currentPage += 1;
                createGamePage(game, game_price);
            };
        };
    };
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
    errorCaption.innerHTML = "Game loading error. Please try again later.";

    error.appendChild(errorImg);
    error.appendChild(errorMessage);
    error.appendChild(errorCaption);
    document.getElementById("errors").appendChild(error);
};

async function fetchGamesRequest(isDashboard) {
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
            prices.sort((a, b) => (a.unit_amount > b.unit_amount) ? 1 : -1);
        } catch (error) {
            showError(error, false);
        };
    };

    async function fetchData() {
        try {
            const response = await fetch(games_list_api, requestOptions);
            const result = await response.text();
            const result_parse = JSON.parse(result);
            
            const gameSort = document.getElementById("game-sort");
            const listSort = document.getElementById("list-sort");
            const selectedGameSort = gameSort.options[gameSort.selectedIndex].value;
            const selectedListSort = listSort.options[listSort.selectedIndex].value;

            games = result_parse.data;
            
            console.log(games);
            sortGames(selectedGameSort, selectedListSort);

            if (isDashboard) {
                loadDashboard();
            } else {
                loadGames();
            };
        } catch (error) {
            showError(error, false);
        };
    };

    await setPrices();
    await fetchData();
    loadingGif.remove();
};

async function countdown(time) {
    return new Promise(resolve => {
        var intervalId = setInterval(() => {
            document.getElementById("refresh-button").innerHTML = time;
            if (time <= 0) {
                clearInterval(intervalId);
                resolve();
            } else {
                time--;
            };
        }, 1000);
    });
};

async function fetchGames(isDashboard) {
    isFetching = true;

    var market = document.getElementById("market");
    var errors = document.getElementById("errors");

    market.innerHTML = "";
    errors.innerHTML = "";

    currentPage = 0;
    prices = [];
    fetchGamesRequest(isDashboard);

    await countdown(refreshTime);

    document.getElementById("refresh-button").innerHTML = "Refresh";
    isFetching = false;
};

function isPathDashboard() {
    if (window.location.pathname.includes("/dashboard.html")) {
        return true;
    };

    return false;
}

document.getElementById("refresh-list").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!isFetching) {
        fetchGames(isPathDashboard());
    };
});

document.getElementById("generate-button").addEventListener("click", function() {
    if (currentPage >= games.length) {
        document.getElementById("generate-button").disabled = true;
    } else {
        errors.innerHTML = "";
        fetchGamesRequest(isPathDashboard());
    }
});

fetchGames(isPathDashboard());
