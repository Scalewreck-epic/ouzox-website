const create_product =
  "https://x8ki-letl-twmt.n7.xano.io/api:iwAsZq4E/products";
const set_price = "https://x8ki-letl-twmt.n7.xano.io/api:tFdG2Vz-/prices";
const create_game = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv/games";

const uploadGame = document.getElementById("upload-game");

import { fetch_user } from "../../user/sessionManager.js";
import { request } from "../../base/apiManager.js";

const format_file_size = (fileSizeInBytes) => {
  if (fileSizeInBytes < Math.pow(1024, 2)) {
    return `${(fileSizeInBytes / Math.pow(1024, 1)).toFixed(2)} KB`;
  } else if (fileSizeInBytes < Math.pow(1024, 3)) {
    return `${(fileSizeInBytes / Math.pow(1024, 2)).toFixed(2)} MB`;
  } else {
    return `${(fileSizeInBytes / Math.pow(1024, 3)).toFixed(2)} GB`;
  }
};

const upload_product = async () => {
  const productRequestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      product: {
        name: title_input.value,
        active: "false",
      },
    }),
  };

  const result = await request(
    create_product,
    productRequestOptions,
    true,
    "product upload"
  );

  return result;
};

const upload_game = async (gameRequestOptions) => {
  const result = await request(
    create_game,
    gameRequestOptions,
    true,
    "game upload"
  );

  return result;
};

const set_product_price = async (product_id) => {
  const priceRequestOptions = {
    method: "POST",
    headers: myHeaders,
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

  const result = await request(
    set_price,
    priceRequestOptions,
    true,
    "price creation"
  );

  return result;
};

const on_submit = async (event) => {
  event.preventDefault();

  const error_label = document.getElementById("error-label");
  const game_file_warn = document.getElementById("game-file-warn");

  update_thumbnail();
  update_file_size();
  update_price();

  if (game_file_warn.innerText == "") {
    const title_input = document.getElementById("title");
    const description_input = document.getElementById("description");
    const summary_input = document.getElementById("summary");
    const thumbnail_input = document.getElementById("thumbnail");
    const file_input = document.getElementById("download-file");
    const price_input = document.getElementById("price");
    const currency_input = document.getElementById("currency-sort");
    const game_isfree = document.getElementById("isfree");

    const genre_input = document.getElementById("genre-input");
    const art_input = document.getElementById("art-style-input");
    const age_rating = document.getElementById("age-sort");

    const single_player = document.getElementById("single-player");
    const multi_player = document.getElementById("multi-player");
    const co_op = document.getElementById("co-op");
    const achievements = document.getElementById("achievements");
    const controller_support = document.getElementById("controller-support");
    const saves = document.getElementById("saves");

    const windows = document.getElementById("windows");
    const mac = document.getElementById("mac");
    const linux = document.getElementById("linux");
    const android = document.getElementById("android");
    const ios = document.getElementById("ios");
    const xbox = document.getElementById("xbox");
    const playstation = document.getElementById("playstation");
    const oculus = document.getElementById("oculus");

    const uploader = await fetch_user();
    const uploader_name = uploader.name;
    const uploader_id = uploader.id;

    const currency = currency_input.options[currency_input.selectedIndex].value;
    const age = age_rating.options[age_rating.selectedIndex].value;
    const file = file_input.files[0];

    const file_size = format_file_size(file.size);

    const game_features = [
      {
        Enabled: single_player.checked ? "true" : "false",
      },
      {
        Enabled: multi_player.checked ? "true" : "false",
      },
      {
        Enabled: co_op.checked ? "true" : "false",
      },
      {
        Enabled: achievements.checked ? "true" : "false",
      },
      {
        Enabled: controller_support.checked ? "true" : "false",
      },
      {
        Enabled: saves.checked ? "true" : "false",
      },
    ];

    const game_platforms = [
      {
        Enabled: windows.checked ? "true" : "false",
      },
      {
        Enabled: mac.checked ? "true" : "false",
      },
      {
        Enabled: linux.checked ? "true" : "false",
      },
      {
        Enabled: android.checked ? "true" : "false",
      },
      {
        Enabled: ios.checked ? "true" : "false",
      },
      {
        Enabled: xbox.checked ? "true" : "false",
      },
      {
        Enabled: playstation.checked ? "true" : "false",
      },
      {
        Enabled: oculus.checked ? "true" : "false",
      },
    ];

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

    error_label.textContent = "Creating game page...";

    if (price_input.value > 0) {
      const product_result = await upload_product();

      if (product_result && product_result.id) {
        const gameRequestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            name: title_input.value,
            active: "false",
            free: game_isfree.checked,
            description: description_input.innerHTML,
            developer: {
              username: uploader_name,
              id: uploader_id,
            },
            file_name: file.name,
            summary: summary_input.value,
            genre: genre_input.value.toUpperCase(),
            artstyle: art_input.value.toUpperCase(),
            age_rating: age,
            size: Math.round(file_size),
            defaultColors: true,
            icon_upload: imageURI,
            product_id: product_result.id,
            platforms: {
              windows: game_platforms[0].Enabled,
              mac: game_platforms[1].Enabled,
              linux: game_platforms[2].Enabled,
              android: game_platforms[3].Enabled,
              ios: game_platforms[4].Enabled,
              xbox: game_platforms[5].Enabled,
              playstation: game_platforms[6].Enabled,
              oculus: game_platforms[7].Enabled,
            },
            features: {
              Singleplayer: game_features[0].Enabled,
              Multiplayer: game_features[1].Enabled,
              Coop: game_features[2].Enabled,
              Achievements: game_features[3].Enabled,
              ControllerSupport: game_features[4].Enabled,
              Saves: game_features[5].Enabled,
            },
            colors: {
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
          }),
        };

        error_label.textContent = "Setting price...";

        const game = await upload_game(gameRequestOptions);
        const price = await set_product_price(product_result.id);

        if (price && price.active && game.game) {
          console.log("Game and product created successfully");
          error_label.textContent = "Successfully published game!";
        }
      }
    } else {
      const gameRequestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          name: title_input.value,
          active: "false",
          free: game_isfree.checked,
          description: description_input.innerHTML,
          developer: {
            username: uploader_name,
            id: uploader_id,
          },
          file_name: file.name,
          summary: summary_input.value,
          genre: genre_input.value.toUpperCase(),
          artstyle: art_input.value.toUpperCase(),
          age_rating: age,
          size: Math.round(file_size),
          defaultColors: true,
          icon_upload: imageURI,
          product_id: "none",
          platforms: {
            windows: game_platforms[0].Enabled,
            mac: game_platforms[1].Enabled,
            linux: game_platforms[2].Enabled,
            android: game_platforms[3].Enabled,
            ios: game_platforms[4].Enabled,
            xbox: game_platforms[5].Enabled,
            playstation: game_platforms[6].Enabled,
            oculus: game_platforms[7].Enabled,
          },
          features: {
            Singleplayer: game_features[0].Enabled,
            Multiplayer: game_features[1].Enabled,
            Coop: game_features[2].Enabled,
            Achievements: game_features[3].Enabled,
            ControllerSupport: game_features[4].Enabled,
            Saves: game_features[5].Enabled,
          },
          colors: {
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
        }),
      };

      const game = await upload_game(gameRequestOptions);

      if (game.game) {
        console.log("Game uploaded successfully");
        error_label.textContent = "Successfully published game!";
      } else {
        error_label.textContent = game.message;
      }
    }
  } else {
    error_label.innerHTML = "Incomplete form.";
  }
};

const game_thumbnail = document.getElementById("thumbnail");
const game_price = document.getElementById("price");
const genre_input = document.getElementById("genre-input");
const game_isfree = document.getElementById("isfree");
const game_art = document.getElementById("art-style-input");
const download_file = document.getElementById("download-file");
const game_description = document.getElementById("description");

const update_thumbnail = () => {
  const previewImage = document.getElementById("previewImage");

  const reader = new FileReader();
  const file = game_thumbnail.files[0];

  reader.addEventListener("load", function () {
    const imageUrl = reader.result;
    previewImage.src = imageUrl;
  });

  if (file !== null && file instanceof Blob) {
    reader.readAsDataURL(file);
  }
};

const update_file_size = () => {
  const warn = document.getElementById("game-file-warn");

  const file = download_file.files[0];
  const file_size = file.size / Math.pow(1024, 3);

  if (file_size > 5) {
    warn.innerHTML = "File size too large, select a file under 5GB";
    download_file.value = "";
  } else {
    warn.innerHTML = "";
  }
};

const update_free = () => {
  if (!game_isfree.checked) {
    update_price();
  } else {
    game_price.value = 0;
  }
};

const update_price = () => {
  const minPrice = 1;
  const maxPrice = 5000;

  game_price.value = game_price.value.replace(/[^0-9]/g, "");

  if (!game_isfree.checked) {
    if (game_price.value < minPrice) {
      game_price.value = minPrice;
    }

    if (game_price.value > maxPrice) {
      game_price.value = maxPrice;
    }
  } else {
    game_price.value = 0;
  }
};

const update_genre = () => {
  genre_input.value = genre_input.value.toUpperCase();
};

const update_art = () => {
  game_art.value = game_art.value.toUpperCase();
};

const update_description = () => {
  const text = DOMPurify.sanitize(game_description.innerHTML);

  if (text.length > 4000) {
    game_description.innerHTML = text.substr(0, 4000);
  }
};

update_description();
update_price();
update_genre();
update_art();
update_file_size();
update_thumbnail();
update_free();

game_description.addEventListener("input", () => update_description());
game_price.addEventListener("input", () => update_price());
genre_input.addEventListener("input", () => update_genre());
game_art.addEventListener("input", () => update_art());
download_file.addEventListener("change", () => update_file_size());
game_thumbnail.addEventListener("change", () => update_thumbnail());
game_isfree.addEventListener("change", () => update_free());
uploadGame.addEventListener("submit", async () => await on_submit());
