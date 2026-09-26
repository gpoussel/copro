// 🎮 CodinGame Puzzle - equation-search
// https://www.codingame.com/training/medium/equation-search

const n = parseInt(readline())
const rightSides = readline()
  .split(" ")
  .map(Number)
  .sort((a, b) => a - b)
const counts = [0].concat(readline().split(" ").map(Number)) // counts[d] for operand d

// Candidate left sides for each right side
const options: [number, string, number][][] = rightSides.map(target => {
  const list: [number, string, number][] = []
  for (let a = 1; a <= 9; a++) {
    for (let b = a; b <= 9; b++) {
      if (a + b === target) list.push([a, "+", b])
      if (a * b === target) list.push([a, "x", b])
    }
  }
  return list
})

let solutionCount = 0
let firstSolution: string[] = []
const current: string[] = []

function search(index: number): void {
  if (index === n) {
    if (solutionCount++ === 0) firstSolution = current.slice()
    return
  }
  for (const [a, op, b] of options[index]) {
    counts[a]--
    counts[b]--
    if (counts[a] >= 0 && counts[b] >= 0) {
      current.push(`${a} ${op} ${b} = ${rightSides[index]}`)
      search(index + 1)
      current.pop()
    }
    counts[a]++
    counts[b]++
  }
}

search(0)
console.log(solutionCount)
if (solutionCount === 1) firstSolution.forEach(line => console.log(line))
