
'use strict'

// Utility functions (Doron 23.11.2021):

// alert('I am the utils file and I am connected with the HTML file')
var elH1 = document.querySelector('.fromutilsPage')
elH1.innerText = `hello from utils.js`


//********* */ Time Functions /*************** */
// // Timer 1
// function runTimer() {
//     var startTime = Date.now()
//     intervalID = setInterval(function () {
//         var elTimer = document.querySelector('.timer')
//         elTimer.innerText = ((Date.now() - startTime) / 1000).toFixed(3)
//     }, 10)
// }

// Timer 2
// <h2 class="timer"> Time:</h2>
function startTimeInterval() {
    gStartTime = Date.now()
    console.log('gStartTime', gStartTime)
    // console.log(gStartTime);

    gIntervalID = setInterval(function () {
        var elTimer = document.querySelector('.timer')
        var miliSecs = Date.now() - gStartTime
        // console.log('miliSecs/1000:', miliSecs/1000);
        // console.log('miliSecs:', miliSecs);

        elTimer.innerText = ((miliSecs) / 1000).toFixed(3)
    }, 10)
}

//Get current time
function getTime() {
    return new Date().toString().split(' ')[4];
}

// a delay dunction
// TODO


//********* */ Audio Functions /*************** */
// play a sound
function playSound(file) {
    var audio = new Audio(file)
    audio.play()
}



//********* */ 'getRandomSomething' Functions /*************** */

//ok
//The maximum is inclusive and the minimum is inclusive
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


//The maximum is exclusive and the minimum is inclusive
// get Random number
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


//get random color
function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Get Random Word - Between 3-5 (editable)
function getWord() {
    var chartsStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var randomWord = ''
    var wordLength = getRandomInt(3, 5)  // which getRandomInt fuction inclusive or not ?

    for (var i = 0; i < wordLength; i++) {
        var randomIdx = getRandomInt(0, chartsStr.length)
        var randomLetter = chartsStr.charAt(randomIdx)
        randomWord += randomLetter
        return randomWord
    }
}


//********* */ Array Functions /*************** */
//ok
// checks whether two arrays are identical
function isEqual() {
    var a = [1, 2, 3, 5];
    var b = [1, 2, 3, 5];
    // if length is not equal
    if (a.length != b.length) {
        return "False";
    } else {
        // comapring each element of array
        for (var i = 0; i < a.length; i++) {
            if (a[i] != b[i]) return "False";
        }
    }
    return "True";
}


//Shuffle Sting - shuffles the items inside an array (items = [])
function shuffle(items) {
    var randIdx, keep;
    for (var i = items.length - 1; i > 0; i--) {
        // randIdx = getRandomInt(0, items.length);
        randIdx = getRandomInt(0, i + 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}




// draws the last number / element from an array 
function drawNum(arr) {
    return arr.pop();
}



// Get random ID
function getRandomId(idLength) {
    var digits = '1234567890'
    var str = '';
    for (var i = 0; i < idLength; i++) {
        var randInx = getRandomInt(0, digits.length)
        str += digits.charAt(randInx)
    }
    return str
}


//********* */ Mat Functions /*************** */

// create mat (EMPTY OR WITH CONTENT IN THE CELLS)

function createMat(row, col) {
    var mat = [];
    for (var i = 0; i < row; i++) {
        mat[i] = [];
        for (var j = 0; j < col; j++) {
            mat[i][j] = 'CONTENT/EMPTY'
        }
    }
    return mat;
}

// Create square mat    
function createSquareMat(matrixLength) {
    var board = []
    for (var i = 0; i < matrixLength; i++) {
        board[i] = []
        for (var j = 0; j < matrixLength; j++) {
            board[i][j] = []
        }
    }
    return board
}
// Create square mat                                  *** being used ****

// function createSquareMatWithCellsAndIdxs(matrixLength) {
//     var board = []
//     for (var i = 0; i < matrixLength; i++) {
//         board[i] = []
//         for (var j = 0; j < matrixLength; j++) {
//             board[i][j] = {
//                 minesAroundCount: 4,
//                 isShown: true,
//                 isMine: false,
//                 isMarked: true,
//                 i,
//                 j
//             }
//         }
//     }
//     return board
// }




// get Random Empty Cell in a matrix (returns an object {i,j})
function getRandomEmptyCell(mat) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j] === 'clean') {  // here i define what is an empty cell
                emptyCells.push({ i, j });
            }
        }
        var randIdx = getRandomInt(0, emptyCells.length - 1); // getrandomintinclusive
        return emptyCells[randIdx];
    }
}

//SumRow
function sumRow(mat, rowIdx) {
    var sum = 0
    var row = mat[rowIdx]
    for (var i = 0; i < mat.length; i++) {
        sum += row[i]
    }
    return sum
}


//SumCol
function sumCol(mat, colIdx) {
    var sum = 0
    for (var i = 0; i < mat.length; i++) {
        var currRow = mat[i]
        sum += currRow[colIdx]
    }
    return sum;
}


//Sum Primary
function sumInPrimaryDiagonal(mat) {
    var sum = 0
    for (var i = 0; i < mat.length; i++) {
        var num = mat[i][i]
        sum += num
    }

    return sum
}


//Sum Secondary
function countInSecondaryDiagonal(mat) {
    var sum = 0
    for (var i = 0; i < mat.length; i++) {
        var num = mat[i][mat.length - 1 - i]
        sum += num
    }
    return sum
}





// // Count Neighbors - neighbours loop (negs)
// function countNegs(cellI, cellJ, mat) {
//     var negsCount = 0;
//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i > mat.length - 1) continue;
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (j < 0 || j > mat[i].length - 1) continue;
//             if (i === cellI && j === cellJ) continue;
//             if (mat[i][j] === '?') negsCount++;
//         }
//     }
//     return negsCount;
// }

// Check if a mat is symmetric
function checkIfSymmetric(mat) {
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[i].length; j++) {
            if (mat[i][j] !== mat[j][i]) return false;
        }
    }
    return true;
}




// ****** Modal Functions *********//

function openModal() {
    // Todo: show the modal and schedule its closing
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
    setTimeout(closeModal, 5000)
}
function closeModal() {
    // Todo: hide the modal
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

function bless() {
    // Todo: update the modal content and use openModal
    var elBlessBtn = document.querySelector('.modal h2')
    elBlessBtn.innerText = 'You were blessed at ' + getTime()
    openModal()
}

// ****************** rendering Functions *******************//

// render board with indicators on cells 

// function renderBoard(board) {
//     var strHTML = ''
//     // console.table(board);
//     for (var i = 0; i < board.length; i++) {
//         strHTML += '<tr>'
//         for (var j = 0; j < board[0].length; j++) {
//             var cell = board[i][j]
//             var className = (cell) ? 'occupied' : ''
//             strHTML += `
//             <td data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i}, ${j})" class="${className}" >
//                 ${cell}
//             </td>
//             `
//         }
//         strHTML += '</tr>'
//     }


//     var elBoard = document.querySelector('.board')
//     elBoard.innerHTML = strHTML

// }