const credit_card_name = document.getElementById("credit-card-name-input");
const credit_card_number = document.getElementById("credit-card-number-input");
const credit_card_mm = document.getElementById("credit-card-mm-input");
const credit_card_yy = document.getElementById("credit-card-yy-input");
const credit_card_cvc = document.getElementById("credit-card-cvc-input");

function luhnCheck(creditCardNumber) {
  let sum = 0;
  for (let i = creditCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(creditCardNumber[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

function checkCard() {
  credit_card_name.value = credit_card_name.value.replace(/[^a-zA-Z\s]/g, "");
  credit_card_name.value = credit_card_name.value.toUpperCase();

  credit_card_mm.value = credit_card_mm.value
    .replace(/[^0-9]/g, "")
    .substr(0, 2);
  credit_card_yy.value = credit_card_yy.value
    .replace(/[^0-9]/g, "")
    .substr(0, 2);
  credit_card_cvc.value = credit_card_cvc.value
    .replace(/[^0-9]/g, "")
    .substr(0, 3);
}

function isValidCreditCard() {
  const credit_card_number = document.getElementById(
    "credit-card-number-input"
  );
  const credit_card_mm = document.getElementById("credit-card-mm-input");
  const credit_card_yy = document.getElementById("credit-card-yy-input");
  const credit_card_cvc = document.getElementById("credit-card-cvc-input");

  if (credit_card_number.length < 13 || credit_card_number > 19) {
    return false;
  }

  if (!luhnCheck(credit_card_number)) {
    return false;
  }

  if (credit_card_cvc.length !== 3 || !/^[0-9]+$/.test(credit_card_cvc)) {
    return false;
  }

  const expirationDate = `${credit_card_mm}/${credit_card_yy}`;
  const today = new Date();
  const expirationDateObject = new Date(expirationDate);
  if (expirationDateObject < today) {
    return false;
  }

  return true;
}

credit_card_number.addEventListener("input", function () {
  var card_number = credit_card_number.value;
  card_number = card_number.replace(/[^0-9]/g, "");
  card_number = `${card_number.substr(0, 4)} ${card_number.substr(
    4,
    4
  )} ${card_number.substr(8, 4)} ${card_number.substr(12, 4)}`;
  credit_card_number.value = card_number;
});

credit_card_mm.addEventListener("input", () => checkCard());
credit_card_yy.addEventListener("input", () => checkCard());
credit_card_cvc.addEventListener("input", () => checkCard());
credit_card_name.addEventListener("input", () => checkCard());
