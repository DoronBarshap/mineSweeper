'use strict'

// Global variables

const MINE = '<img src="img/landMine.jpg" >'
const EMPTY = 'empty'
const MARKED = '<td data-i="${row}" data-j="${col}" onclick="cellClicked(this, ${row}, ${col})" class="marked shown"><img src="img/flag.jpg"></td>'
var gBoard = []
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gTimerInterval
var gStartGameTime
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

// Functions 


function initGame() {
    buildBoard(gLevel.SIZE) //basic board with objects inside each cell
    positionMines()         // randomly puts mines in some of the cells object (cell.isMine = true)
    renderBoard(gBoard)    // renders covered board
    updateBoard()          // updates the model matrix about neighboring mines
    resetGame()           // zeroes all the global variables
}

function resetGame(){
    gGame.markedCount = 0
    gGame.shownCount = 0
    gGame.lives = 3
    renderLives()
    showFlagsLeft()
}


// preventing from right click to show the context menu, and setting / unsetting a flag 
const noContext = document.querySelector('.board');
noContext.addEventListener('contextmenu', e => {
    e.preventDefault()
    if (!gGame.isOn) {          // if it's the first click in the game the game starts
        gGame.isOn = true
        resetGame()
        startTimer()
    }
    var row = e.path[0].dataset.i
    var col = e.path[0].dataset.j
    console.log('gBoard is(1): \n')
    console.log(gBoard)
    console.log('e.path[0]: ', e.path[0])
    if (gBoard[row][col].isMarked) { // if the cell is already marked un-flag it !!!
        console.log('it is marked(1): ')
        gBoard[row][col].isMarked = false
        gBoard[row][col].isShown = false
        renderCell(e.path[0], row, col)
        setFlag(e.path[0], row, col)
        return
    }
    if (gBoard[row][col].isShown) {
        gBoard[row][col].isShown = false
        return
    }
    setFlag(e.path[0], row, col)  //thats how i send the whole td
    console.log('now i put a flag: ')
})

 


function setFlag(elCell, row, col) {
    // model
    gBoard[row][col].isMarked = true
    gBoard[row][col].isShown = true
    gGame.shownCount++
    gGame.markedCount++
    console.log('gGame.shownCount: (from setFlag) ', gGame.shownCount)
    console.log('gGame.markedCount: ', gGame.markedCount)

    // dom
    console.log('elCell: ', elCell)

    renderCell(elCell, row, col)
    showFlagsLeft()
    isGameOver()
}


function cellClicked(elCell, i, j) {
    console.table('gBoard is: \n')
    console.table(gBoard)
    if (!gGame.isOn) {  // if it is the first click - start the game....
        gGame.isOn = true
        resetGame()
        startTimer()
    }
    // if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return
      
    if (gBoard[i][j].isMine) { //if it is a mine
        gGame.lives--
        if (gGame.lives === 0) gameOver('lose')
        renderLives()
        gBoard[i][j].isShown = true
        renderCell(elCell, i, j)
        console.log('elCell (from cellClicked): ',elCell)
        gGame.shownCount++
        if(gGame.shownCount===gBoard.length**2) gameOver('win')
        // exposeAllBoard()
    } else if (!gBoard[i][j].minesAroundCount){ // if the cell has 0 negs show negs
        //model
        gBoard[i][j].isShown = true      
        gGame.shownCount++
        if(gGame.shownCount===gBoard.length**2) gameOver('win')
        showNegs(elCell, i, j)
        //dom
        renderCell(elCell, i, j)
        if (!gBoard[i][j].minesAroundCount) showNegs(elCell, i, j)
        isGameOver()
    }
}


// if all the mines are flagged and all the cells are shown it's a game over with 'win' state
// so i could get it by a loop, or by counting while cells are clicked and their state is changed
function isGameOver() {
    if (gGame.shownCount === gBoard.length ** 2) {
        gameOver('win')
        return true
    }
    return false

}



function renderCell(elCell, row, col) {
    console.log('gGame.shownCount: (from renderCell) ', gGame.shownCount)
    console.log('gGame.markedCount: ', gGame.markedCount)
    if (!gBoard[row][col].isShown) {
        elCell.classList.add('shown')
    }
    var numOfNegMines = gBoard[row][col].minesAroundCount
    if (numOfNegMines === 0) numOfNegMines = ''
    if (gBoard[row][col].isMarked) {     //if it has a mine
        elCell.classList.add('marked')
        console.log('elCell before assigning MARKED: ', elCell)
        console.log('MARKED: ',MARKED)
        
        elCell.innerHTML = MARKED

        console.log('elCell.innerHTML after assigning MARKED: ', elCell.innerHTML)
        console.log('i am in render cell. ismarked : ')
        return
    }
    console.log('i am in render cel 11111: ')

    if (gBoard[row][col].isMine) {    // if it does not have a mine, is it shown? 
        elCell.classList.add('shown')
        elCell.innerHTML = MINE
        console.log('i am in render cell. isMine : ')
        return
    }

    elCell.innerText = `${numOfNegMines}`
}




// TODO

// exposes the cells around the selected cell
function showNegs(elCell, row, col) {
    var negsCount = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            gBoard[i][j].isShown = true
            console.log('isHown around the cel are exposed: ')
            
        }
    }
}
//var element = document. querySelector('.element');
//var dataAttribute = element. getAttribute('data-name');
//

//OK

function renderLives() {
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gGame.lives
}

function gameOver(state) {
    (state === 'win') ? showModal('win') : showModal('lose')
    clearInterval(gTimerInterval)
    gGame.isOn = false


}

// minesLeftIndicator
function showFlagsLeft() {
    var elFlagsLeft = document.querySelector('.flagsLeftIndicator span')
    var flagsLeft = gLevel.MINES - gGame.markedCount
    if (flagsLeft === 0) {
        if (!isGameOver()) { // if the number of flags that was used is equal to the number of the mines
            // the options should be take flags away ...

        }
    }
    elFlagsLeft.innerText = flagsLeft
}

// builds the matrix of the game (the model)
function buildBoard(level) {
    gBoard = createSquareMatWithCellsAndIdxs(level)
}

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

// Create square mat
function createSquareMatWithCellsAndIdxs(matrixLength) {
    var board = []
    for (var i = 0; i < matrixLength; i++) {
        board[i] = []
        for (var j = 0; j < matrixLength; j++) {
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

// // Count Neighbors - how many mines are around the cell
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


//UPDATE THE MATRIX OF THE MODEL WITH HOW MANY MINES ARE AROUND EACH CELL
function updateBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = countNegs(i, j, gBoard)
        }
    }
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


function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            var numOfNegMines = cell.minesAroundCount
            var cellState = (cell.isMine) ? 'mine ' : ''
            cellState += (cell.isShown) ? 'shown ' : ''
            cellState += (cell.isMarked) ? 'marked ' : ''
            // var cellContent = ''
            // if (cell.isMine) {
            //     cellContent = MINE
            // } else if (numOfNegMines > 0) {
            //     cellContent = numOfNegMines
            // } else {
            //     cellContent = EMPTY
            // }

            strHTML += `
                        <td data-i=${i} data-j=${j} onclick="cellClicked(this, ${i}, ${j})" class="${cellState}"></td>`
        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// puts mines randomly in the board
function positionMines() {
    var emptyCells = getNumsArray(gBoard.length ** 2 - 1)
    for (var i = 0; i < gLevel.MINES; i++) {
        var num = drawRandNum(emptyCells)
        var posI = Math.floor(num / gBoard.length)
        var posJ = num % gBoard.length
        var pos = { i: posI, j: posJ }
        positionMine(pos)
    }
}

function positionMine(position) {
    gBoard[position.i][position.j].isMine = true
}


//   UTILITY FUNCTIONS SPECIFIC TO THIS PROGRAM


function exposeAllBoard() { }
function positionMinesManually() { }
function nesNegsCount(board) { }
function cellMarked(elCell) { }
function checkGameOver() { }
function expandShown(board, elCell, i, j) { }
function positionAMineManually(board, i, j,) { }


// This is an object in which you
// can keep and update the
// current game state:
// isOn: Boolean, when true we
// let the user play
// shownCount: How many cells
// are shown
// markedCount: How many cells
// are marked (with a flag)
// secsPassed: How many seconds
// passed
// gGame = {
//     isOn: false,
//     shownCount: 0,
//     markedCount: 0,
//     secsPassed: 0
//     }

