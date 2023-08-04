const description = document.getElementById("description");

const clipboard = navigator.clipboard;

function applyFormatting(command) {
  if (command === "bold") {
    clipboard.writeText("**");
  } else if (command === "italic") {
    clipboard.writeText("*");
  } else if (command === "underline") {
    clipboard.writeText("_");
  } else if (command === "strikethrough") {
    clipboard.writeText("~~");
  } else if (command === "link") {
    const url = prompt("Enter the URL:");
    const linkText = prompt("Enter the link text:");

    if (url && linkText) {
      const link = `<a href="${url}" target="_blank">${linkText}</a>`;
      clipboard.writeText(link);
    }
  } else if (command === "insertUnorderedList") {
    clipboard.writeText("* ");
  } else if (command === "insertOrderedList") {
    clipboard.writeText("1. ");
  } else if (command === "justifyLeft") {
    clipboard.writeText("align=left");
  } else if (command === "justifyRight") {
    clipboard.writeText("align=right");
  } else if (command === "justifyCenter") {
    clipboard.writeText("align=center");
  }

  clipboard.readText().then(function (text) {
    if (description.contains(document.getSelection().focusNode)) {
      document.execCommand(command, false, text, description);
    }
  });
}

function applyHeader(level) {
  const headerCommand = "h" + level;
  clipboard.writeText(headerCommand);

  clipboard.readText().then(function (text) {
    if (description.contains(document.getSelection().focusNode)) {
      document.execCommand("formatBlock", false, text, description);
    }
  });
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
  applyFormatting("strikethrough");
});

document.getElementById("link").addEventListener("click", function () {
  applyFormatting("link");
});

document
  .getElementById("insertUnorderedList")
  .addEventListener("click", function () {
    applyFormatting("insertUnorderedList");
  });

document
  .getElementById("insertOrderedList")
  .addEventListener("click", function () {
    applyFormatting("insertOrderedList");
  });

document.getElementById("justifyLeft").addEventListener("click", function () {
  applyFormatting("justifyLeft");
});

document.getElementById("justifyRight").addEventListener("click", function () {
  applyFormatting("justifyRight");
});

document.getElementById("justifyCenter").addEventListener("click", function () {
  applyFormatting("justifyCenter");
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

document.getElementById("sans").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = "sans";
});

document.getElementById("sans-serif").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = "sans-serif";
});

document.getElementById("lato").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = "lato";
});

document.getElementById("anonymous-pro").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = 'Anonymous Pro';
});

document.getElementById("roboto").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = 'Roboto';
});

document.getElementById("montserrat").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = 'Montserrat';
});

document.getElementById("poppins").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = 'Poppins';
});

document.getElementById("raleway").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = 'Raleway';
});

document.getElementById("nuinto").addEventListener("click", function() {
  document.getElementById("game-column").style.fontFamily = 'Nuinto';
});
