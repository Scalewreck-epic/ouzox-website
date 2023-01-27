var isFetching = false;
var refreshTime = 3;

function loadProducts(result, gamesortType, listsortType) {
    var products = result.products;

    for (let i = 0; i < products.length; i++) {
        var product = products[i];
        
        if (product.published) {
            var productDiv = document.createElement("a");
            productDiv.className = "game";

            productDiv.setAttribute("href", product.short_url);
            productDiv.target = "_blank";
            
            var productImage = document.createElement("img");
            productImage.className = "product-image"
            productImage.setAttribute("src", product.thumbnail_url);
    
            var productImageDiv = document.createElement("div");
            productImageDiv.className = "product-image";
    
            var productTitle = document.createElement("div");
            productTitle.className = "product-title";
            productTitle.innerHTML = product.name;
    
            var productPrice = document.createElement("div");
            productPrice.className = "product-price";
            productPrice.innerHTML = product.formatted_price + " " + product.currency.toUpperCase() + "(" + product.file_info.size + ")";
    
            productImageDiv.appendChild(productImage);
            productDiv.appendChild(productImageDiv);
            productDiv.appendChild(productTitle);
            productDiv.appendChild(productPrice);

            if (gamesortType == "sales") {
                productDiv.setAttribute("data-number", product.sales_count);
            } else if (gamesortType == "price") {
                productDiv.setAttribute("data-number", product.price);
            }
    
            if (listsortType == "ascending") {
                var newDataNumber = productDiv.getAttribute("data-number");
                newDataNumber = -newDataNumber;
                productDiv.setAttribute("data-number", newDataNumber);
            } else {
                var newDataNumber = productDiv.getAttribute("data-number");
                newDataNumber = Math.abs(newDataNumber);
                productDiv.setAttribute("data-number", newDataNumber);
            }

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

function showError(errorMessage, errorCode, isOffline) {
    console.warn(errorMessage);
    var error = document.createElement("div");
    error.className = "error";

    var errorImg = document.createElement("img");
    errorImg.setAttribute("src", "Images/error.png");
    errorImg.className = "errorImg";
    error.appendChild(errorImg);

    var errorMessage = document.createElement("div");
    errorMessage.className = "product-title";
    error.appendChild(errorMessage);

    var errorCaption = document.createElement("div");
    errorCaption.className = "product-price";
    error.appendChild(errorCaption);

    if (isOffline) {
        errorMessage.innerHTML = "This is an online website, but you appear to be offline.";
        errorCaption.innerHTML = "Please check back when you are online.";
    } else {
        errorMessage.innerHTML = "Our store is currently offline for maintanence and upgrades.";
        errorCaption.innerHTML = "Please check back soon! Error code: " + errorCode;
    }

    document.getElementById("errors").appendChild(error);
}

async function fetchProducts() {
    if (navigator.onLine) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var url = "https://v1.nocodeapi.com/scalewreck/gumroad/xZdMSxWrIzteMRRb/products";
        var requestOptions = {
            method: "get",
            headers: myHeaders,
            redirect: "follow",
        };
    
        var games = document.getElementById("market");
        var errors = document.getElementById("errors");
    
        games.innerHTML = "";
        errors.innerHTML = "";
    
        var loading = document.createElement("div");
        loading.className = "loading-text";
        loading.innerHTML = "Loading games..";
        errors.appendChild(loading);

        return fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            loading.remove();

            var data = JSON.parse(result);
            console.log(data);
            if (data.success == true) {
                var gamesort = document.getElementById("game-sort");
                var listsort = document.getElementById("list-sort");
                var selectedGamesort = gamesort.options[gamesort.selectedIndex].value;
                var selectedListsort = listsort.options[listsort.selectedIndex].value;
    
                console.log("Games on sale:" , data.products);
                loadProducts(data, selectedGamesort, selectedListsort);
            } else {
                showError(data.info, data.code, false);
            }
        })
        .catch(error => {
            if (error.code) {
                showError(error, error.code, false);
            } else {
                showError(error, "none", false);
            }
        });
    } else {
        showError("Current user is offline.", true)
    }
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
        isFetching = true;
        fetchProducts().then(async () => {
            await countdown(refreshTime);

            document.getElementById("refresh-button").innerHTML = "Refresh";
            isFetching = false;
        })
    }
})
