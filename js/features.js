'use strict'

document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
}, false);

function getCellColorClass(cellInnerText) {
    if (cellInnerText === EMPTY || cellInnerText === MINE) return ''
    var numsName = ['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
    return ' ' + numsName[cellInnerText]
}

function resetTime() {
    stopTime()
    gMint = 0;
    gSec = 0;
    gHur = 0;
    gElms.innerHTML = '00'
    gElmm.innerHTML = '00'
}

function startTime() {
    var z = '';
    z = (gSec < 10) ? '0' : '';
    gElms.innerHTML = z + gSec;
    gSec++;
    if (gSec == 60) {
        gSec = 0;
        z = (gMint < 10) ? '0' : '';
        gElmm.innerHTML = z + gMint;
        gMint++;
        if (gMint == 60) {
            gMint = 0;
            z = (gHur < 10) ? '0' : '';
            gElmh.innerHTML = z + gHur;
            gHur++;
        }
    }
    gTtimeInterval = setTimeout(startTime, 1000);
}

function stopTime() {
    clearInterval(gTtimeInterval);
}

function renderLives(lives) {
    var livesEl = document.querySelector('.lives')
    livesEl.innerHTML = ''
    for (var i = 0; i < lives; i++)
        setTimeout(function() { livesEl.innerHTML += '<img src="img/heart.png">' }, i * 1)
}

function alertMine(elCell) {
    for (var i = 1; i <= ALERT_MINE * 2; i++)
        setTimeout(function() { elCell.classList.toggle('alert') }, i * 100)
}

function removeLive(elCell) {
    if (gGame.lives === 1) return gameOver(elCell)
    new Audio('../sounds/lose.wav').play()
    alertMine(elCell)
    renderLives(--gGame.lives)
}

function removeLives() {
    document.querySelector('.lives').innerHTML = ''
}

function renderHints() {
    var hinntsStrHtml = ''
    for (var i = 0; i < HINTS; i++) {
        hinntsStrHtml += '<img src="img/hint.png" onclick="hintClicked(this)">'
    }
    document.querySelector('.hints-container').innerHTML = hinntsStrHtml
}

function hintClicked(elImg) {
    if (!gGame.isOn) return
    if (elImg === gActiveHintEl) {
        console.log('Cancel hint');
        gGame.isActiveHint = false
        gActiveHintEl = null
        elImg.src = 'img/hint.png'
        return
    }
    if (gGame.isActiveHint) return console.error('OTHER HINT IS ACTIVE');
    if (!gGame.hints || elImg.classList.contains('used'))
        return console.error('USED HINT');
    console.log('Hint')
    gActiveHintEl = elImg
    gGame.isActiveHint = true
    elImg.src = 'img/useHint.png'
}

function hint(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var cell = gBoard[i][j]
            if (cell.isShown || cell.isMarked) continue
            hintCell({ i, j })
        }
    }
    gGame.hints--;
    gActiveHintEl.classList.add('used')
    gActiveHintEl = null
    gGame.isActiveHint = false
    setTimeout(coverHints, 1000)
}

function coverHints() {
    console.log('COVER');
    for (var i = 0; i < gHintsLocations.length; i++) {
        var loc = gHintsLocations[i]
        gBoard[loc.i][loc.j].isHint = false
        document.getElementById(getCellId(loc)).classList.remove('hint')
    }
    gGame.isActiveHint = false
}

function hintCell(pos) {
    console.log('HINT', pos);
    var cell = gBoard[pos.i][pos.j]
    cell.isHint = true
    gHintsLocations.push(pos)
    document.getElementById(getCellId(pos)).classList.add('hint')
}

function expandShown(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            var cell = board[i][j]
            if (cell.isShown || cell.isMarked) continue
            showCell(cell, { i, j })
            if (!cell.minesAroundCount) expandShown(board, { i, j })
        }
    }
}

function renderEmoji(emoji) {
    document.querySelector('.emoji').innerHTML = `<span class="emoji-span" onclick = "emojiClicked({size:${gLevel.size},mines:${gLevel.mines}})">${emoji}</span>`
}

function emojiClicked(level) {
    if (gIsManualActive) return startManualGame(level)
    init(level)
}

function storeScore() {
    var curScore = getCurScoreValue()
    var bestScore = getBestScoreValue()
    if (!bestScore || curScore < bestScore) updateScore()
    renderBestScore()
}

function getCurScoreValue() {
    return (+gElmm.innerHTML) * 60 + (+gElms.innerHTML)
}

function getBestScoreValue() {
    return +getBestScoreSecStr() + (+getBestScoreMinStr() * 60)
}

function getBestScoreSecStr() {
    return localStorage.getItem('bestScoreSec' + gLevel.size);
}

function getBestScoreMinStr() {
    return localStorage.getItem('bestScoreMin' + gLevel.size);
}

function updateScore() {
    localStorage.setItem('bestScoreMin' + gLevel.size, gElmm.innerHTML);
    localStorage.setItem('bestScoreSec' + gLevel.size, gElms.innerHTML);
    renderEmoji(BESTSCORE_EMOJI)
    console.log('BEST SCORE!')
}

function renderBestScore() {
    document.querySelector('.best-min-span').innerText = (getBestScoreValue()) ? getBestScoreMinStr() : '00'
    document.querySelector('.best-mid-span').innerText = ':'
    document.querySelector('.best-sec-span').innerText = (getBestScoreValue()) ? getBestScoreSecStr() : '00'
}

function renderSafeClicks() {
    var strHTML = ''
    for (var i = 0; i < gGame.safeClicks; i++)
        strHTML += SAFE_CLICK_IMG
    document.querySelector('.safe-clicks-container').innerHTML = strHTML
}

function safeClick() {
    if (!gGame.shownCount || !gGame.isOn) return
    console.log('hi');
    gGame.safeClicks--;
    var emptyLocations = getEmptyCoverdLocations()
    var loc = emptyLocations[getRandomInt(0, emptyLocations.length)]
    signSafeClick(loc)
    setTimeout(removeSafeClickCell, 1500)
    renderSafeClicks()
}

function signSafeClick(loc) {
    console.log('SIGN SAFE-CLICK', loc);
    var elCell = document.getElementById(getCellId(loc))
    elCell.classList.add('safe')
}

function removeSafeClickCell() {
    console.log('REMOVE SAFE-CLICK SIGN');
    var elSafe = document.querySelector('.safe')
    elSafe.classList.remove('safe')
}

function updateUndoStack() {
    gUndosStack.push({
        board: getBoardCopy(gBoard),
        game: getCopy(gGame),
    })
}

function getBoardCopy(board) {
    var newBoard = []
    for (var i = 0; i < board.length; i++) {
        newBoard[i] = []
        for (var j = 0; j < board[i].length; j++) {
            newBoard[i][j] = getCopy(board[i][j])
        }
    }
    return newBoard
}

function getCopy(source) {
    var copy = {}
    for (var property in source)
        copy[property] = source[property]
    return copy
}

function undo() {
    if (!gGame.isOn || !gUndosStack.length) return
    if (gUndosStack.length === 1) resetTime()
    var lastStepObj = gUndosStack.pop()
    gGame = lastStepObj.game
    gBoard = lastStepObj.board
    renderBoard(gBoard)
    renderLives(gGame.lives)
    renderHints()
    gGame.isActiveHint = false
    renderSafeClicks()
}

function manualClicked(level) {
    console.log('SET MINES MANUALY');
    init(level)
    stopTime()
    toggleShowCells()
    gIsManualActive = true
    elManul.innerHTML = '<span class="start" onclick="startManualGame(gLevel)">Start</span>'
}

function startManualGame(level) {
    console.log('MANUALY GAME IS START');
    toggleShowCells()
    setMinesNegsCount()
    renderBoard(gBoard)
    gIsManualActive = false
    gIsManualGameIsOn = true
    init(level, gBoard)
    startTime()
    elManul.innerHTML = '<span onclick="manualClicked(gLevel)">Manual</span>'
}

function setMineManual(elCell, i, j) {

    elCell.innerText = MINE
    gBoard[i][j].isMine = true
}