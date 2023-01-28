const uploadGame = document.getElementById("upload-game");

uploadGame.addEventListener("submit", function(event) {
    event.preventDefault();
    
    var error_label = document.getElementById("error-label");
    error_label.innerHTML = "Uploading game.."

    checkFileSize();
    checkPrice();

    const downloadFile = document.getElementById("download-file");
    const thumbnail = document.getElementById("thumbnail");
    const price = document.getElementById("price");
    const title = document.getElementById("title");
    const isfree = document.getElementById("isfree");

    const formData = new FormData();
    formData.append("download-file", downloadFile.files[0]);
    formData.append("thumbnail", thumbnail.files[0]);
    formData.append("title", title.value);
    formData.append("price", price.value);

    formData.forEach(function(value, key) {
        console.log(key + ": " + value);
    });

    // TO DO //
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var product_permalink = "" // TO DO //
    var license_key = "" // TO DO //
    var gumroad_upload_url = "https://v1.nocodeapi.com/scalewreck/gumroad/xZdMSxWrIzteMRRb/licenses/verify?product_permalink="+product_permalink+"&license_key="+license_key;
    var endpoint_upload_url = "https://v1.nocodeapi.com/scalewreck/ep/EEfUSWVHrbBXlpDl"
    
    var requestOptions = {
        method: "post",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
    };

    var fetch_url

    if (isfree.checked) {
        fetch_url = endpoint_upload_url;
    } else {
        fetch_url = gumroad_upload_url;
    }

    console.log(fetch_url);
    fetch(fetch_url, requestOptions)
    .then(response => {
        if (response.ok) {
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
