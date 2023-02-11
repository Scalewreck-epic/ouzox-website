var products_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E:v1/products";
var product_prices_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-:v1/prices/"; // + product id

var isFetching = false;
var refreshTime = 5;

function getProductPrice(product_id) {
    // ACTIVATE STRIPE ACCOUNT
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    fetch((product_prices_url + product_id), requestOptions)
    .then(response => response.text())
    .then(result => {
        var result_parse = JSON.parse(result);
        console.log(result_parse);
    })
    .catch(error => {
        console.warn("There was an error trying to get the price of a product: " , error);
    });
}

function loadProducts(products, gamesortType, listsortType) {
    for (let i = 0; i < products.length; i++) {
        var product = products[i];
        //var price = getProductPrice(product.id);
        
        if (product.active) {
            var productDiv = document.createElement("div");
            productDiv.className = "game";

            var productImage = document.createElement("img");
            productImage.className = "product-image";
            productImage.setAttribute("src", product.images[0]);
    
            var productImageHolder = document.createElement("a");

            productImageHolder.setAttribute("href", product.url);
            productImageHolder.target = "_blank";
    
            var productTitle = document.createElement("div");
            productTitle.className = "product-title";
            productTitle.innerHTML = product.name;
    
            var productPrice = document.createElement("div");
            productPrice.className = "product-price";
            productPrice.innerHTML = product.id;

            productImageHolder.appendChild(productImage);
            productDiv.appendChild(productImageHolder);
            productDiv.appendChild(productTitle);
            productDiv.appendChild(productPrice);

            if (gamesortType == "sales") {
                productDiv.setAttribute("data-number", product.sales_count);
            } else if (gamesortType == "price") {
                productDiv.setAttribute("data-number", product.price);
            } else if (gamesortType == "newest") {
                productDiv.setAttribute("data-number", product.created);
            } else if (gamesortType == "uptodate") {
                productDiv.setAttribute("data-number", product.updated);
            }
    
            if (listsortType == "ascending") {
                var newDataNumber = productDiv.getAttribute("data-number");

                if (newDataNumber > 0) {
                    newDataNumber = -newDataNumber;
                }

                productDiv.setAttribute("data-number", newDataNumber);
            } else if (listsortType == "descending") {
                var newDataNumber = productDiv.getAttribute("data-number");

                if (newDataNumber < 0) {
                    newDataNumber = Math.abs(newDataNumber);
                }

                productDiv.setAttribute("data-number", newDataNumber);
            }

            console.log(productDiv.getAttribute("data-number"));
            document.getElementById("market").appendChild(productDiv);
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
    console.warn("There was an error trying to get products: " , errorMessage);
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

async function fetchProducts() {
    isFetching = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    var games = document.getElementById("market");
    var errors = document.getElementById("errors");

    games.innerHTML = "";
    errors.innerHTML = "";

    fetch(products_api_url, requestOptions)
    .then(response => response.text())
    .then(result => {
        var result_parse = JSON.parse(result);
        console.log(result_parse);

        var gamesort = document.getElementById("game-sort");
        var listsort = document.getElementById("list-sort");
        var selectedGamesort = gamesort.options[gamesort.selectedIndex].value;
        var selectedListsort = listsort.options[listsort.selectedIndex].value;

        loadProducts(result_parse.data, selectedGamesort, selectedListsort);
    })
    .catch(error => {
        showError(error, false);
    });

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

window.addEventListener("loadstart", fetchProducts());
document.getElementById("refresh-list").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!isFetching) {
        fetchProducts();
    }
})
