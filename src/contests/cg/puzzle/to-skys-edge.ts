// 🎮 CodinGame Puzzle - to-skys-edge
// https://www.codingame.com/training/hard/to-skys-edge

// People are grouped by birth year. With prefix sums over cohort sizes, both
// the living population (born in [t-L, t]) and the fertile crowd (ages in
// [20, L/2]) are O(1) queries, so each life expectancy L is simulated in O(Y).
// Beyond L = 2 * (oldest possible age) + 2 nothing changes, which bounds the scan.

const years = parseInt(readline())
const capacity = parseInt(readline())
const n = parseInt(readline())
const groups: [number, number][] = []
let maxAge = 0
for (let i = 0; i < n; i++) {
  const [age, count] = readline().split(" ").map(Number)
  groups.push([age, count])
  maxAge = Math.max(maxAge, age)
}

// birth year b is stored at index b + offset (index 0 stays an empty sentinel)
const offset = maxAge + 1
const size = offset + years + 1
const initial = new Float64Array(size)
for (const [age, count] of groups) initial[offset - age] += count
const prefix = new Float64Array(size)

const succeeds = (life: number): boolean => {
  prefix[0] = 0
  for (let i = 1; i <= offset; i++) prefix[i] = prefix[i - 1] + initial[i]
  const sum = (from: number, to: number): number => {
    // total born in birth years [from, to]
    const hi = Math.min(to + offset, size - 1)
    const lo = Math.max(from + offset - 1, 0)
    return hi <= lo ? 0 : prefix[hi] - prefix[lo]
  }
  const half = Math.floor(life / 2)
  for (let t = 1; t <= years; t++) {
    const fertile = half >= 20 ? sum(t - half, t - 20) : 0
    const babies = Math.floor(fertile / 10)
    prefix[t + offset] = prefix[t + offset - 1] + babies
    const alive = sum(t - life, t)
    if (alive > capacity) return false
    if (alive === 0) return false
  }
  return sum(years - life, years) >= 200
}

const limit = 2 * (maxAge + years) + 2
let lo = -1
let hi = -1
for (let life = 0; life <= limit; life++) {
  if (succeeds(life)) {
    if (lo < 0) lo = life
    hi = life
  }
}
console.log(`${lo} ${hi}`)
