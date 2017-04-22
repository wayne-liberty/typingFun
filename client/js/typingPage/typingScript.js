// require('../css/font-files/firasans-extralightitalic-webfont.woff2');
// require('../css/font-files/firasans-extralightitalic-webfont.woff');
function typeScript() {
    let text = $('.passin').text();
    let textArray = text.split('');
    let domArr = [];
    let curPos = 0;
    let unCorCount = 0;
    let totalCount = 0;

    let startTime = new Date().getTime();
    let typingStarted = false;
    let intervalID;
    let powerMode = true;
    fillStage();
    setFirstChar();
    onKeyPressed();
    backSpaceKeyHandler();
    moveCaret();
    // setInterval(wheelEvent, 1);
    $(document).on('scroll', wheelEvent);

    let length = domArr.length;

    function setFirstChar() {
        $(domArr[0]).addClass('curChar');
    }

    function startWpfCal() {
        intervalID = setInterval(updateWpf, 1000);
        typingStarted = true;
    }

    function moveCaret() {
        const next = $(domArr[curPos]);
        const xOffset = next[0].getBoundingClientRect().left;
        const yOffset = next[0].getBoundingClientRect().top;
        // const newWidth = next.width();
        const newWidth = -1;
        // console.log(newWidth);
        const newHeight = next.height();
        $('#caret').animate({
            "left": xOffset,
            "top": yOffset,
            width: newWidth + 4,
            height: newHeight - 4
        }, 50);
        // console.log(xOffset + " : " + yOffset);
    }

    function forwardCaret() {
        $(domArr[++curPos]).addClass('curChar');
        $(domArr[curPos - 1]).removeClass('curChar');
        moveCaret();
    }

    function backCaret() {
        if (curPos == 0)
            return;
        $(domArr[curPos]).removeClass('curChar correct incorrect fadeBgc');
        $(domArr[--curPos]).removeClass('correct incorrect fadeBgc');
        $(domArr[curPos].addClass('curChar'));
        moveCaret();
    }

    function isFinished() {
        if (curPos == length) {
            alert('finished');
            clearInterval(intervalID);
        }
    }

    function onKeyPressed() {
        $(document).on("keypress", function (event) {
            // prevent browser shotcut
            // alert(event.hasOwnProperty());

            event.preventDefault();
            if (!typingStarted) {
                startWpfCal();
            }
            ++totalCount;
            check(String.fromCharCode(event.charCode));
            forwardCaret();
            isFinished();
        });
    }

    function backSpaceKeyHandler() {
        $(document).on("keydown", function (key) {
            // alert(key.keyCode);
            // 8
            if (key.keyCode == 8) {
                backCaret();
            }
        });
    }

    function updateWpf() {

        let elapsed = Math.floor((new Date().getTime() - startTime) / 100) / 10; // why not /1000
        // alert(elapsed);
        let wpf = Math.floor((totalCount / 5 - unCorCount) / (elapsed / 60));
        if (wpf < 0) {
            wpf = 0;
        }

        $('#wpf').text(Math.floor((wpf)).toString());
    }

    function fillStage() {
        const $stage = $('#stage');
        // const caret = $('#caret');
        // $stage.empty();
        // $stage.append(caret);
        for (let char in textArray) {
            let $charSpan = $('<span>', {
                class: 'char',
                text: textArray[char],
            });
            $stage.append($charSpan);
            domArr.push($charSpan);
        }
    }

    function correctChar() {
        domArr[curPos].addClass('correct fadeBgc');
    }

    function wrongChar() {
        ++unCorCount;
        domArr[curPos].addClass('incorrect');
    }

    function check(pressed) {
        // alert($(domArr[curPos]).text());
        if (pressed == $(domArr[curPos]).text()) {
            correctChar();
            if (powerMode)
                app.spawnParticles();
        } else {
            wrongChar();
        }
    }

    function wheelEvent() {
        $(document).on('scroll', function () {

        });
        const next = $(domArr[curPos]);
        const yOffset = next[0].getBoundingClientRect().top;
        $('#caret').css({top: yOffset});
        console.log($('#stage').scrollTop());
    }
}
module.exports = typeScript;