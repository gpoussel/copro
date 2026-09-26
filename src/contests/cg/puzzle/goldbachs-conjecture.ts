// 🎮 CodinGame Puzzle - goldbachs-conjecture
// https://www.codingame.com/training/medium/goldbachs-conjecture

const queryCount = parseInt(readline())
const queries: number[] = []
for (let i = 0; i < queryCount; i++) queries.push(parseInt(readline()))

const limit = Math.max(...queries)
const composite = new Uint8Array(limit + 1)
composite[0] = composite[1] = 1
for (let i = 2; i * i <= limit; i++) {
  if (composite[i]) continue
  for (let j = i * i; j <= limit; j += i) composite[j] = 1
}

for (const m of queries) {
  let couples = 0
  for (let p = 2; p <= m / 2; p++) if (!composite[p] && !composite[m - p]) couples++
  console.log(couples)
}
