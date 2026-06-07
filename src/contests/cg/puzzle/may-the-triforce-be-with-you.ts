// @ts-nocheck
// 🎮 CodinGame Puzzle - may-the-triforce-be-with-you
// https://www.codingame.com/training/easy/may-the-triforce-be-with-you

const N = parseInt(readline());

// Total width of the triforce: two bottom triangles side by side
// Bottom row has (2N-1) stars + 1 space + (2N-1) stars = 4N-1 chars
// The center column of the top triangle is at index 2N-1 (0-indexed)

// Top triangle: N lines
// Line i (1-indexed): 2i-1 stars centered at column 2N-1
// Stars occupy columns [2N-1-(i-1), 2N-1+(i-1)] = [2N-i, 2N-2+i]
for (let i = 1; i <= N; i++) {
    const starCount = 2 * i - 1;
    const leftPad = 2 * N - i; // number of spaces before stars
    // No trailing spaces: the line ends at the last star.
    let line = ' '.repeat(leftPad) + '*'.repeat(starCount);
    if (i === 1) {
        // Replace leading space with dot (avoids auto-trimming of leading spaces)
        line = '.' + line.slice(1);
    }
    console.log(line);
}

// Bottom two triangles: N lines
// Left triangle line i (1-indexed): 2i-1 stars starting at column N-i
// Right triangle line i: 2i-1 stars starting at column 3N-i+1 (after center space)
// Center space at column 2N-1 for all rows
for (let i = 1; i <= N; i++) {
    const starCount = 2 * i - 1;
    const leftStart = N - i;         // left triangle starts here
    const leftEnd = leftStart + starCount - 1; // left triangle ends here
    // Gap between left and right: columns leftEnd+1 to rightStart-1
    const rightStart = 3 * N - i;    // right triangle starts here
    const rightEnd = rightStart + starCount - 1;

    const gapWidth = rightStart - leftEnd - 1;

    // No trailing spaces: the line ends at the last star of the right triangle.
    const line = ' '.repeat(leftStart) + '*'.repeat(starCount) + ' '.repeat(gapWidth) + '*'.repeat(starCount);
    console.log(line);
}
