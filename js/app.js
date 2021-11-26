'use strict'

// Global variables
var gStages = []

const MARKED = `flag.jpg`
const MINE = `landMine.jpg`
const EMPTY = ''
var gStartGameTime
var gTimerInterval
var gBoard = []
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

// Functions 

function initGame() {
    gBoard = buildBoard(gLevel.SIZE) //basic board with objects inside each cell
    positionMines()         // randomly puts mines in some of the cells object (cell.isMine = true)
    console.table('gBoard.table', gBoard)

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
    renderLives()
    showFlagsLeft()

    gStages = []
}

// left click event (exposing the cell)
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {  // if it is the first click - start the game....
        gGame.isOn = true
        resetGame()
        startTimer()
    }
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return // if it is already marked or shown nothing to do here
    gBoard[i][j].isShown = true
    gGame.shownCount++
    if ((gGame.shownCount === 1) && gBoard[i][j].isMine) { // if it's the first click of the 
        console.log('fist left click: ')                   // game (not counting for flags) 
        // and if there is a mine move it
        for (var k = 0; k < gBoard.length; k++) {
            for (var l = 0; l < gBoard.length; l++) {
                if (!(gBoard[k][l].isMine) && !(gBoard[k][l].isShown) &&
                    isFarEnough(k, l, i, j)) {
                    console.log('im in the while loop: ')
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
        if (gGame.lives === 0) {
            showMines()
            gameOver('lose')
        }
        renderLives()
        gStages.push(copyMat(gBoard))
        renderBoard(gBoard)
    } else if (gBoard[i][j].minesAroundCount) {     //if there are neighbours  
        gStages.push(copyMat(gBoard))
        renderBoard(gBoard)
        isGameOver()
    } else if (!gBoard[i][j].minesAroundCount) { // if it doesn't have neighbours  
        gStages.push(copyMat(gBoard))
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
    } else if (gGame.markedCount < gLevel.MINES) {
        cell.isMarked = true
        gGame.markedCount++
    }
    renderBoard(gBoard)
    showFlagsLeft()
    isGameOver()
})



// TODO:
// SMILEY
// WIN/LOSE SOUND
// RECORDING RECORDS
// RECORDING STAGES AND UNDO-ING THEM
// KUCJY TOUCH
// 3 HINTS
// BUT FIRST : THE BASIC FUNCTIONS ABOVE



// STILL NEED TO THINK ABOUT IT
function isGameOver() {
    if ((gGame.shownCount + gGame.lives - 3) === gBoard.length ** 2) {
        gameOver('win')
        return true
    }
    return false
}

// STILL NEED TO THINK ABOUT HOW TO MAKE IT RECURSIVE
// exposes the cells around the selected cell
function showNegs(row, col) {
    console.log('i am in a loop in showNegs: 1 ')
    console.log('gBoard[row][col]: row, col, ', gBoard[row][col], row, col)

    if (gBoard[row][col].minesAroundCount > 0) return
    for (var i = row - 1; i <= row + 1; i++) {
        console.log('i am in a loop in showNegs: 2 ')
        if (i < 0 || i > gBoard.length - 1) continue;
        console.log('i am in a loop in showNegs: 3 ')
        for (var j = col - 1; j <= col + 1; j++) {
            console.log('i am in a loop in showNegs: 4 ')
            if (j < 0 || j > gBoard.length - 1) continue;
            if (i === row && j === col) continue;
            console.log('i am in a loop in showNegs: 5 ')
            gBoard[i][j].isShown = true
            renderBoard(gBoard)
            // showNegs(i,j)
            if (!(gBoard[i][j].minesAroundCount)) {
                console.log('i am in a loop in showNegs: 6 ')
                // showNegs(i,j)
            }
        }
    }

    return
}

// STILL NEED TO THINK ABOUT IT
function undo() {
    console.log('gStages[0]: ', gStages[0])
    console.log('gStages[1]: ', gStages[1])



    var lastBoard = copyMat(gStages.pop())
    renderBoard(lastBoard)
}

//Copy mat -> IT DOES'NT WORK FOR COPYING A WHOLE ARRAY WITH OBJECT IN IT. LET'S FIND BETTER SOLUTION
function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

// renders on screen how many flags are left ##### FIX IT TO MINES
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

// creates the timer  *** FIX THE SECONDS 0-10 IT SHOWS ONE DIGIT ***********************FIX FIX FIX ****
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
    (state === 'win') ? showModal('win') : showModal('lose')
    clearInterval(gTimerInterval)
    gGame.isOn = false


}


//   UTILITY FUNCTIONS 



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


