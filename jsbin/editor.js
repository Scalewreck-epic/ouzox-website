function applyFormatting(command) {
    document.execCommand(command, false, null);
};

function applyHeader(level) {
    var headerCommand = 'h' + level;
    document.execCommand('formatBlock', false, headerCommand);
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