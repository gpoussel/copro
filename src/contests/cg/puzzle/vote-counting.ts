// 🎮 CodinGame Puzzle - vote-counting
// https://www.codingame.com/training/medium/vote-counting

const N: number = parseInt(readline(), 10)
const M: number = parseInt(readline(), 10)
const limit = new Map<string, number>()
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  const nb = parseInt(parts[parts.length - 1], 10)
  const name = parts.slice(0, parts.length - 1).join(" ")
  limit.set(name, nb)
}
const votes: Array<[string, string]> = []
const counts = new Map<string, number>()
for (let i = 0; i < M; i++) {
  const parts = readline().split(" ")
  const value = parts[parts.length - 1]
  const name = parts.slice(0, parts.length - 1).join(" ")
  votes.push([name, value])
  counts.set(name, (counts.get(name) ?? 0) + 1)
}
let yes = 0,
  no = 0
for (const [name, value] of votes) {
  if (!limit.has(name)) continue
  if ((counts.get(name) ?? 0) > (limit.get(name) ?? 0)) continue
  if (value === "Yes") yes++
  else if (value === "No") no++
}
console.log(yes + " " + no)
