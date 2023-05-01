const filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/filter";
const image_filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/image_filter";

const upload_product_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products";
const set_product_price_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";

const uploadGame = document.getElementById("upload-game");

async function filter(text) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            "text": text,
        })
    }

    try {
        const response = await fetch(filter_api_url, requestOptions);
        const result = await response.text();

        var result_parse = JSON.parse(result);
        var response_result = result_parse.response.result;
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
    } catch (error) {
        console.warn("There was an error trying to fetch text filter: " , error);
        return "No reason";
    }
}

uploadGame.addEventListener("submit", async function(event) {
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
        const currency_input = document.getElementById("currency-sort");
        const title_input = document.getElementById("title");

        function handleFilterResult(result, label) {
            if (result == "No reason") {
                console.log(label , "accepted through filter.");
                return true;
            } else {
                console.warn("Cannot continue upload process because text includes" , result);
                error_label.innerHTML = label+" not accepted because of "+result;
                return false;
            }
        }

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const currency = currency_input.options[currency_input.selectedIndex].value;

        var uploadRequestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
                "product": {
                    "id": null,
                    "name": title_input.value,
                    "active": null,
                    "description": description_input.value,
                    "metadata": null,
                    "type": null,
                    "attributes": [],
                    "caption": null,
                    "deactivate_on": [],
                    "images": [],
                    "package_dimensions": {
                      "height": null,
                      "length": null,
                      "weight": null,
                      "width": null
                    },
                    "shippable": null,
                    "statement_descriptor": null,
                    "unit_label": null,
                    "url": null
                }
            })
        };

        async function uploadProduct() {
            try {
                const response = await fetch(upload_product_api_url, uploadRequestOptions);
                const result = await response.text();
                const result_parse = JSON.parse(result);
    
                console.log(result_parse);
                return result_parse;
            } catch (error) {
                warn("There was an error trying to upload a product: "+error);
            }
        }

        async function setProductPrice(product_id) {
            var priceRequestOptions = {
                method: "POST",
                headers: myHeaders,
                redirect: "follow",
                body: JSON.stringify({
                    "price": {
                        "currency": currency,
                        "unit_amount": price_input.value * 100,
                        "active": null,
                        "nickname": "",
                        "product": product_id,
                        "recurring": {
                          "interval": null,
                          "aggregate_usage": null,
                          "interval_count": null,
                          "usage_type": null
                        },
                        "tiers": [],
                        "tiers_mode": null,
                        "billing_scheme": null,
                        "lookup_key": null,
                        "product_data": {
                          "name": null,
                          "active": null,
                          "statement_descriptor": null,
                          "unit_label": null,
                          "metadata": null
                        },
                        "transfer_lookup_key": null,
                        "transform_quantity": {
                          "divide_by": null,
                          "round": null
                        },
                        "unit_amount_decimal": null,
                        "metadata": null
                    }
                })
            }

            try {
                const response = await fetch(set_product_price_url, priceRequestOptions);
                const result = await response.text();
                const result_parse = JSON.parse(result);
    
                console.log(result_parse);
            } catch (error) {
                warn("There was an error trying to set price: "+error);
            }
        }

        try {
            const titleResult = await filter(title_input.value);
            const isTitleValid = handleFilterResult(titleResult, "Title");
        
            const descriptionResult = await filter(description_input.value);
            const isDescriptionValid = handleFilterResult(descriptionResult, "Description");
        
            // Check if both title and description are accepted before uploading the product
            if (isTitleValid && isDescriptionValid) {
                const result = await uploadProduct();
                if (result) {
                    await setProductPrice(result.id);
                    console.log("Product uploaded successfully!");
                } else {
                    error_label.innerHTML = "There was an error trying to upload game.";
                }
            } else {
                error_label.innerHTML = "Incomplete form.";
            }
        } catch(error) {
            console.warn("There was an error trying to handle text filter: " , error);
        }
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

checkDescriptionLength();
checkTitleLength();
checkIsFree();
