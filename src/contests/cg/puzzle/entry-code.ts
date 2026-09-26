// 🎮 CodinGame Puzzle - entry-code
// https://www.codingame.com/training/medium/entry-code

// Lexicographically smallest de Bruijn sequence (FKM algorithm: concatenation
// of Lyndon words in order), made linear by appending its first n-1 digits
const alphabetSize = parseInt(readline())
const codeLength = parseInt(readline())

const work: number[] = []
for (let i = 0; i <= codeLength; i++) work.push(0)
const sequence: number[] = []

function generate(t: number, p: number): void {
  if (t > codeLength) {
    if (codeLength % p === 0) {
      for (let i = 1; i <= p; i++) sequence.push(work[i])
    }
    return
  }
  work[t] = work[t - p]
  generate(t + 1, p)
  for (let digit = work[t - p] + 1; digit < alphabetSize; digit++) {
    work[t] = digit
    generate(t + 1, t)
  }
}

generate(1, 1)
const linear = sequence.slice()
for (let i = 0; i < codeLength - 1; i++) linear.push(sequence[i % sequence.length])
console.log(linear.join(""))
