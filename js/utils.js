'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomLocations(level, pos) {
    var locations = []
    while (locations.length < level.mines) {
        var loc = { i: getRandomInt(0, level.size), j: getRandomInt(0, level.size) }
        if (!isExist(loc, locations) && !isExist(loc, [pos])) locations.push(loc)
    }
    return locations
}

function isExist(loc, locations) {
    for (var i = 0; i < locations.length; i++) {
        var curLoc = locations[i]
        if (loc.i === curLoc.i && loc.j === curLoc.j) return true
    }
    return false
}

function getCellId(loc) {
    return 'cell-' + loc.i + '-' + loc.j
}

function getCellCoord(elCell) {
    var splits = elCell.id.split('-')
    return { i: splits[1], j: splits[2] }
}

function getCellObj(elCell) {
    var coord = getCellCoord(elCell)
    return gBoard[coord.i][coord.j]
}

function getFlagSpanEl(elCell) {
    var loc = getCellCoord(elCell)
    return document.querySelector(`#cell-${loc.i}-${loc.j} .flag`)
}

function showMines() {
    console.log('Showing all mines');
    var mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        if (!getCellObj(mines[i]).isMarked) mines[i].classList.add('shown')
    }
}

function activateMine(elCell) {
    console.log('Activate', getCellCoord(elCell));
    elCell.classList.add('activated')
}

function stopGame() {
    gGame.isOn = false
    stopTime()
}

function unFlag(elCell, flagSpan) {
    console.log('UNMARKING', getCellCoord(elCell));
    getCellObj(elCell).isMarked = false
    flagSpan.innerHTML = EMPTY
    gGame.markedCount--
}

function flag(elCell, flagSpan) {
    console.log('MARKING', getCellCoord(elCell));
    getCellObj(elCell).isMarked = true
    flagSpan.innerHTML = FLAG
    gGame.markedCount++
}

function getCellStrHtml(i, j, cellInnerText) {
    var cellId = getCellId({ i, j })
    var className = getDynamicClassName(i, j, cellInnerText)
    var strHtml = `<td id="${cellId}" class="${className}"onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="markCell(this)"><span class="flag"></span><span class="content">${cellInnerText}</span></td>`
    return strHtml
}

function getDynamicClassName(i, j, cellInnerText) {
    var cell = gBoard[i][j]
    var className = ((i + j) % 2 === 0) ? 'bright' : 'dark'
    if (cell.isMine) className += ' mine'
    if (gLevel.size === 4) className += ' begginer'
    else if (gLevel.size === 8) className += ' medium'
    else if (gLevel.size === 12) className += ' expert'
    if (cell.isShown) className += ' shown'
    className += getCellColorClass(cellInnerText)
    return className
}

function isShown(elCell) {
    return getCellObj(elCell).isShown
}

function getEmptyCoverdLocations() {
    var locations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cel = gBoard[i][j]
            if (!cel.isMine && !cel.isShown) locations.push({ i, j })
        }
    }
    return locations
}

function addClass(elCell, className) {
    elCell.classList.add(className)
}

function toggleShowCells() {
    var elAllCells = document.querySelectorAll('td')
    for (var i = 0; i < elAllCells.length; i++)
        elAllCells[i].classList.toggle('shown')
}