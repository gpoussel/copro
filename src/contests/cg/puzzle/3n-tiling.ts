// 🎮 CodinGame Puzzle - 3n-tiling
// https://www.codingame.com/training/medium/3n-tiling

// Column-by-column profile DP. State: for each row, how many columns (0..2) starting at the
// current one are already covered by pieces placed earlier. Encoded in base 3.
const MOD = 1e9 + 7

const buildTransitions = (k: number): number[][] => {
  const states = Math.pow(3, k)
  const transitions: number[][] = []
  for (let s = 0; s < states; s++) {
    const cover: number[] = []
    for (let r = 0, x = s; r < k; r++, x = Math.floor(x / 3)) cover.push(x % 3)
    const next: number[] = []
    // Fill the current column row by row; `out` is the coverage carried to the next column
    const place = (r: number, out: number[]) => {
      if (r === k) {
        next.push(out.reduce((acc, v, i) => acc + v * Math.pow(3, i), 0))
        return
      }
      if (out[r] >= 0) return place(r + 1, out)
      // Horizontal 3x1 starting here
      out[r] = 2
      place(r + 1, out)
      // 2x2 square covering rows r and r+1
      if (r + 1 < k && out[r + 1] < 0) {
        out[r] = out[r + 1] = 1
        place(r + 2, out)
        out[r + 1] = -1
      }
      // Vertical 3x1 spanning rows r..r+2
      if (r + 2 < k && out[r + 1] < 0 && out[r + 2] < 0) {
        out[r] = out[r + 1] = out[r + 2] = 0
        place(r + 3, out)
        out[r + 1] = out[r + 2] = -1
      }
      out[r] = -1
    }
    // Rows already covered just decrease their remaining coverage; free rows are marked -1
    place(0, cover.map(c => (c > 0 ? c - 1 : -1)))
    transitions.push(next)
  }
  return transitions
}

const t = parseInt(readline())
const queries: [number, number][] = []
for (let i = 0; i < t; i++) {
  const [k, n] = readline().split(" ").map(Number)
  queries.push([k, n])
}

const answers: { [key: string]: number } = {}
for (let k = 1; k <= 3; k++) {
  const wanted = queries.filter(q => q[0] === k).map(q => q[1])
  if (!wanted.length) continue
  const maxN = Math.max(...wanted)
  const transitions = buildTransitions(k)
  const size = transitions.length
  let dp = new Float64Array(size)
  let next = new Float64Array(size)
  dp[0] = 1
  for (let n = 1; n <= maxN; n++) {
    next.fill(0)
    for (let s = 0; s < size; s++) {
      const ways = dp[s]
      if (!ways) continue
      for (const target of transitions[s]) next[target] += ways
    }
    for (let s = 0; s < size; s++) next[s] %= MOD
    const tmp = dp
    dp = next
    next = tmp
    if (wanted.indexOf(n) >= 0) answers[`${k} ${n}`] = dp[0]
  }
}
for (const [k, n] of queries) console.log(answers[`${k} ${n}`])
