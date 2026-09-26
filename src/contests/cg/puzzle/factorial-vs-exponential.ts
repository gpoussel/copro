// 🎮 CodinGame Puzzle - factorial-vs-exponential
// https://www.codingame.com/training/medium/factorial-vs-exponential

// Compare in log space: N*ln(A) < ln(N!) = sum of ln(k)
readline()
const bases = readline().split(" ").map(Number)
const answers = bases.map(a => {
  const logA = Math.log(a)
  let logFact = 0
  let n = 0
  do {
    n++
    logFact += Math.log(n)
  } while (n * logA >= logFact)
  return n
})
console.log(answers.join(" "))
