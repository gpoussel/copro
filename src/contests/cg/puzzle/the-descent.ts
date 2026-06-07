// @ts-nocheck
// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

// Game loop: each turn, read 8 mountain heights and fire on the tallest one.
while (true) {
    let maxHeight = -1;
    let maxIndex = 0;

    for (let i = 0; i < 8; i++) {
        const mountainH = parseInt(readline());
        if (mountainH > maxHeight) {
            maxHeight = mountainH;
            maxIndex = i;
        }
    }

    console.log(maxIndex);
}
