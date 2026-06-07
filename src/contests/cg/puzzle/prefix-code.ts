// @ts-nocheck
// 🎮 CodinGame Puzzle - prefix-code
// https://www.codingame.com/training/easy/prefix-code

const n = parseInt(readline());
const codeMap: Record<string, number> = {};

for (let i = 0; i < n; i++) {
    const parts = readline().split(' ');
    const binary = parts[0];
    const charCode = parseInt(parts[1]);
    codeMap[binary] = charCode;
}

const s = readline();

let result = '';
let current = '';
let i = 0;

while (i < s.length) {
    current += s[i];
    if (codeMap[current] !== undefined) {
        result += String.fromCharCode(codeMap[current]);
        current = '';
    }
    i++;
}

if (current.length > 0) {
    // We have leftover bits that didn't match any code
    // Find the index where decoding failed
    // We need to find the first position in s where we couldn't make progress
    // Re-simulate to find the exact failure index
    let failIndex = 0;
    let cur = '';
    let pos = 0;
    while (pos < s.length) {
        cur += s[pos];
        if (codeMap[cur] !== undefined) {
            cur = '';
            failIndex = pos + 1;
        }
        pos++;
    }
    // failIndex is where the remaining unmatched segment starts
    console.log('DECODE FAIL AT INDEX ' + failIndex);
} else {
    console.log(result);
}
