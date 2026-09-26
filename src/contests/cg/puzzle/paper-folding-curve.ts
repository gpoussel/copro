// 🎮 CodinGame Puzzle - paper-folding-curve
// https://www.codingame.com/training/hard/paper-folding-curve

// Regular paper-folding sequence: every order is a prefix of the next one, and
// the term at 0-based index i is found by writing i + 1 = 2^a * m with m odd:
// the turn is LEFT (1) when m ≡ 1 (mod 4), RIGHT (0) when m ≡ 3 (mod 4).

readline() // the order does not matter, sequences are prefixes of each other
const [start, end] = readline().split(" ").map(BigInt)

let answer = ""
for (let i = start; i <= end; i++) {
  let k = i + 1n
  while (k % 2n === 0n) k /= 2n
  answer += k % 4n === 1n ? "1" : "0"
}
console.log(answer)
