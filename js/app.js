'use strict'

// Global variables

var gHint = false
const WORRIEDSMILEY = `worriedSmiley.jpg`
const SADLEY = `sadley.jpg`
const SMILEY = `simley.jpg`
const MARKED = `flag.jpg`
const MINE = `landMine.jpg`
const EMPTY = ''
var gStartGameTime
var gTimerInterval
var gBoard = []
var gLevel = {
    SIZE: 4,
    MINES: 3
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    safeClicks: 3,
    hints: 3
}

// Functions 

function initGame() {
    gBoard = buildBoard(gLevel.SIZE) //basic board with objects inside each cell
    positionMines()         // randomly puts mines in some of the cells object (cell.isMine = true)
    resetGame()           // zeroes all the global variables
    updateBoard()          // updates the model matrix about neighboring mines
    renderBoard(gBoard)    // renders covered board
}

// Create square mat
function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

// puts mines randomly in the board
function positionMines() {
    var emptyCells = getNumsArray(gBoard.length ** 2 - 1)
    for (var i = 0; i < gLevel.MINES; i++) {
        var num = drawRandNum(emptyCells)
        var posI = Math.floor(num / gBoard.length)
        var posJ = num % gBoard.length
        var pos = { i: posI, j: posJ }
        gBoard[posI][posJ].isMine = true
    }
}

//UPDATE THE MATRIX OF THE MODEL WITH HOW MANY MINES ARE AROUND EACH CELL
function updateBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = countNegs(i, j, gBoard)
        }
    }
}

// Count Neighbors - how many mines are around the cell
function countNegs(row, col, gBoard) {
    var negsCount = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (i === row && j === col) continue;
            if (gBoard[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            var image = ``
            if (cell.isShown) { // if the cell was uncovered before or if it happened right now in this left click
                if (cell.isMarked) { // if it's marked, render a flag and that's all.
                    image = `<img src="img/${MARKED}" >`
                } else if (cell.isMine) {  // but if it is not flagged, does it have a mine? if so , then render a
                    image = `<img src="img/${MINE}" >`
                } else if (cell.minesAroundCount) {
                    image = cell.minesAroundCount
                } else {
                    image = EMPTY
                }
            }
            if (cell.isMarked) { // if it's marked, render a flag and that's all.
                image = `<img src="img/${MARKED}" >`
            }
            var cellState = (cell.isMine) ? 'mine ' : ''
            cellState += (cell.isShown) ? 'shown ' : ''
            cellState += (cell.isMarked) ? 'marked ' : ''
            cellState += (cell.hasOwnProperty('flash')) ? 'flash ' : ''
            strHTML += `
            <td data-i=${i} data-j=${j} onclick="cellClicked(this, ${i}, ${j})" class="${cellState}">${image}</td>`
        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Resets all the global variables
function resetGame() {
    gGame.markedCount = 0
    gGame.shownCount = 0
    gGame.lives = 3
    gGame.safeClicks = 3
    gGame.safeClicks = 3
    gGame.hints = 3
    gHint = false
    renderLives()
    showFlagsLeft()
}

// left click event (exposing the cell)
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {  // if it is the first click - start the game....
        gGame.isOn = true
        resetGame()
        startTimer()
    }
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return // if it is already marked or shown nothing to do here
    if (gHint) { // if the hint state is ON show the cell and negs for few milisecs
        showHint(i, j, true)
        gGame.hints--
        setTimeout(showHint, 1000, i, j, false)
        gHint = false
        return
    }
    gBoard[i][j].isShown = true
    gGame.shownCount++
    if ((gGame.shownCount === 1) && gBoard[i][j].isMine) { // if it's the first click of the 
        // game (not counting for flags) 
        // and if there is a mine move it
        for (var k = 0; k < gBoard.length; k++) {
            for (var l = 0; l < gBoard.length; l++) {
                if (!(gBoard[k][l].isMine) && !(gBoard[k][l].isShown) &&
                    isFarEnough(k, l, i, j)) {
                    gBoard[k][l].isMine = true
                    gBoard[i][j].isMine = false
                    updateBoard()
                    k = gBoard.length + 1 // in order to get off the first loop
                    break
                }
            }
        }
    }
    if (gBoard[i][j].isMine) { //if it is a mine
        gGame.lives--
        playSound('media/explosion.mp3')
        if (gGame.lives === 0) {
            showMines()
            gameOver('lose')
        }
        renderLives()

        renderBoard(gBoard)
    } else if (gBoard[i][j].minesAroundCount) {     //if there are neighbours  

        renderBoard(gBoard)
        isGameOver()
    } else if (!gBoard[i][j].minesAroundCount) { // if it doesn't have neighbours  

        renderBoard(gBoard)
        showNegs(i, j)
        isGameOver()
    }
    if (gGame.shownCount === gBoard.length ** 2) gameOver('win')
}

// checks that the vertical or horizntal distance is bigger than 1 cell, used to locate the first click mine
function isFarEnough(row1, col1, row2, col2) {
    if (Math.abs(row1 - row2) > 1) return true
    if (Math.abs(col1 - col2) > 1) return true
    return false
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true
            }
        }
    }
    renderBoard(gBoard)
}

// right click event (preventing from right click to show the context menu, and setting / unsetting a flag) 
const noContext = document.querySelector('.board');
noContext.addEventListener('contextmenu', e => {
    e.preventDefault()
    if (!gGame.isOn) {          // if it's the first click in the game the game starts
        gGame.isOn = true
        resetGame()
        startTimer()
    }
    // if the element.path still does'nt have the img in it (it is 9, else - 10)  
    if (e.path.length === 9) {
        var row = e.path[0].dataset.i
        var col = e.path[0].dataset.j
    } else {
        var row = e.path[1].dataset.i
        var col = e.path[1].dataset.j
    }
    var cell = gBoard[row][col]
    if (cell.isShown) return
    if (cell.isMarked) { // if the cell is already marked un-flag it !!!
        cell.isMarked = false
        gGame.markedCount--
    } else if (gGame.markedCount < gLevel.MINES - (3 - gGame.lives)) {
        cell.isMarked = true
        gGame.markedCount++
    }
    renderBoard(gBoard)
    showFlagsLeft()
    isGameOver()
})


// TODO:
// SMILEY
// RECORDING RECORDS
// RECORDING STAGES AND UNDO-ING THEM
// BUT FIRST : THE BASIC FUNCTIONS ABOVE


// STILL NEED TO THINK ABOUT IT - i am not happy with it... something with the counts of flags and shown...
function isGameOver() {
    if (gGame.markedCount + gGame.shownCount === gBoard.length ** 2) {
        // console.log('gGame.markedCount: ',gGame.markedCount)
        // console.log('gGame.shownCount: ',gGame.shownCount)
        // console.log('3-gGmae.lives: ',3-gGame.lives)
        // console.log('gBoard.length**2: ',gBoard.length**2)      
        gameOver('win')
        return true
    }
    return false
}

// called from button - runs showHint to expose the cells
function getHint() {  //WORKS
    if (!gGame.isOn || gGame.hints <= 0) return
    gHint = true
}

// exposes cells around the clicked cell for 1 sec (defined in 'rightCellClicked function - which is not a function HEHEH)
function showHint(row, col, show = true) { //ALMOST WORKS - but cells that were already shown, become unShown - FIX!
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            if (show) {
                gBoard[i][j].isShown = true
                renderBoard(gBoard)
            } else {
                gBoard[i][j].isShown = false
                renderBoard(gBoard)
            }
        }
    }
    gHint = false
}

function safeClick() {
    if (!gGame.isOn || !gGame.safeClicks) return // if game did not start (first cellClicked) or no more safe clicks left
    // find randoM number in the matrix, check if the cell is not shown and not marked, and mark it with flashing color
    var emptyCells = getNumsArray(gBoard.length ** 2 - 1)
    for (var i = 0; i < gLevel.MINES; i++) {
        var num = drawRandNum(emptyCells)
        var posI = Math.floor(num / gBoard.length)
        var posJ = num % gBoard.length
        // if it's a safe cell, then flash it for a sec
        if (!gBoard[posI][posJ].isMine && !gBoard[posI][posJ].isShown && !gBoard[posI][posJ].isMarked) {
            var getInterval = setInterval(flashCell, 100, posI, posJ)
            setTimeout(clearInterval, 1000, getInterval)
            gGame.safeClicks--
            return
        } else continue
    }
}

function flashCell(row, col) {
    // if it does'nt have the flash key (first time, or if it is in true, than make it false)
    if (!gBoard[row][col].hasOwnProperty('flash')) {
        gBoard[row][col].flash = true
        renderBoard(gBoard)
    } else {
        delete gBoard[row][col].flash
        renderBoard(gBoard)
    }
}

// STILL NEED TO THINK ABOUT HOW TO MAKE IT RECURSIVE, but it is functioning basically
// exposes the cells around the selected cell
function showNegs(row, col) {
    if (gBoard[row][col].minesAroundCount > 0) return
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            if (i === row && j === col) continue;
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                gGame.shownCount++
                renderBoard(gBoard)
            }
        }
    }
    return
}

// renders on screen how many MINES are left 
function showFlagsLeft() {
    var elFlagsLeft = document.querySelector('.flagsLeftIndicator span')
    var flagsLeft = gLevel.MINES - gGame.markedCount
    elFlagsLeft.innerText = flagsLeft
}

// timer functions // STILL NEED TO THINK ABOUT HOW TO MAKE IT MORE EFFICIENT

function startTimer() {
    if (gGame.isOn) {
        gStartGameTime = Date.now()                 // timer
        gTimerInterval = setInterval(runTimer, 500)
    }
}

// creates the timer  
function runTimer() {
    var totalGameTime = getGameTime()
    var seconds = Math.floor(totalGameTime / 1000)
    var minutes = parseInt(seconds / 60)
    if (minutes < 1) {
        minutes = '00'
    } else if (minutes < 10) {
        minutes = `0${minutes}`
    }
    if (seconds < 10) {
        seconds = `0${seconds}`
    } else if (seconds > 59) {
        seconds = (seconds % 60)
        seconds = (seconds < 10) ? `0${seconds}` : seconds
    }
    var totalGameTimeString = `${minutes}:${seconds}`
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = totalGameTimeString
}

function resetTimer() {
    var zeroTimer = `00:00`
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = zeroTimer
    gGame.isOn = false
    clearInterval(gTimerInterval)
}

// is being used for the timer to calculate the current time
function getGameTime() {
    var endGameTime = Date.now()
    var totalGameTime = endGameTime - gStartGameTime // in miliseconds
    return totalGameTime // in miliseconds
}


// shows the right modal (win / lose) and also presents a restart button
function gameOver(state) {
    if (state === 'win') {
        showModal('win')
        playSound('media/win.mp3')

    } else {
        showModal('lose')
        playSound('media/lose.mp3')
    }
    clearInterval(gTimerInterval)
    gGame.isOn = false
}

function playSound(file) {
    var audio = new Audio(file)
    audio.play()
}

// Get an array of numbers (from 0 to num, ordered) 
function getNumsArray(num) {
    var nums = []
    for (var i = 0; i <= num; i++) {
        nums.push(i);
    }
    return nums
}

// Draw a random number of an array - and delete it from the array.     *** being used ****
function drawRandNum(array) {
    var idx = getRandomInt(0, array.length)
    var num = array[idx]
    array.splice(idx, 1)
    return num
}

//The maximum is exclusive and the minimum is inclusive
// get Random number
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function showModal(state) {
    var elModal = document.querySelector('.modal')
    if (state === 'win') {
        elModal.innerHTML = `<h1>YEYYYY YOU WON THE GAME</h1><button onClick="restartGame()">RESTART GAME</button>`
    } else {
        elModal.innerHTML = `<h1>OUCHHH, YOU LOST THE GAME</h1><button onClick="restartGame()">RESTART GAME</button>`
    }
    elModal.style.visibility = 'visible'
}

function hideModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.visibility = 'hidden'
}

function restartGame(size = gLevel.SIZE) {

    hideModal()
    resetTimer()
    gLevel.SIZE = size
    switch (size) {
        case 4:
            gLevel.MINES = 2
            break
        case 8:
            gLevel.MINES = 12
            break
        case 12:
            gLevel.MINES = 30
    }
    initGame()

}

function renderLives() {
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gGame.lives
}


