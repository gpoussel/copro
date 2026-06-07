// @ts-nocheck
// 🎮 CodinGame Puzzle - reverse-minesweeper
// https://www.codingame.com/training/easy/reverse-minesweeper

const w = parseInt(readline());
const h = parseInt(readline());
const grid: string[] = [];
for (let i = 0; i < h; i++) {
    grid.push(readline());
}

for (let row = 0; row < h; row++) {
    let line = '';
    for (let col = 0; col < w; col++) {
        if (grid[row][col] === 'x') {
            line += '.';
        } else {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < h && c >= 0 && c < w && grid[r][c] === 'x') {
                        count++;
                    }
                }
            }
            line += count > 0 ? String(count) : '.';
        }
    }
    console.log(line);
}
