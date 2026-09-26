// 🎮 CodinGame Puzzle - fix-the-spaces
// https://www.codingame.com/training/medium/fix-the-spaces

const originalText: string = readline()
const wordList: string[] = readline().split(" ").filter((w) => w.length > 0)

const distinctWords: string[] = []
const wordCounts: number[] = []
for (const w of wordList) {
  const idx = distinctWords.indexOf(w)
  if (idx >= 0) wordCounts[idx]++
  else {
    distinctWords.push(w)
    wordCounts.push(1)
  }
}

let solutionCount = 0
let firstSolution: string[] = []
const current: string[] = []
// States (position + remaining counts) known to lead to no solution
const deadStates = new Set<string>()

function search(pos: number): void {
  if (pos === originalText.length) {
    solutionCount++
    if (solutionCount === 1) firstSolution = current.slice()
    return
  }
  const key = pos + ":" + wordCounts.join(",")
  if (deadStates.has(key)) return
  const before = solutionCount
  for (let i = 0; i < distinctWords.length && solutionCount < 2; i++) {
    if (wordCounts[i] === 0) continue
    const w = distinctWords[i]
    if (originalText.substr(pos, w.length) !== w) continue
    wordCounts[i]--
    current.push(w)
    search(pos + w.length)
    current.pop()
    wordCounts[i]++
  }
  if (solutionCount === before) deadStates.add(key)
}

search(0)
console.log(solutionCount === 1 ? firstSolution.join(" ") : "Unsolvable")
