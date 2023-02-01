const uploadGame = document.getElementById("upload-game");

uploadGame.addEventListener("submit", function(event) {
    event.preventDefault();
    var error_label = document.getElementById("error-label");

    var game_file_warn = document.getElementById("game-file-warn");
    var title_warn = document.getElementById("game-title-warn");

    checkFileSize();
    checkPrice();
    checkTitleLength();

    if (game_file_warn.innerHTML == "") {
        if (title_warn.innerHTML == "") {
            error_label.innerHTML = "Uploading game.."

            const file_input = document.getElementById("download-file");
            const thumbnail_input = document.getElementById("thumbnail");
            const description_input = document.getElementById("description");
            const price_input = document.getElementById("price");
            const title_input = document.getElementById("title");
        
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
        
            var gumroad_upload_url = "https://v1.nocodeapi.com/scalewreck/gumroad/xZdMSxWrIzteMRRb/products";
        
            var productData = {
                name: title_input.value,
                type: "Digital product",
                price: price_input.value,
                description: description_input.value,
                url: "econsole.gumroad.com/I/"+title_input.value,
                image_url: thumbnail_input.files[0],
                file: file_input.files[0],
                requires_email: false,
            }
            
            var requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(productData),
            };
        
            fetch(gumroad_upload_url, requestOptions)
            .then(response => {
                if (response.ok) {
                    error_label.innerHTML = "Successfully uploaded game!";
                } else {
                    error_label.innerHTML = "An error occured trying to upload game.";
                }
            })
            .catch(error => {
                console.warn(error);
                error_label.innerHTML = "An error occured trying to upload game.";
            })
        } else {
            error_label.innerHTML = "Incomplete form.";
        }
    } else {
        error_label.innerHTML = "Incomplete form.";
    }
});

function checkFileSize() {
    var input = document.getElementById("download-file");
    var warn = document.getElementById("game-file-warn");

    var file = input.files[0];
    var maxFileSize = 250000000; // 250MB in bytes

    if (file.size > maxFileSize) {
        warn.innerHTML = "File size too large. Select a file under 250MB";
        input.value = "";
    } else {
        warn.innerHTML = "";
    }
}

function checkIsFree() {
    var isfree = document.getElementById("isfree");
    var input = document.getElementById("price");

    if (!isfree.checked) {
        checkPrice();
    } else {
        input.value = 0;
    }
}

function checkTitleLength() {
    var title = document.getElementById("title");
    var title_warn = document.getElementById("game-title-warn");

    if (title.value.length > 20) {
        title_warn.innerHTML = "Title must be below 20 characters.";
    } else if (title.value.length < 3) {
        title_warn.innerHTML = "Title must be above 3 characters.";
    } else {
        title_warn.innerHTML = "";
    }
}

function checkPrice() {
    var input = document.getElementById("price");
    var isfree = document.getElementById("isfree");

    var minPrice = 1;
    var maxPrice = 5000;

    input.value = input.value.replace(/[^0-9]/g, "");

    if (!isfree.checked) {
        if (input.value < minPrice) {
            input.value = minPrice;
        }
    
        if (input.value > maxPrice) {
            input.value = maxPrice;
        }
    } else {
        input.value = 0;
    }
}
