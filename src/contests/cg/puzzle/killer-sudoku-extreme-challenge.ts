// 🎮 CodinGame Puzzle - killer-sudoku-extreme-challenge
// https://www.codingame.com/training/hard/killer-sudoku-extreme-challenge

// Bitmask candidates + constraint propagation + MRV backtracking.
// Propagation: naked singles and hidden singles on the 27 units, and for each
// cage the union of the digit combinations (of the right size and remaining sum,
// disjoint from already-placed digits, coverable by the free cells' candidates)
// restricts the free cells' candidates.

const popcount = new Uint8Array(512)
const digitSum = new Uint8Array(512)
for (let m = 1; m < 512; m++) {
  popcount[m] = popcount[m >> 1] + (m & 1)
  let s = 0
  for (let d = 0; d < 9; d++) if (m & (1 << d)) s += d + 1
  digitSum[m] = s
}
// combos[k * 46 + s] = masks of k distinct digits summing to s
const combos: number[][] = []
for (let i = 0; i < 10 * 46; i++) combos.push([])
for (let m = 1; m < 512; m++) combos[popcount[m] * 46 + digitSum[m]].push(m)

const units: number[][] = []
for (let i = 0; i < 9; i++) {
  const row: number[] = []
  const col: number[] = []
  const box: number[] = []
  for (let j = 0; j < 9; j++) {
    row.push(i * 9 + j)
    col.push(j * 9 + i)
    box.push((Math.floor(i / 3) * 3 + Math.floor(j / 3)) * 9 + (i % 3) * 3 + (j % 3))
  }
  units.push(row, col, box)
}

const single = (m: number): boolean => m !== 0 && (m & (m - 1)) === 0
const valueOf = (m: number): number => 31 - Math.clz32(m) + 1

const solvePuzzle = (layout: string, values: string): number[] => {
  const sums = new Map<string, number>()
  for (const tok of values.trim().split(/\s+/)) {
    const [k, v] = tok.split("=")
    sums.set(k, parseInt(v))
  }
  const cageMap = new Map<string, number[]>()
  for (let i = 0; i < 81; i++) {
    const c = layout[i]
    if (!cageMap.has(c)) cageMap.set(c, [])
    cageMap.get(c)!.push(i)
  }
  const cages: { cells: number[]; sum: number }[] = []
  for (const [k, cells] of cageMap) cages.push({ cells, sum: sums.get(k)! })

  const propagate = (cand: Uint16Array): boolean => {
    let changed = true
    while (changed) {
      changed = false
      for (const unit of units) {
        let fixed = 0
        for (const c of unit) {
          const m = cand[c]
          if (single(m)) {
            if (fixed & m) return false
            fixed |= m
          }
        }
        for (const c of unit) {
          const m = cand[c]
          if (!single(m)) {
            const n = m & ~fixed
            if (n === 0) return false
            if (n !== m) {
              cand[c] = n
              changed = true
            }
          }
        }
        // hidden singles
        for (let d = 0; d < 9; d++) {
          const bit = 1 << d
          if (fixed & bit) continue
          let where = -1
          let cnt = 0
          for (const c of unit)
            if (cand[c] & bit) {
              cnt++
              where = c
            }
          if (cnt === 0) return false
          if (cnt === 1) {
            cand[where] = bit
            changed = true
          }
        }
      }
      for (const cage of cages) {
        let used = 0
        let usedSum = 0
        let usedCnt = 0
        const free: number[] = []
        for (const c of cage.cells) {
          const m = cand[c]
          if (single(m)) {
            used |= m
            usedSum += valueOf(m)
            usedCnt++
          } else free.push(c)
        }
        if (popcount[used] !== usedCnt) return false
        const rest = cage.sum - usedSum
        if (free.length === 0) {
          if (rest !== 0) return false
          continue
        }
        if (rest <= 0 || rest > 45) return false
        let allowed = 0
        for (const m of combos[free.length * 46 + rest]) {
          if (m & used) continue
          let cover = 0
          let ok = true
          for (const c of free) {
            const x = cand[c] & m
            if (!x) {
              ok = false
              break
            }
            cover |= x
          }
          if (ok && cover === m) allowed |= m
        }
        if (!allowed) return false
        for (const c of free) {
          const n = cand[c] & allowed
          if (n === 0) return false
          if (n !== cand[c]) {
            cand[c] = n
            changed = true
          }
        }
      }
    }
    return true
  }

  const search = (cand: Uint16Array): Uint16Array | null => {
    if (!propagate(cand)) return null
    let best = -1
    let bestCnt = 10
    for (let i = 0; i < 81; i++) {
      const p = popcount[cand[i]]
      if (p > 1 && p < bestCnt) {
        bestCnt = p
        best = i
        if (p === 2) break
      }
    }
    if (best < 0) return cand
    let m = cand[best]
    while (m) {
      const bit = m & -m
      m ^= bit
      const next = cand.slice()
      next[best] = bit
      const res = search(next)
      if (res) return res
    }
    return null
  }

  const res = search(new Uint16Array(81).fill(511))!
  return Array.from(res, valueOf)
}

const numPuzzles = parseInt(readline())
const layouts: string[] = []
for (let i = 0; i < numPuzzles; i++) layouts.push(readline().trim())
const total = new Array<number>(81).fill(0)
for (let i = 0; i < numPuzzles; i++) {
  const sol = solvePuzzle(layouts[i], readline())
  for (let j = 0; j < 81; j++) total[j] += sol[j]
}
for (let r = 0; r < 9; r++) console.log(total.slice(r * 9, r * 9 + 9).join(" "))
