const uploadGame = document.getElementById("upload-game");

uploadGame.addEventListener("submit", function(event) {
    event.preventDefault();

    checkFileSize();
    checkPrice();

    const downloadFile = document.getElementById("download-file");
    const thumbnail = document.getElementById("thumbnail");
    const price = document.getElementById("price");
    const title = document.getElementById("title");

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

    var url = ""
    var requestOptions = {
        method: "post",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
    };

    fetch(url, requestOptions)
    .then(response => {
        if (response.ok) {
            alert("File upload success");
        } else {
            alert("File upload failed")
        }
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
            input.value = maxPrice
        }
    } else {
        input.value = 0;
    }
}