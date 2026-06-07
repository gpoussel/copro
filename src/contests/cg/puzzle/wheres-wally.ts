// @ts-nocheck
// 🎮 CodinGame Puzzle - wheres-wally
// https://www.codingame.com/training/easy/wheres-wally

const [wallyWidth, wallyHeight] = readline().split(' ').map(Number);
const wallyRows: string[] = [];
for (let i = 0; i < wallyHeight; i++) {
    wallyRows.push(readline());
}

const [pictureWidth, pictureHeight] = readline().split(' ').map(Number);
const pictureRows: string[] = [];
for (let i = 0; i < pictureHeight; i++) {
    pictureRows.push(readline());
}

// Try each possible top-left position (x, y) in the picture
let resultX = -1;
let resultY = -1;

search:
for (let y = 0; y <= pictureHeight - wallyHeight; y++) {
    for (let x = 0; x <= pictureWidth - wallyWidth; x++) {
        let found = true;

        // Check if Wally matches at position (x, y)
        outer: for (let wy = 0; wy < wallyHeight; wy++) {
            const wallyRow = wallyRows[wy];
            const pictureRow = pictureRows[y + wy];
            for (let wx = 0; wx < wallyWidth; wx++) {
                const wallyChar = wallyRow[wx] ?? ' ';
                // Spaces in Wally can match any character in the picture
                if (wallyChar !== ' ' && wallyChar !== pictureRow[x + wx]) {
                    found = false;
                    break outer;
                }
            }
        }

        if (found) {
            resultX = x;
            resultY = y;
            break search;
        }
    }
}

console.log(`${resultX} ${resultY}`);
