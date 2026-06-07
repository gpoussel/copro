// @ts-nocheck
// 🎮 CodinGame Puzzle - isbn-check-digit
// https://www.codingame.com/training/easy/isbn-check-digit

function isValidISBN10(isbn: string): boolean {
  if (isbn.length !== 10) return false;
  // First 9 must be digits, last can be digit or X
  for (let i = 0; i < 9; i++) {
    if (isbn[i] < '0' || isbn[i] > '9') return false;
  }
  const lastChar = isbn[9];
  if (lastChar !== 'X' && (lastChar < '0' || lastChar > '9')) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
  sum += checkDigit;
  return sum % 11 === 0;
}

function isValidISBN13(isbn: string): boolean {
  if (isbn.length !== 13) return false;
  // All 13 must be digits
  for (let i = 0; i < 13; i++) {
    if (isbn[i] < '0' || isbn[i] > '9') return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const weight = i % 2 === 0 ? 1 : 3;
    sum += parseInt(isbn[i]) * weight;
  }
  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;
  return checkDigit === parseInt(isbn[12]);
}

function isValidISBN(isbn: string): boolean {
  if (isbn.length === 10) return isValidISBN10(isbn);
  if (isbn.length === 13) return isValidISBN13(isbn);
  return false;
}

const N = parseInt(readline());
const invalid: string[] = [];

for (let i = 0; i < N; i++) {
  const isbn = readline();
  if (!isValidISBN(isbn)) {
    invalid.push(isbn);
  }
}

console.log(`${invalid.length} invalid:`);
for (const isbn of invalid) {
  console.log(isbn);
}
