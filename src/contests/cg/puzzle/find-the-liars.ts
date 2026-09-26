// 🎮 CodinGame Puzzle - find-the-liars
// https://www.codingame.com/training/medium/find-the-liars

const n = parseInt(readline())
const liarCount = parseInt(readline())
const sentences: { tellers: number[]; subject: number; claimsLiar: boolean }[] = []
for (let i = 0; i < n; i++) {
  const [chain, value] = readline().trim().split("=")
  const people = chain.split(">").map(Number)
  sentences.push({ tellers: people.slice(0, -1), subject: people[people.length - 1], claimsLiar: value === "L" })
}

const popcount = (m: number) => {
  let count = 0
  for (; m; m &= m - 1) count++
  return count
}

// Each liar in the chain flips the claim, so the reported claim matches reality
// iff the number of liars among the tellers is even
const consistent = (mask: number) =>
  sentences.every(({ tellers, subject, claimsLiar }) => {
    let flips = 0
    for (const t of tellers) flips ^= (mask >> t) & 1
    const subjectLies = ((mask >> subject) & 1) === 1
    return (subjectLies !== claimsLiar ? 1 : 0) === flips
  })

for (let mask = 0; mask < 1 << n; mask++) {
  if (popcount(mask) !== liarCount || !consistent(mask)) continue
  const liars: number[] = []
  for (let i = 0; i < n; i++) if ((mask >> i) & 1) liars.push(i)
  console.log(liars.join(" "))
  break
}
