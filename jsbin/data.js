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

function loadGames(games, gamesortType, listsortType) {
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

            if (gamesortType == "sales") {
                gamesDiv.setAttribute("data-number", game.sales_count);
            } else if (gamesortType == "price") {
                gamesDiv.setAttribute("data-number", game.price);
            } else if (gamesortType == "newest") {
                gamesDiv.setAttribute("data-number", game.created);
            } else if (gamesortType == "uptodate") {
                gamesDiv.setAttribute("data-number", game.updated);
            }
    
            if (listsortType == "ascending") {
                var newDataNumber = gamesDiv.getAttribute("data-number");

                if (newDataNumber > 0) {
                    newDataNumber = -newDataNumber;
                }

                gamesDiv.setAttribute("data-number", newDataNumber);
            } else if (listsortType == "descending") {
                var newDataNumber = gamesDiv.getAttribute("data-number");

                if (newDataNumber < 0) {
                    newDataNumber = Math.abs(newDataNumber);
                }

                gamesDiv.setAttribute("data-number", newDataNumber);
            }

            document.getElementById("market").appendChild(gamesDiv);
        }
    }

    var games = document.getElementById("market").querySelectorAll("game");
    var gamesArray = Array.from(games);

    gamesArray.sort(function(a, b) {
        var a = parseInt(a.dataset.number);
        var b = parseInt(b.dataset.number);
        return a - b;
    })

    gamesArray.forEach(function(game) {
        document.querySelector("market").appendChild(game);
    })
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

    errorMessage.innerHTML = "An error occured.";
    errorCaption.innerHTML = "We apologize for any inconvenience. Please try again later.";

    error.appendChild(errorImg);
    error.appendChild(errorMessage);
    error.appendChild(errorCaption);
    document.getElementById("errors").appendChild(error);
}

function fetchGamesRequest() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    fetch(games_list_api, requestOptions)
    .then(response => response.text())
    .then(result => {
        var result_parse = JSON.parse(result);

        var gamesort = document.getElementById("game-sort");
        var listsort = document.getElementById("list-sort");
        var selectedGamesort = gamesort.options[gamesort.selectedIndex].value;
        var selectedListsort = listsort.options[listsort.selectedIndex].value;

        loadGames(result_parse.data, selectedGamesort, selectedListsort);
    })
    .catch(error => {
        showError(error, false);
    });
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
      fetchGamesRequest();
    }
  });
  
