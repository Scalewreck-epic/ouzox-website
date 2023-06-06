const filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/filter";
const image_filter_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:oyF_ptYd/image_filter";

const upload_product_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products";
const set_product_price_url = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";
const upload_image_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:4A2Ya61A/storage/image";

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

    if (desc_warn.innerText == "" && title_warn.innerText == "" && game_file_warn.innerText == "") {
        const file_input = document.getElementById("download-file");
        const thumbnail_input = document.getElementById("thumbnail");
        const description_input = document.getElementById("description");
        const price_input = document.getElementById("price");
        const currency_input = document.getElementById("currency-sort");
        const title_input = document.getElementById("title");
        const uploader_name = document.getElementById("username");

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

        const currency = currency_input.options[currency_input.selectedIndex].value;
        const image = thumbnail_input.files[0];
        const reader = new FileReader();
        let imageURI;
        
        reader.onload = function(event) {
            imageURI = event.target.result;
        };
        
        await new Promise((resolve) => {
            reader.onloadend = () => resolve();
            reader.readAsDataURL(image);
        });

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var uploadImageRequestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify({
                "image": imageURI,
            }),
        };

        async function uploadProduct(product_image) {
            try {
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
                            "metadata": {
                                "developer_name": uploader_name.innerHTML,
                            },
                            "type": null,
                            "attributes": [],
                            "caption": null,
                            "deactivate_on": [],
                            "images": [
                                product_image.url,
                            ],
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

                const response = await fetch(upload_product_api_url, uploadRequestOptions);
                const result = await response.text();
                const result_parse = JSON.parse(result);
    
                console.log(result_parse);
                return result_parse;
            } catch (error) {
                warn("There was an error trying to upload a product: "+error);
            }
        };

        async function uploadImage() {
            try {
                const response = await fetch(upload_image_api_url, uploadImageRequestOptions);
                const result = await response.text();
                const result_parse = JSON.parse(result);

                console.log(result_parse);
                return result_parse;
            } catch (error) {
                warn("There was an error trying to upload an image: "+error);
            }
        };

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
            };

            try {
                const response = await fetch(set_product_price_url, priceRequestOptions);
                const result = await response.text();
                const result_parse = JSON.parse(result);
    
                console.log(result_parse);
                return result_parse;
            } catch (error) {
                warn("There was an error trying to set price: "+error);
            }
        };

        try {
            error_label.innerHTML = "Checking title..."
            const titleResult = await filter(title_input.value);
            const isTitleValid = handleFilterResult(titleResult, "Title");
        
            error_label.innerHTML = "Checking description..."
            const descriptionResult = await filter(description_input.value);
            const isDescriptionValid = handleFilterResult(descriptionResult, "Description");
        
            if (isTitleValid && isDescriptionValid) {
                error_label.innerHTML = "Uploading image..."
                const image_metadata = await uploadImage();

                if (image_metadata) {
                    error_label.innerHTML = "Creating game page..."

                    if (price_input.value > 0) {
                        const result = await uploadProduct(image_metadata.image.image);

                        if (result && result.id) {
                            error_label.innerHTML = "Setting price..."
                            const price = await setProductPrice(result.id);
                            if (price && price.active) {
                                console.log("Product uploaded successfully!");
                                error_label.innerHTML = "Successfully published game!";
                            }
                        }
                    } else {
                        error_label.innerHTML = "Free games are not able to be put onto the platform just yet.";
                        // Handle uploading game when user sets price to free.
                    }
                }
            }
        } catch(error) {
            console.warn("There was an error trying to publish game: " , error);
            error_label.innerHTML = "There was an error trying to upload game.";
        };
    } else {
        error_label.innerHTML = "Incomplete form.";
    };
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
    const maxFileSize = 5000000000; // 5GB in bytes

    if (file.size > maxFileSize) {
        warn.innerHTML = "File size too large. Select a file under 5GB";
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

    if (title.value.length > 200) {
        title_warn.innerHTML = "Title must be below 200 characters.";
    } else if (title.value.length < 1) {
        title_warn.innerHTML = "Title must be above 0 characters.";
    } else {
        title_warn.innerHTML = "";
    }
}

function checkDescriptionLength() {
    const desc = document.getElementById("description");
    const desc_warn = document.getElementById("desc-warn");

    if (desc.value.length > 1000) {
        desc_warn.innerHTML = "Description is too long.";
    } else if (desc.value.length < 1) {
        desc_warn.innerHTML = "Description is too short.";
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
