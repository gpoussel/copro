// @ts-nocheck
// 🎮 CodinGame Puzzle - substitution-encoding
// https://www.codingame.com/training/easy/substitution-encoding

const rows = parseInt(readline());
const table: string[][] = [];

for (let i = 0; i < rows; i++) {
    const row = readline().split(' ');
    table.push(row);
}

const message = readline();

// Determine the number of digits needed for row and column indices
const rowDigits = String(rows - 1).length;
const maxCols = Math.max(...table.map(r => r.length));
const colDigits = String(maxCols - 1).length;

// Build a lookup map: char -> encoded string
const lookup: Record<string, string> = {};
for (let r = 0; r < table.length; r++) {
    for (let c = 0; c < table[r].length; c++) {
        const rowStr = String(r).padStart(rowDigits, '0');
        const colStr = String(c).padStart(colDigits, '0');
        lookup[table[r][c]] = rowStr + colStr;
    }
}

let result = '';
for (const ch of message) {
    result += lookup[ch];
}

console.log(result);
