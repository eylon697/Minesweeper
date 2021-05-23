'use strict'
console.log('Minesweeper');

var elManul = document.querySelector('.manual')
var gElms = document.getElementById('ms')
var gElmm = document.getElementById('mm')
var gElmh = document.getElementById('mh')

var SAFE_CLICK_IMG = '<img src="img/safeClick.png" onclick="safeClick()">'

var BESTSCORE_EMOJI = '🏆'
var GAMEOVER_EMOJI = '👻'
var VICTORY_EMOJI = '🤩'
var START_EMOJI = '⛳'

var SAFE_CLICKS = 3
var ALERT_MINE = 2
var HINTS = 3
var LIVES = 3

var MINE = '💣'
var FLAG = '🚩'
var EMPTY = ''

var gIsManualActive
var gIsManualGameIsOn
var gHintsLocations
var gTtimeInterval
var gActiveHintEl
var gUndosStack
var gBoard
var gLevel
var gGame

var gMint = 0;
var gSec = 0;
var gHur = 0;

function init(level, board) {
    setLevel(level)
    if (!board) {
        buildBoard()
        resetTime()
    }
    resetGame()
    renderHints()
    renderBestScore()
    renderLives(LIVES)
    renderSafeClicks()
    renderBoard(gBoard)
    renderEmoji(START_EMOJI)
    console.log('GAME START!');
}

function setLevel(level) {
    gLevel = level
}

function resetGame() {
    gUndosStack = []
    gHintsLocations = []
    gGame = {
        isOn: true,
        hints: HINTS,
        lives: LIVES,
        secsPassed: 0,
        shownCount: 0,
        markedCount: 0,
        isActiveHint: false,
        safeClicks: SAFE_CLICKS
    }
}

function buildBoard() {
    gBoard = []
    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = {
                isMine: false,
                isShown: false,
                isMarked: false,
                minesAroundCount: 0
            }
        }
    }
}

function setMines(board, pos) {
    var minesLocations = getRandomLocations(gLevel, pos)
    for (var i = 0; i < minesLocations.length; i++) {
        var loc = minesLocations[i]
        board[loc.i][loc.j].isMine = true
    }
    setMinesNegsCount()
    renderBoard(board)
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            gBoard[i][j].minesAroundCount = getNegs({ i, j })
        }
    }
}

function getNegs(pos) {
    var negs = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || isExist({ i, j }, [pos])) continue
            if (gBoard[i][j].isMine) negs++
        }
    }
    return negs
}

function renderBoard(board) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            var cellInnerText = EMPTY
            if (cell.isMine) cellInnerText = MINE
            else if (cell.minesAroundCount) cellInnerText = cell.minesAroundCount
            strHTML += getCellStrHtml(i, j, cellInnerText)
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    document.querySelector('.board-container').innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
    if (gIsManualActive) return setMineManual(elCell, i, j)
    var cell = gBoard[i][j]
    if (!gGame.isOn || cell.isMarked || cell.isShown) return
    updateUndoStack()
    if (!gGame.shownCount && gGame.hints === HINTS && !gIsManualGameIsOn) {
        setMines(gBoard, { i, j })
        startTime()
    }
    if (gGame.isActiveHint) return hint({ i, j })
    if (cell.isMine) removeLive(elCell)
    else if (cell.minesAroundCount) showCell(cell, { i, j })
    else expandShown(gBoard, { i, j })
    checkGameOver()

}

function showCell(cell, pos) {
    console.log('SHOWING', pos);
    cell.isShown = true
    gGame.shownCount++;
    document.getElementById(getCellId(pos)).classList.add('shown')
    new Audio('sounds/click.wav').play()
}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine && !cell.isMarked || !cell.isMine && !cell.isShown) return
        }
    }
    victory()
}

function markCell(elCell) {
    var cell = getCellObj(elCell)
    if (cell.isShown || !gGame.isOn || !gGame.shownCount) return
    var elFlagSpan = getFlagSpanEl(elCell)
    if (!cell.isMarked) flag(elCell, elFlagSpan)
    else unFlag(elCell, elFlagSpan)
    new Audio('sounds/step.mp3').play()
    checkGameOver()
    updateUndoStack()
}

function gameOver(elCell) {
    new Audio('sounds/game-over.mp3').play()
    stopGame()
    showMines()
    removeLives()
    activateMine(elCell)
    renderEmoji(GAMEOVER_EMOJI)
    console.log('GAME OVER!');
}

function victory() {
    new Audio('sounds/victory.mp3').play()
    renderEmoji(VICTORY_EMOJI)
    console.log('VICTORY!')
    stopGame()
    storeScore()
}