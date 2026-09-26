// 🎮 CodinGame Puzzle - alternative-vote
// https://www.codingame.com/training/hard/alternative-vote

// Each round, every ballot counts for its first non-eliminated candidate; the
// candidate with the fewest votes (earliest in the list on ties) is eliminated.
const C = Number(readline())
const names: string[] = []
for (let i = 0; i < C; i++) names.push(readline())
const V = Number(readline())
const ballots: number[][] = []
for (let i = 0; i < V; i++)
  ballots.push(
    readline()
      .trim()
      .split(/\s+/)
      .map(x => Number(x) - 1)
  )

const eliminated = new Array<boolean>(C).fill(false)
for (let round = 1; round < C; round++) {
  const votes = new Array<number>(C).fill(0)
  for (const b of ballots) {
    const choice = b.find(c => !eliminated[c])
    if (choice !== undefined) votes[choice]++
  }
  let loser = -1
  for (let c = 0; c < C; c++) if (!eliminated[c] && (loser < 0 || votes[c] < votes[loser])) loser = c
  eliminated[loser] = true
  console.log(names[loser])
}
console.log(`winner:${names[eliminated.indexOf(false)]}`)
