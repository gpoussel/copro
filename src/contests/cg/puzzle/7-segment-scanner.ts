// @ts-nocheck
// 🎮 CodinGame Puzzle - 7-segment-scanner
// https://www.codingame.com/training/easy/7-segment-scanner

const line1 = readline();
const line2 = readline();
const line3 = readline();

// Reference display showing digits 0-9 side by side (3 chars per digit)
const REF_TOP = " _     _  _     _  _  _  _  _ ";
const REF_MID = "| |  | _| _||_||_ |_   ||_||_|";
const REF_BOT = "|_|  ||_  _|  | _||_|  ||_| _|";

// Build a map from 9-char pattern (top+mid+bot) to digit string
const digitPatterns: Record<string, string> = {};
for (let i = 0; i < 10; i++) {
  const key =
    REF_TOP.slice(i * 3, i * 3 + 3) +
    REF_MID.slice(i * 3, i * 3 + 3) +
    REF_BOT.slice(i * 3, i * 3 + 3);
  digitPatterns[key] = String(i);
}

// Decode each digit from the input
const numDigits = Math.floor(line1.length / 3);
let result = "";

for (let i = 0; i < numDigits; i++) {
  const key =
    line1.slice(i * 3, i * 3 + 3) +
    line2.slice(i * 3, i * 3 + 3) +
    line3.slice(i * 3, i * 3 + 3);
  result += digitPatterns[key] ?? "?";
}

console.log(result);
