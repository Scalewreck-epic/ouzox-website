function applyFormatting(command) {
    document.execCommand(command, false, null);
};

function applyHeader(level) {
    const headerCommand = 'h' + level;
    document.execCommand('formatBlock', false, headerCommand);
};

function createLink() {
    const url = prompt("Enter the URL:");
    const linkText = prompt("Enter the link text:");
  
    if (url && linkText) {
        const link = "<a href='" + url + "' target='_blank'>" + linkText + "</a>";
      document.execCommand("insertHTML", false, link);
    };
};

document.getElementById("bold").addEventListener("click", function() {
    applyFormatting("bold");
});

document.getElementById("italic").addEventListener("click", function() {
    applyFormatting("italic");
});

document.getElementById("underline").addEventListener("click", function() {
    applyFormatting("underline");
});

document.getElementById("strikethrough").addEventListener("click", function() {
    applyFormatting("strikethrough");
});

document.getElementById("link").addEventListener("click", function() {
    createLink();
});

document.getElementById("insertUnorderedList").addEventListener("click", function() {
    applyFormatting("insertUnorderedList");
});

document.getElementById("insertOrderedList").addEventListener("click", function() {
    applyFormatting("insertOrderedList");
});

document.getElementById("justifyLeft").addEventListener("click", function() {
    applyFormatting("justifyLeft");
});

document.getElementById("justifyRight").addEventListener("click", function() {
    applyFormatting("justifyRight");
});

document.getElementById("justifyCenter").addEventListener("click", function() {
    applyFormatting("justifyCenter");
});

document.getElementById("1").addEventListener("click", function() {
    applyHeader(1);
});

document.getElementById("2").addEventListener("click", function() {
    applyHeader(2);
});

document.getElementById("3").addEventListener("click", function() {
    applyHeader(3);
});

document.getElementById("4").addEventListener("click", function() {
    applyHeader(4);
});
