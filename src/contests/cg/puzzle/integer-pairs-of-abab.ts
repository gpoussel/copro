// 🎮 CodinGame Puzzle - integer-pairs-of-abab
// https://www.codingame.com/training/medium/integer-pairs-of-abab

// AB/(A+B) = N  <=>  (A-N)(B-N) = N^2. Each (signed) divisor d of N^2 gives a pair,
// except d = -N which yields A = B = 0. Answer: 2 * d(N^2) - 1.
let n = Number(readline())
let divisorsOfSquare = 1
for (let p = 2; p * p <= n; p++) {
  let e = 0
  while (n % p === 0) {
    n /= p
    e++
  }
  divisorsOfSquare *= 2 * e + 1
}
if (n > 1) divisorsOfSquare *= 3
console.log(2 * divisorsOfSquare - 1)
