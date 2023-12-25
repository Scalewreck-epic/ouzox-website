const description = document.getElementById("description");
const game_column = document.getElementById("game-column");

const bold_button = document.getElementById("bold");
const italic_button = document.getElementById("italic");
const underline_button = document.getElementById("underline");
const strikethrough_button = document.getElementById("strikethrough");
const link_button = document.getElementById("link");

const unorderedlist_button = document.getElementById("insertUnorderedList");
const orderedlist_button = document.getElementById("insertOrderedList");

const left_button = document.getElementById("justifyLeft");
const right_button = document.getElementById("justifyRight");
const center_button = document.getElementById("justifyCenter");

const font_sort = document.getElementById("font-sort");

const header1_button = document.getElementById("1");
const header2_button = document.getElementById("2");
const header3_button = document.getElementById("3");
const header4_button = document.getElementById("4");

import { sanitizeUrl } from "@braintree/sanitize-url";

function applyFormatting(formatType) {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  document.execCommand(formatType);

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(selectedText));
  }
}

function applyHeader(level) {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  document.execCommand("formatBlock", false, `<h${level}>`)

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(selectedText));
  };
};

function justify(direction) {
  document.execCommand("justify" + direction);
};

function createLink() {
  const url = prompt("Enter the link URL:");

  if (url) {
    const cleanURL = sanitizeUrl(url);
    const selection = window.getSelection();
    const selectedText = selection.toString();

    const link = document.createElement("a");
    link.setAttribute("href", cleanURL);
    link.setAttribute("target", "_blank");
    link.textContent = text || selectedText;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(link);
    };
  };
};

bold_button.addEventListener("click", function () {
  applyFormatting("bold");
});

italic_button.addEventListener("click", function () {
  applyFormatting("italic");
});

underline_button.addEventListener("click", function () {
  applyFormatting("underline");
});

strikethrough_button.addEventListener("click", function () {
  applyFormatting("strikeThrough");
});

link_button.addEventListener("click", function () {
  createLink();
});

unorderedlist_button.addEventListener("click", function () {
  applyFormatting("insertUnorderedList");
});

orderedlist_button.addEventListener("click", function () {
  applyFormatting("insertOrderedList");
});

left_button.addEventListener("click", function () {
  justify("Left");
});

right_button.addEventListener("click", function () {
  justify("Right");
});

center_button.addEventListener("click", function () {
  justify("Center");
});

header1_button.addEventListener("click", function () {
  applyHeader(1);
});

header2_button.addEventListener("click", function () {
  applyHeader(2);
});

header3_button.addEventListener("click", function () {
  applyHeader(3);
});

header4_button.addEventListener("click", function () {
  applyHeader(4);
});

font_sort.addEventListener("change", function() {
  game_column.style.fontFamily = font_sort.options[font_sort.selectedIndex].value;
});
