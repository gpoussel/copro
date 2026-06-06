// @ts-nocheck
// 🎮 CodinGame Puzzle - decode-the-message
// https://www.codingame.com/training/easy/decode-the-message

const P = BigInt(readline());
const C = readline();
const n = BigInt(C.length);

// The encoding is a positional system where:
// - Single chars: indices 0 to n-1
// - Two-char strings: offset n, then little-endian base-n index within the group
//   aa=n, ba=n+1, ..., ab=n+n, bb=n+n+1, ...
// - Three-char strings: offset n + n^2, etc.
//
// For a string of length L, the group offset = n + n^2 + ... + n^(L-1) = n*(n^(L-1)-1)/(n-1)
// Special case for L=1: offset = 0
//
// Within its group, the characters are encoded little-endian (first char is least significant).

// Find the length L by subtracting group offsets until P < n^L
let groupOffset = 0n;
let L = 1;
let groupSize = n; // n^L

// Subtract group-by-group to find which length group P belongs to
while (P >= groupOffset + groupSize) {
  groupOffset += groupSize;
  L++;
  groupSize *= n;
}

// Now P - groupOffset is the index within the length-L group (little-endian base-n)
let remainder = P - groupOffset;
let result = '';
for (let i = 0; i < L; i++) {
  const charIndex = Number(remainder % n);
  result += C[charIndex];
  remainder /= n;
}

console.log(result);
