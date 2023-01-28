const uploadGame = document.getElementById("upload-game");

uploadGame.addEventListener("submit", function(event) {
    event.preventDefault();
    
    var error_label = document.getElementById("error-label");
    error_label.innerHTML = "Uploading game.."

    checkFileSize();
    checkPrice();

    const file_input = document.getElementById("download-file");
    const thumbnail_input = document.getElementById("thumbnail");
    const description_input = document.getElementById("description");
    const price_input = document.getElementById("price");
    const title_input = document.getElementById("title");

    // TO DO //
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var gumroad_upload_url = "https://v1.nocodeapi.com/scalewreck/gumroad/xZdMSxWrIzteMRRb/products";

    var productData = {
        name: title_input.value,
        price: price_input.value,
        description: description_input.value,
        thumbnail: thumbnail_input.files[0],
        file: {
            data: file_input.files[0],
        }
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
});

function checkFileSize() {
    var input = document.getElementById("download-file");
    var file = input.files[0];
    var maxFileSize = 250000000; // 250MB in bytes

    if (file.size > maxFileSize) {
        alert("File is too large. Select a file under 250MB");
        input.value = "";
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

function checkPrice() {
    var input = document.getElementById("price");
    var isfree = document.getElementById("isfree");

    var minPrice = 1;
    var maxPrice = 250;

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
