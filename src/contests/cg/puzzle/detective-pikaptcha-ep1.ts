// @ts-nocheck
// 🎮 CodinGame Puzzle - detective-pikaptcha-ep1
// https://www.codingame.com/training/easy/detective-pikaptcha-ep1

const dims = readline().trim().split(' ');
const width = parseInt(dims[0]);
const height = parseInt(dims[1]);

const grid: string[][] = [];
for (let i = 0; i < height; i++) {
    grid.push(readline().split(''));
}

const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

for (let r = 0; r < height; r++) {
    let row = '';
    for (let c = 0; c < width; c++) {
        if (grid[r][c] === '#') {
            row += '#';
        } else {
            let count = 0;
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < height && nc >= 0 && nc < width && grid[nr][nc] === '0') {
                    count++;
                }
            }
            row += count;
        }
    }
    console.log(row);
}
