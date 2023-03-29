const filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/filter"

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

        function handleFilterResult(result) {
            if (result == "No reason") {
                // continue upload process
            } else {
                console.warn("Cannot continue upload process because text includes "+result);
                error_label.innerHTML = "Not accepted because of "+result;
                return;
            }
        }
        
        filter(title_input.value).then(handleFilterResult);
        filter(description_input.value).then(handleFilterResult);
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

function checkDescriptionLength() {
    var desc = document.getElementById("description");
    var desc_warn = document.getElementById("desc-warn");

    if (desc.value.length > 1000) {
        desc_warn.innerHTML = "Description too long.";
    } else if (desc.value.length < 15) {
        desc_warn.innerHTML = "Description too short.";
    } else {
        desc_warn.innerHTML = "";
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

checkDescriptionLength();
checkTitleLength();
