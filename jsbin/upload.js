const upload_product_api_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products";
const set_product_price_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";
const upload_image_api_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:4A2Ya61A/storage/image";
const get_genre_api_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/genres/"; // + genre name;
const change_genre_api_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/genres/update/"; // + genre name
const add_genre_api_url =
  "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/genres/create";

const uploadGame = document.getElementById("upload-game");

import { getUser } from "./exportuser.js";

uploadGame.addEventListener("submit", async function (event) {
  event.preventDefault();
  const error_label = document.getElementById("error-label");

  const game_file_warn = document.getElementById("game-file-warn");

  checkThumbnail();
  checkFileSize();
  checkPrice();
  checkPrice();

  if (game_file_warn.innerText == "") {
    const title_input = document.getElementById("title");
    const summary_input = document.getElementById("summary");
    const thumbnail_input = document.getElementById("thumbnail");
    const file_input = document.getElementById("download-file");
    const description_input = document.getElementById("description");
    const price_input = document.getElementById("price");
    const currency_input = document.getElementById("currency-sort");

    const genre_input = document.getElementById("genre-input");
    const art_input = document.getElementById("art-style-input");
    const age_rating = document.getElementById("age-sort");

    const uploader = await getUser();
    const uploader_name = uploader.name;

    const currency = currency_input.options[currency_input.selectedIndex].value;
    const age = age_rating.options[age_rating.selectedIndex].value;
    const file = file_input.files[0];

    const fileSizeInMB = file.size / (1024 * 1024);

    const image = thumbnail_input.files[0];
    const reader = new FileReader();
    let imageURI;

    reader.onload = function (event) {
      imageURI = event.target.result;
    };

    await new Promise((resolve) => {
      reader.onloadend = () => resolve();
      reader.readAsDataURL(image);
    });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const uploadImageRequestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
      body: JSON.stringify({
        image: imageURI,
      }),
    };

    async function uploadProduct(product_image) {
      try {
        const uploadRequestOptions = {
          method: "POST",
          headers: myHeaders,
          redirect: "follow",
          body: JSON.stringify({
            product: {
              id: null,
              name: title_input.value,
              active: null,
              description: description_input.innerHTML,
              metadata: {
                developer_name: uploader_name,
                file_name: file.name,
                summary: summary_input.value,
                genre: genre_input.value.toUpperCase(),
                artstyle: art_input.value.toUpperCase(),
                age_rating: age,
                size: Math.round(fileSizeInMB),
                defaultColors: true,
                bgColor: "",
                bg2Color: "",
                titleColor: "",
                descColor: "",
                descBGColor: "",
                buttonColor: "",
                buttonTextColor: "",
                statsColor: "",
                statsBGColor: "",
              },
              type: null,
              attributes: [],
              caption: null,
              deactivate_on: [],
              images: [product_image.url],
              package_dimensions: {
                height: null,
                length: null,
                weight: null,
                width: null,
              },
              shippable: null,
              statement_descriptor: null,
              unit_label: null,
              url: null,
            },
          }),
        };

        const response = await fetch(
          upload_product_api_url,
          uploadRequestOptions
        );
        const result = await response.text();
        const result_parse = JSON.parse(result);

        return result_parse;
      } catch (error) {
        warn("There was an error trying to upload a product: " + error);
      }
    }

    async function uploadImage() {
      try {
        const response = await fetch(
          upload_image_api_url,
          uploadImageRequestOptions
        );
        const result = await response.text();
        const result_parse = JSON.parse(result);

        return result_parse;
      } catch (error) {
        warn("There was an error trying to upload an image: " + error);
      }
    }

    async function updateGenre() {
      const uploadGenreOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      let doesGenreExist = false;
      let genreData = {};

      try {
        const response = await fetch(
          get_genre_api_url + genre_input.value.toUpperCase(),
          uploadGenreOptions
        );
        const result = await response.text();
        const resultParse = JSON.parse(result);

        console.log(resultParse);
        if (resultParse.message && resultParse.message == "Not Found") {
          doesGenreExist = false;
        } else {
          doesGenreExist = true;
          genreData = resultParse;
        }
      } catch (error) {
        warn("There was an error trying to upload genre: " + error);
      }

      const changeGenreOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
        body: JSON.stringify({
          genre_name: genre_input.value.toUpperCase(),
          games_with_genre: doesGenreExist ? genreData.games_with_genre + 1 : 1,
        }),
      };

      try {
        const endpointURL = doesGenreExist
          ? change_genre_api_url + genre_input.value.toUpperCase()
          : add_genre_api_url;

        await fetch(endpointURL, changeGenreOptions);
      } catch (error) {
        warn("There was an error trying to upload genre: " + error);
      }
    }

    async function setProductPrice(product_id) {
      const priceRequestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
        body: JSON.stringify({
          price: {
            currency: currency,
            unit_amount: price_input.value * 100,
            active: null,
            nickname: "",
            product: product_id,
            recurring: {
              interval: null,
              aggregate_usage: null,
              interval_count: null,
              usage_type: null,
            },
            tiers: [],
            tiers_mode: null,
            billing_scheme: null,
            lookup_key: null,
            product_data: {
              name: null,
              active: null,
              statement_descriptor: null,
              unit_label: null,
              metadata: null,
            },
            transfer_lookup_key: null,
            transform_quantity: {
              divide_by: null,
              round: null,
            },
            unit_amount_decimal: null,
            metadata: null,
          },
        }),
      };

      try {
        const response = await fetch(
          set_product_price_url,
          priceRequestOptions
        );
        const result = await response.text();
        const result_parse = JSON.parse(result);

        return result_parse;
      } catch (error) {
        warn("There was an error trying to set price: " + error);
      }
    }

    try {
      error_label.innerHTML = "Uploading image...";
      const image_metadata = await uploadImage();

      if (image_metadata) {
        error_label.innerHTML = "Creating game page...";

        if (price_input.value > 0) {
          const result = await uploadProduct(image_metadata.image.image);

          if (result && result.id) {
            error_label.innerHTML = "Setting price...";
            const price = await setProductPrice(result.id);
            await updateGenre();
            if (price && price.active) {
              console.log("Product uploaded successfully!");
              error_label.innerHTML = "Successfully published game!";
            }
          }
        } else {
          error_label.innerHTML =
            "Free games are not able to be put onto the platform just yet.";
          // Handle uploading game when user sets price to free.
        }
      }
    } catch (error) {
      console.error("There was an error trying to publish game: ", error);
      error_label.innerHTML = "There was an error trying to upload game.";
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

  reader.addEventListener("load", function () {
    const imageUrl = reader.result;
    previewImage.src = imageUrl;
  });

  reader.readAsDataURL(file);
}

function checkFileSize() {
  const input = document.getElementById("download-file");
  const warn = document.getElementById("game-file-warn");

  const file = input.files[0];
  const maxFileSize = 5368709120;

  if (file.size > maxFileSize) {
    warn.innerHTML = "File size too large, select a file under 5GB";
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

const game_thumbnail = document.getElementById("thumbnail");
const game_price = document.getElementById("price");
const game_isfree = document.getElementById("isfree");
const game_title = document.getElementById("title");
const game_summary = document.getElementById("summary");

checkIsFree();

game_thumbnail.onchange = function () {
  checkThumbnail();
};

game_isfree.onchange = function () {
  checkIsFree();
};

game_price.addEventListener("input", function () {
  checkPrice();
});

game_title.addEventListener("input", function () {
  this.style.width = (this.value.length + 1) * 10 + "px";
});

game_summary.addEventListener("input", function () {
  this.style.width = (this.value.length + 1) * 10 + "px";
});
