// @ts-nocheck
// 🎮 CodinGame Puzzle - nicholas-breakspeare-and-hugh-of-evesham
// https://www.codingame.com/training/easy/nicholas-breakspeare-and-hugh-of-evesham

const ones = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'
];

const tens = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
];

// Convert a number < 1000 to words (n is a BigInt, but small)
function threeDigits(n) {
  const num = Number(n);
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    return o === 0 ? tens[t] : tens[t] + '-' + ones[o];
  }
  // 100-999
  const h = Math.floor(num / 100);
  const rest = num % 100;
  const hundredPart = ones[h] + ' hundred';
  if (rest === 0) return hundredPart;
  return hundredPart + ' ' + threeDigits(BigInt(rest));
}

const groups = [
  { name: 'quintillion', value: BigInt('1000000000000000000') },
  { name: 'quadrillion', value: BigInt('1000000000000000') },
  { name: 'trillion',    value: BigInt('1000000000000') },
  { name: 'billion',     value: BigInt('1000000000') },
  { name: 'million',     value: BigInt('1000000') },
  { name: 'thousand',    value: BigInt('1000') },
];

function toEnglish(n) {
  if (n === 0n) return 'zero';

  let negative = false;
  if (n < 0n) {
    negative = true;
    n = -n;
  }

  const parts = [];

  for (const { name, value } of groups) {
    if (n >= value) {
      const groupVal = n / value;
      n = n % value;
      const groupWords = threeDigits(groupVal);
      parts.push(groupWords + ' ' + name);
    }
  }

  // Remaining < 1000
  if (n > 0n) {
    parts.push(threeDigits(n));
  }

  const result = parts.join(' ');
  return negative ? 'negative ' + result : result;
}

const n = parseInt(readline());
for (let i = 0; i < n; i++) {
  const line = readline().trim();
  const num = BigInt(line);
  console.log(toEnglish(num));
}
