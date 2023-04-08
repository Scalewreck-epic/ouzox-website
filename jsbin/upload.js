const filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/filter";
const image_filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/image_filter";

const uploadGame = document.getElementById("upload-game");

function filter(text) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            "text": text,
        })
    }

    return fetch(filter_api_url, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);

            var response = result_parse.response;
            var response_result = response.result;
            var result_response = response_result.response;

            if (result_response.categories) {
                for (let i = 0; i < result_response.categories.length; i++) {
                    const category = result_response.categories[i];
                    const label = category.label;
                    const label_topic = label.substring(0, label.indexOf(">"));
                    const label_reason = label.substring(label.indexOf(">") + 1);

                    if (label_topic == "Sensitive Topics") {
                        return label_reason;
                    }
                }
            }

            return "No reason";
        })
}
  

uploadGame.addEventListener("submit", function(event) {
    event.preventDefault();
    var error_label = document.getElementById("error-label");

    var game_file_warn = document.getElementById("game-file-warn");
    var title_warn = document.getElementById("game-title-warn");
    var desc_warn = document.getElementById("desc-warn");

    checkFileSize();
    checkPrice();
    checkTitleLength();

    if (game_file_warn.innerHTML == "" || title_warn.innerHTML == "" || desc_warn.innerHTML == "") {
        error_label.innerHTML = "Uploading game.."

        const file_input = document.getElementById("download-file");
        const thumbnail_input = document.getElementById("thumbnail");
        const description_input = document.getElementById("description");
        const price_input = document.getElementById("price");
        const title_input = document.getElementById("title");

        function handleFilterResult(result, label) {
            if (result == "No reason") {
                console.log(label , "accepted through filter.");
            } else {
                console.warn("Cannot continue upload process because text includes" , result);
                error_label.innerHTML = label+" not accepted because of "+result;
                throw new Error("Upload process cancelled.");
            }
        }
        
        try {
            filter(title_input.value).then(result => {
                handleFilterResult(result, "Title");
                filter(description_input.value).then(result => {
                    handleFilterResult(result, "Description");
                });
            });
        } catch(error) {
            console.warn("There was an error trying to handle text filter: " , error);
        }
    } else {
        error_label.innerHTML = "Incomplete form.";
    }
});

function checkThumbnail() {
    const input = document.getElementById("thumbnail");
    const previewImage = document.getElementById("previewImage");

    const reader = new FileReader();
    const file = input.files[0];

    reader.addEventListener("load", function() {
        const imageUrl = reader.result;
        previewImage.src = imageUrl;
    })

    reader.readAsDataURL(file);
}

function checkFileSize() {
    const input = document.getElementById("download-file");
    const warn = document.getElementById("game-file-warn");

    const file = input.files[0];
    const maxFileSize = 20000000000; // 20GB in bytes

    if (file.size > maxFileSize) {
        warn.innerHTML = "File size too large. Select a file under 20GB";
        input.value = "";
    } else {
        warn.innerHTML = "";
    }
}

function updatePriceLabel() {
    const currencySort = document.getElementById("currency-sort");
    const priceLabel = document.getElementById("price-label");

    const currencyOption = currencySort.options[currencySort.selectedIndex];
    const currencySymbol = currencyOption.textContent.match(/\((.*)\)/)[1];
    priceLabel.innerHTML = "Price (" + currencySymbol + "):";
}

function checkIsFree() {
    const isfree = document.getElementById("isfree");
    const input = document.getElementById("price");

    if (!isfree.checked) {
        checkPrice();
    } else {
        input.value = 0;
    }
}

function checkTitleLength() {
    const title = document.getElementById("title");
    const title_warn = document.getElementById("game-title-warn");

    if (title.value.length > 20) {
        title_warn.innerHTML = "Title must be below 20 characters.";
    } else if (title.value.length < 3) {
        title_warn.innerHTML = "Title must be above 3 characters.";
    } else {
        title_warn.innerHTML = "";
    }
}

function checkDescriptionLength() {
    const desc = document.getElementById("description");
    const desc_warn = document.getElementById("desc-warn");

    if (desc.value.length > 1000) {
        desc_warn.innerHTML = "Description too long.";
    } else if (desc.value.length < 15) {
        desc_warn.innerHTML = "Description too short.";
    } else {
        desc_warn.innerHTML = "";
    }
}

function checkPrice() {
    const input = document.getElementById("price");
    const isfree = document.getElementById("isfree");

    const minPrice = 1;
    const maxPrice = 5000;

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

const currencySort = document.getElementById("currency-sort");
currencySort.addEventListener("change", updatePriceLabel);

checkDescriptionLength();
checkTitleLength();
checkIsFree();
