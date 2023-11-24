const description = document.getElementById("description");
const gameColumn = document.getElementById("game-column");

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

  document.execCommand("formatBlock", false, "<h" + level + ">");

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(selectedText));
  }
}

function justify(direction) {
  document.execCommand("justify" + direction);
}

function createLink(text) {
  const url = prompt("Enter the link URL:");

  if (url) {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    const link = document.createElement("a");
    link.href = url;
    link.textContent = text || selectedText;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(link);
    }
  }
}

document.getElementById("bold").addEventListener("click", function () {
  applyFormatting("bold");
});

document.getElementById("italic").addEventListener("click", function () {
  applyFormatting("italic");
});

document.getElementById("underline").addEventListener("click", function () {
  applyFormatting("underline");
});

document.getElementById("strikethrough").addEventListener("click", function () {
  applyFormatting("strikeThrough");
});

document.getElementById("link").addEventListener("click", function () {
  createLink();
});

document.getElementById("insertUnorderedList").addEventListener("click", function () {
  applyFormatting("insertUnorderedList");
});

document.getElementById("insertOrderedList").addEventListener("click", function () {
  applyFormatting("insertOrderedList");
});

document.getElementById("justifyLeft").addEventListener("click", function () {
  justify("Left");
});

document.getElementById("justifyRight").addEventListener("click", function () {
  justify("Right");
});

document.getElementById("justifyCenter").addEventListener("click", function () {
  justify("Center");
});

document.getElementById("1").addEventListener("click", function () {
  applyHeader(1);
});

document.getElementById("2").addEventListener("click", function () {
  applyHeader(2);
});

document.getElementById("3").addEventListener("click", function () {
  applyHeader(3);
});

document.getElementById("4").addEventListener("click", function () {
  applyHeader(4);
});

document.getElementById("font-sort").addEventListener("change", function() {
  document.getElementById("game-column").style.fontFamily = document.getElementById("font-sort").options[document.getElementById("font-sort").selectedIndex].value;
});
