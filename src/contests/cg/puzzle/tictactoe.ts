// @ts-nocheck
// 🎮 CodinGame Puzzle - tictactoe
// https://www.codingame.com/training/easy/tictactoe

const board: string[] = [];
for (let i = 0; i < 3; i++) {
    board.push(readline());
}

function isWinner(grid: string[]): boolean {
    // Check rows
    for (let r = 0; r < 3; r++) {
        if (grid[r][0] === 'O' && grid[r][1] === 'O' && grid[r][2] === 'O') return true;
    }
    // Check columns
    for (let c = 0; c < 3; c++) {
        if (grid[0][c] === 'O' && grid[1][c] === 'O' && grid[2][c] === 'O') return true;
    }
    // Check diagonals
    if (grid[0][0] === 'O' && grid[1][1] === 'O' && grid[2][2] === 'O') return true;
    if (grid[0][2] === 'O' && grid[1][1] === 'O' && grid[2][0] === 'O') return true;
    return false;
}

let found = false;
for (let r = 0; r < 3 && !found; r++) {
    for (let c = 0; c < 3 && !found; c++) {
        if (board[r][c] === '.') {
            // Try placing O here
            const newGrid = board.map((row, ri) =>
                ri === r ? row.substring(0, c) + 'O' + row.substring(c + 1) : row
            );
            if (isWinner(newGrid)) {
                for (const row of newGrid) {
                    console.log(row);
                }
                found = true;
            }
        }
    }
}

if (!found) {
    console.log('false');
}
