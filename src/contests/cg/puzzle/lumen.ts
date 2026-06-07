// @ts-nocheck
// 🎮 CodinGame Puzzle - lumen
// https://www.codingame.com/training/easy/lumen

const N = parseInt(readline());
const L = parseInt(readline());

const grid: string[][] = [];
for (let i = 0; i < N; i++) {
    grid.push(readline().split(' '));
}

// Build light grid initialized to 0
const light: number[][] = [];
for (let i = 0; i < N; i++) {
    light.push(new Array(N).fill(0));
}

// For each candle, spread light using Chebyshev distance (square shape)
// "every spot in square shape gets one less light as the next ones"
// means: light at (r,c) from candle at (cr,cc) = max(0, L - chebyshevDist)
// where chebyshevDist = max(|r-cr|, |c-cc|)
for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
        if (grid[r][c] === 'C') {
            // Spread light from this candle
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    const dist = Math.max(Math.abs(i - r), Math.abs(j - c));
                    const contribution = Math.max(0, L - dist);
                    light[i][j] = Math.max(light[i][j], contribution);
                }
            }
        }
    }
}

// Count dark spots (light === 0)
let darkCount = 0;
for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
        if (light[i][j] === 0) {
            darkCount++;
        }
    }
}

console.log(darkCount + 0);
