const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
let score = 0;
let grid = Array(4).fill().map(() => Array(4).fill(0));

function setup() {
    gridContainer.innerHTML = '';
    grid = Array(4).fill().map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            gridContainer.appendChild(tile);
        }
    }
    addRandomTile();
    addRandomTile();
    updateDisplay();
}

function getEmptyPositions() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                empty.push({i, j});
            }
        }
    }
    return empty;
}

function addRandomTile() {
    const empty = getEmptyPositions();
    if (empty.length === 0) {
        checkGameOver();
        return;
    }
    const {i, j} = empty[Math.floor(Math.random() * empty.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    updateDisplay();
}

function updateDisplay() {
    const tiles = document.querySelectorAll('.tile');
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const value = grid[i][j];
            const tile = tiles[i * 4 + j];
            
            if (tile.innerText !== (value || '') && value !== 0) {
                tile.classList.add('merged');
                setTimeout(() => {
                    tile.classList.remove('merged');
                }, 300);
            }
            
            tile.innerText = value || '';
            tile.setAttribute('data-value', value || '');
        }
    }
    scoreDisplay.innerText = score;
}

function checkGameOver() {
    if (getEmptyPositions().length > 0) return false;
    
    // Check for possible merges
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const current = grid[i][j];
            if ((i < 3 && current === grid[i + 1][j]) ||
                (j < 3 && current === grid[i][j + 1])) {
                return false;
            }
        }
    }
    
    showGameOver();
    return true;
}

function showGameOver() {
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function hideGameOver() {
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.classList.add('hidden');
}

function resetGame() {
    score = 0;
    hideGameOver();
    setup();
}

function moveTiles(direction) {
    let moved = false;
    const newGrid = Array(4).fill().map(() => Array(4).fill(0));
    
    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            // Get non-zero tiles in the row
            let row = grid[i].filter(x => x !== 0);
            
            // For right movement, we want to merge from right to left
            if (direction === 'right') {
                row.reverse();
            }
            
            // Merge adjacent equal tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            
            // Pad with zeros
            const zerosNeeded = 4 - row.length;
            const zeros = Array(zerosNeeded).fill(0);
            
            if (direction === 'right') {
                row.reverse(); // Reverse back after merging
                newGrid[i] = [...zeros, ...row]; // Zeros go on the left for right movement
            } else {
                newGrid[i] = [...row, ...zeros]; // Zeros go on the right for left movement
            }
        }
    } else { // up or down movement
        for (let j = 0; j < 4; j++) {
            // Get non-zero tiles in the column
            let col = [];
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== 0) {
                    col.push(grid[i][j]);
                }
            }
            
            // For down movement, we want to merge from bottom to top
            if (direction === 'down') {
                col.reverse();
            }
            
            // Merge adjacent equal tiles
            for (let i = 0; i < col.length - 1; i++) {
                if (col[i] === col[i + 1]) {
                    col[i] *= 2;
                    score += col[i];
                    col.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            // Pad with zeros
            const zerosNeeded = 4 - col.length;
            const zeros = Array(zerosNeeded).fill(0);
            
            if (direction === 'down') {
                col.reverse(); // Reverse back after merging
                const finalCol = [...zeros, ...col]; // Zeros go on top for down movement
                for (let i = 0; i < 4; i++) {
                    newGrid[i][j] = finalCol[i];
                }
            } else {
                const finalCol = [...col, ...zeros]; // Zeros go on bottom for up movement
                for (let i = 0; i < 4; i++) {
                    newGrid[i][j] = finalCol[i];
                }
            }
        }
    }
    
    // Check if any tiles actually moved
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] !== newGrid[i][j]) {
                moved = true;
            }
        }
    }
    
    if (moved) {
        grid = newGrid;
        updateDisplay();
        setTimeout(addRandomTile, 150); // Add delay for smooth animation
    }
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveTiles('up');
            break;
        case 'ArrowDown':
            moveTiles('down');
            break;
        case 'ArrowLeft':
            moveTiles('left');
            break;
        case 'ArrowRight':
            moveTiles('right');
            break;
    }
}

// Touch handling variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Add touch event listeners
gridContainer.addEventListener('touchstart', handleTouchStart, false);
gridContainer.addEventListener('touchmove', handleTouchMove, false);
gridContainer.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
    event.preventDefault();
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault();
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    event.preventDefault();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 50;
    
    // Determine swipe direction based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                moveTiles('right');
            } else {
                moveTiles('left');
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                moveTiles('down');
            } else {
                moveTiles('up');
            }
        }
    }
}

// Prevent scrolling when touching the game container
document.addEventListener('touchmove', function(event) {
    if (event.target.closest('.grid-container')) {
        event.preventDefault();
    }
}, { passive: false });

document.addEventListener('keydown', handleKeyDown);
document.getElementById('try-again').addEventListener('click', resetGame);
setup();
