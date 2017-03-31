/**
	double up game caculator flow:
 	1.click the card that system gaved.
  2.program will caculate high and low win rate.
  3.back to game, click your choise.
  4.if you win, click next card system showing, and loop 2~4,
    or lose, then end the game.
  5.if you want go next round then click new round.
 */
//extention method that handle round number to second digit
(function () {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }

})();

//4suit * 13 number
var defaultCardPool = [
  [2, 2, 2, 2],
  [3, 3, 3, 3],
  [4, 4, 4, 4],
  [5, 5, 5, 5],
  [6, 6, 6, 6],
  [7, 7, 7, 7],
  [8, 8, 8, 8],
  [9, 9, 9, 9],
  [10, 10, 10, 10],
  [11, 11, 11, 11],
  [12, 12, 12, 12],
  [13, 13, 13, 13],
  [14, 14, 14, 14]
];

var nowCard;
var roundQueue = [];
var gameCardPool = [];

$(document).ready(function () {
    $('body').bootstrapMaterialDesign();
    //init card pool
    initCardPool();

    //init reset button event
    $("#btnReset").click(resetGame);

    //start game
    startGame();
});

function getSuitString(num) {
    switch (num) {
        case (0):
            return "♣";
        case (1):
            return "♦";
        case (2):
            return "♥";
        case (3):
            return "♠";
    }
}

function getCardNumString(num) {
    if (num > 1 && num < 11)
        return num;
    else {
        if (num === 11)
            return "J";
        if (num === 12)
            return "Q";
        if (num === 13)
            return "K";
        if (num === 14)
            return "A";
    }
}

function initCardPool() {
    var divCardPool = $("#CardPool");
    var tmp = "";
    for (var i = 0; i < 4; i++) {
        tmp += "<div class='CardPoolLine'>";
        for (var j = 1; j < 14; j++) {
            var suitstr = getSuitString(i);
            var numstr = getCardNumString(j + 1);
            tmp += "<div class='CardPoolCard' data-cardsuit='" + i + "' data-cardnum='" + (j + 1) + "'>" +
              "<label class='CardSuit'>" + suitstr + "</label>" +
              "<label class='CardNumber'>" + numstr + "</label>" +
              "</div>";
        }
        tmp += "</div>";
    }
    divCardPool.append(tmp);

    $(".CardPoolCard").click(function () {
        cardClickEvent($(this));
    });

}

function cardClickEvent(elm) {
    //change css
    $(elm).toggleClass("selected");

    //click card handle
    var cardnum = $(elm).attr("data-cardnum");
    // var cardsuit=$(this).attr("data-cardsuit");
    inputCard(cardnum); //suit doesnt matter in double up,so no need input card suit

    //remove click
    $(elm).off("click");
}

function startGame() {
    //clone card pool, also, reset pool.
    gameCardPool = JSON.parse(JSON.stringify(defaultCardPool));

    //reset round text
    updateRoundText();
}

function inputCard(cardnum) {
    //change sys msg
    sysmsg_caculating();

    //add round count
    addRound(cardnum);

    //remove selected card from game card pool
    removeSelectedCard(cardnum);

    //caculate high low rate
    var rate = caculateRate(cardnum);

    //update rate text
    updateRateText(rate);

    //update round text
    updateRoundText();

    //change sys msg
    sysmsg_waitingNextRound();
}

function sysmsg_caculating() {
    $("#labelSystemMessage").text("Caculating...");
}

function sysmsg_waitingNextRound() {
    $("#labelSystemMessage").text("pick next card");
}

function sysmsg_waitingFirstCard() {
    $("#labelSystemMessage").text("pick first card");
}

function removeSelectedCard(cardnum) {
    //remove array's last element
    gameCardPool[cardnum - 2].length -= 1;
}

function caculateRate(cardnum) {
    //high rate=number of higher then showhand/number of total avaliable card
    //low rate=number of lower then showhand/number of total avaliable card
    //draw rate=number of same to showhand/number of total avaliable card
    var totalCount = 0;
    var higherCount = 0;
    var lowerCount = 0;
    var drawCount = 0;

    var cardnumIndex = cardnum - 2; //2=0

    for (var i = 0; i < 13; i++) {
        totalCount += gameCardPool[i].length;
        if (i < cardnumIndex)
            lowerCount += gameCardPool[i].length;
        if (i === cardnumIndex)
            drawCount += gameCardPool[i].length;
        if (i > cardnumIndex)
            higherCount += gameCardPool[i].length;
    }

    var highRate = (higherCount / totalCount) * 100;
    var drawRate = (drawCount / totalCount) * 100;
    var lowRate = (lowerCount / totalCount) * 100;
    return {
        highRate: Math.round10(highRate, -1),
        drawRate: Math.round10(drawRate, -1),
        lowRate: Math.round10(lowRate, -1)
    };
}

function updateRateText(rate) {
    $("#lblHighRate").text(rate.highRate + "%");
    $("#lblDrawRate").text(rate.drawRate + "%");
    $("#lblLowRate").text(rate.lowRate + "%");
}

function addRound(cardnum) {
    roundQueue.push(cardnum);
}

function updateRoundText() {
    $("#lblRound").text(roundQueue.length);
}

function resetGame() {
    //clear selected card
    $(".CardPoolCard.selected").removeClass("selected");

    //rebind click event
    $(".CardPoolCard").off("click").click(function () {
        cardClickEvent($(this));
    });

    //clear round queue
    roundQueue = [];

    //update rate text
    updateRateText({ highRate: 0, drawRate: 0, lowRate: 0 });

    sysmsg_waitingFirstCard();

    startGame();
}