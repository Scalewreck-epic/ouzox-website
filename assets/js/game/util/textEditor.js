/**
 * @file textEditor.js
 * @description This module handles text editing functionalities for game descriptions.
 * It provides options for formatting text, creating lists, headers, and links.
 */


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

/**
 * Checks if the selected text is in a number list or bullet point list.
 * @param {Selection} selection - The selected text.
 * @returns 
 */
const isInList = (selection) => {
  const parentElement = selection.anchorNode.parentElement;
  return parentElement.closest("ul, ol") !== null;
};

/**
 * Applies the format according to the given format type.
 * @param {string} formatType - The format type.
 */
const applyFormat = (formatType) => {
  const selection = window.getSelection();

  if (!isInList(selection)) {
    const selectedText = selection.toString();

    if (description.contains(selection.anchorNode)) {
      document.execCommand(formatType);

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(selectedText));
      }
    }
  }
}

/**
 * Applies a header according to the header level.
 * @param {number} level - The header level.
 */
const applyHeader = (level) => {
  const selection = window.getSelection();

  if (!isInList(selection)) {
    const selectedText = selection.toString();

    if (
      description.contains(selection.anchorNode) &&
      selection.rangeCount > 0
    ) {
      const range = selection.getRangeAt(0);
      const header = document.createElement(`h${level}`);
      header.textContent = selectedText;

      range.deleteContents();
      range.insertNode(header);
    }
  }
};

/**
 * Creates a link element.
 */
const createLink = () => {
  const selection = window.getSelection();

  if (
    !isInList(selection) &&
    description.contains(selection.anchorNode) &&
    selection.rangeCount > 0
  ) {
    const url = prompt("Enter the link URL:");

    if (url) {
      const cleanURL = DOMPurify.sanitize(url);
      const selectedText = selection.toString();

      const link = document.createElement("a");
      link.setAttribute("href", cleanURL);
      link.setAttribute("target", "_blank");
      link.textContent = selectedText;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(link);
    }
  }
};

/**
 * Inserts a line break when creating a new line using 'enter'
 */
description.addEventListener("keydown", (e) => {
  const selection = window.getSelection();

  if (e.key === "Enter" && !isInList(selection)) {
    e.preventDefault();
    applyFormat("insertLineBreak");
  }
});

/**
 * Pastes text without formatting.
 */
description.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    if (
      range.startContainer &&
      description &&
      description.contains(range.startContainer)
    ) {
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  }
});

/**
 * Justifies the position of the element.
 * @param {string} level - The wanted position of the element (left, right, center).
 */
const justify = (level) => {
  document.execCommand(`justify${level}`);
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
