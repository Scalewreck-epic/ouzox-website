const description = document.getElementById("description");
const game_column = document.getElementById("game-column");

const formattingButtons = {
  bold: document.getElementById("bold"),
  italic: document.getElementById("italic"),
  underline: document.getElementById("underline"),
  strikethrough: document.getElementById("strikethrough"),
};

const listButtons = {
  unorderedlist: document.getElementById("insertUnorderedList"),
  orderedlist: document.getElementById("insertOrderedList"),
};

const alignmentButtons = {
  left: document.getElementById("Left"),
  right: document.getElementById("Right"),
  center: document.getElementById("Center"),
};

const headerButtons = {
  1: document.getElementById("1"),
  2: document.getElementById("2"),
  3: document.getElementById("3"),
  4: document.getElementById("4"),
};

const font_sort = document.getElementById("font-sort");
const link = document.getElementById("link");

function apply_formatting(button) {
  const formatType = button.id;
  const selection = window.getSelection();
  const selectedText = selection.toString();

  document.execCommand(formatType);

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(selectedText));
  }
}

function apply_header(button) {
  const level = button.id;
  const selection = window.getSelection();
  const selectedText = selection.toString();

  document.execCommand("formatBlock", false, `<h${level}>`);

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(selectedText));
  }
}

function justify(button) {
  const level = button.id;
  document.execCommand("justify" + level);
}

function create_link() {
  const url = prompt("Enter the link URL:");

  if (url) {
    const cleanURL = DOMPurify.sanitize(url);
    const selection = window.getSelection();
    const selectedText = selection.toString();

    const link = document.createElement("a");
    link.setAttribute("href", cleanURL);
    link.setAttribute("target", "_blank");
    link.textContent = selectedText;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(link);
    }
  }
}

if (font_sort) {
  font_sort.addEventListener("change", function () {
    game_column.style.fontFamily =
      font_sort.options[font_sort.selectedIndex].value;
  });
}

link.addEventListener("click", () => create_link());

Object.values(formattingButtons).forEach((button) =>
  button.addEventListener("click", () => apply_formatting(button))
);
Object.values(listButtons).forEach((button) =>
  button.addEventListener("click", () => apply_formatting(button))
);
Object.values(alignmentButtons).forEach((button) =>
  button.addEventListener("click", () => justify(button))
);
Object.values(headerButtons).forEach((button) =>
  button.addEventListener("click", () => apply_header(button))
);
