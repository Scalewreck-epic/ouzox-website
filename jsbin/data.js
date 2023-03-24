const games_list_api = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E:v1/products";
const games_prices_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-:v1/prices/"; // + game id

var totalPages
var isFetching = false;
const refreshTime = 5;
let currentPage = 1;

function getGamePrice(game_id) {
    // ACTIVATE STRIPE ACCOUNT
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    fetch((games_prices_url + game_id), requestOptions)
    .then(response => response.text())
    .then(result => {
        var result_parse = JSON.parse(result);
        console.log(result_parse);
    })
    .catch(error => {
        console.warn("There was an error trying to get the price of a game: " , error);
    });
}

function loadGames(games, gameSortType, listSortType) {
    totalPages = Math.ceil(games.length / 20);

    for (let i = (currentPage-1)*20; i < currentPage*20 && i < games.length; i++) {
        var game = games[i];
        //var price = getGamePrice(game.id);
        
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
            gamePrice.innerHTML = game.id; // change to price

            gameImageHolder.appendChild(gameImage);
            gamesDiv.appendChild(gameImageHolder);
            gamesDiv.appendChild(gameTitle);
            gamesDiv.appendChild(gamePrice);

            if (gameSortType == "sales") {
                gamesDiv.setAttribute("data-number", game.sales_count);
            } else if (gameSortType == "price") {
                gamesDiv.setAttribute("data-number", game.price);
            } else if (gameSortType == "newest") {
                gamesDiv.setAttribute("data-number", game.created);
            } else if (gameSortType == "upToDate") {
                gamesDiv.setAttribute("data-number", game.updated);
            }

            document.getElementById("market").appendChild(gamesDiv);
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

function showError(errorMessage) {
    console.warn("There was an error trying to get games: " , errorMessage);
    var error = document.createElement("div");
    error.className = "error";

    var errorImg = document.createElement("img");
    errorImg.setAttribute("src", "Images/error.png");
    errorImg.className = "errorImg";

    var errorMessage = document.createElement("div");
    errorMessage.className = "error-title";

    var errorCaption = document.createElement("div");
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
  
