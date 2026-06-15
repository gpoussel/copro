// 🎮 CodinGame Puzzle - nd-vector-sorting
// https://www.codingame.com/training/easy/nd-vector-sorting

const d: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)
const perm: number[] = readline()
  .split(" ")
  .map((x: string): number => parseInt(x, 10) - 1)

const vectors: number[][] = []
for (let i = 0; i < n; i++) {
  vectors.push(
    readline()
      .split(" ")
      .map((x: string): number => parseInt(x, 10))
  )
}

const indices: number[] = []
for (let i = 0; i < n; i++) indices.push(i)

indices.sort((a: number, b: number): number => {
  for (let k = 0; k < d; k++) {
    const c: number = perm[k]
    const diff: number = vectors[a][c] - vectors[b][c]
    if (diff !== 0) return diff
  }
  return 0
})

console.log(indices.map((i: number): number => i + 1).join(" "))
