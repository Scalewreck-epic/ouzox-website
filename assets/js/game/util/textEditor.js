const description = document.getElementById("description");
const gameColumn = document.getElementById("game-column");

const buttons = {
  formatting: {
    bold: document.getElementById("bold"),
    italic: document.getElementById("italic"),
    underline: document.getElementById("underline"),
    strikethrough: document.getElementById("strikethrough"),
  },
  list: {
    unorderedlist: document.getElementById("insertUnorderedList"),
    orderedlist: document.getElementById("insertOrderedList"),
  },
  alignment: {
    left: document.getElementById("Left"),
    right: document.getElementById("Right"),
    center: document.getElementById("Center"),
  },
  header: {
    1: document.getElementById("1"),
    2: document.getElementById("2"),
    3: document.getElementById("3"),
    4: document.getElementById("4"),
  },
};

const fontSort = document.getElementById("font-sort");
const link = document.getElementById("link");

const applyFormat = (formatType) => {
  document.execCommand(formatType);
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(selectedText));
  }
};

const applyHeader = (level) => {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const header = document.createElement(`h${level}`);
    header.textContent = selectedText;

    range.deleteContents();
    range.insertNode(header);
  }
};

const justify = (level) => {
  document.execCommand(`justify${level}`);
};

const createLink = () => {
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
};

if (fontSort) {
  fontSort.addEventListener("change", function () {
    gameColumn.style.fontFamily =
    fontSort.options[fontSort.selectedIndex].value;
  });
}

link.addEventListener("click", createLink);

Object.values(buttons.formatting).forEach((button) =>
  button.addEventListener("click", () => applyFormat(button.id))
);

Object.values(buttons.list).forEach((button) =>
  button.addEventListener("click", () => applyFormat(button.id))
);

Object.values(buttons.alignment).forEach((button) =>
  button.addEventListener("click", () => justify(button.id))
);

Object.values(buttons.header).forEach((button) =>
  button.addEventListener("click", () => applyHeader(button.id))
);