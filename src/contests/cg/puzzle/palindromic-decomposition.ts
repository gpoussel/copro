// 🎮 CodinGame Puzzle - palindromic-decomposition
// https://www.codingame.com/training/medium/palindromic-decomposition

const s = readline().trim()
const n = s.length
const stride = n + 1

// isPal[i * stride + j] = 1 when s[i..j) is a palindrome (empty strings included)
const isPal = new Uint8Array(stride * stride)
for (let i = 0; i <= n; i++) isPal[i * stride + i] = 1
for (let center = 0; center < 2 * n - 1; center++) {
  let lo = Math.floor(center / 2)
  let hi = lo + (center % 2)
  while (lo >= 0 && hi < n && s[lo] === s[hi]) {
    isPal[lo * stride + hi + 1] = 1
    lo--
    hi++
  }
}

// P = s[0..i), Q = s[i..j), R = s[j..n)
let count = 0
for (let i = 0; i <= n; i++) {
  if (!isPal[i]) continue
  for (let j = i; j <= n; j++) {
    if (isPal[j * stride + n] && isPal[i * stride + j]) count++
  }
}
console.log(count)
