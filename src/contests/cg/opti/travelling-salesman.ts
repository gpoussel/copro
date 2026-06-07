// 🎮 CodinGame Optimization - travelling-salesman
// https://www.codingame.com/training/optim/travelling-salesman
//
// Read N points, output a tour starting and ending at index 0 that visits every
// point once. Score is based on the tour length, so we build a nearest-neighbor
// tour then refine it with 2-opt and Or-opt within the 5s budget.

const startTime = Date.now()
const TIME_LIMIT = 4500

const n = parseInt(readline())
const xs: number[] = new Array(n)
const ys: number[] = new Array(n)
for (let i = 0; i < n; i++) {
  const [x, y] = readline().split(" ").map(Number)
  xs[i] = x
  ys[i] = y
}

// Full distance matrix (N <= 300 -> at most 90k entries).
const dist = new Float64Array(n * n)
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    const dx = xs[i] - xs[j]
    const dy = ys[i] - ys[j]
    const d = Math.sqrt(dx * dx + dy * dy)
    dist[i * n + j] = d
    dist[j * n + i] = d
  }
}
const D = (a: number, b: number): number => dist[a * n + b]

// Trivial cases: nothing to optimize.
if (n <= 1) {
  console.log("0 0")
} else if (n === 2) {
  console.log("0 1 0")
} else {
  // --- Nearest-neighbor construction starting from 0 ---
  const visited = new Array<boolean>(n).fill(false)
  const tour: number[] = [0]
  visited[0] = true
  let current = 0
  for (let k = 1; k < n; k++) {
    let best = -1
    let bestDist = Infinity
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const d = D(current, j)
        if (d < bestDist) {
          bestDist = d
          best = j
        }
      }
    }
    visited[best] = true
    tour.push(best)
    current = best
  }

  // The tour is treated as a cycle: edge from tour[n-1] back to tour[0] = 0.
  // 2-opt and Or-opt only touch positions 1..n-1, so index 0 stays put.
  const next = (i: number): number => (i + 1) % n

  const tourLength = (t: number[]): number => {
    let len = 0
    for (let i = 0; i < n; i++) len += D(t[i], t[next(i)])
    return len
  }

  // --- 2-opt: reverse the segment between two edges if it shortens the tour ---
  const twoOptPass = (tour: number[]): boolean => {
    let improved = false
    for (let i = 0; i < n - 1; i++) {
      const a = tour[i]
      const b = tour[i + 1]
      const dab = D(a, b)
      for (let j = i + 2; j < n; j++) {
        const c = tour[j]
        const d = tour[next(j)]
        if (d === a) continue // adjacent wrap-around edge, skip
        const delta = D(a, c) + D(b, d) - dab - D(c, d)
        if (delta < -1e-9) {
          // reverse tour[i+1 .. j]
          let lo = i + 1
          let hi = j
          while (lo < hi) {
            const t = tour[lo]
            tour[lo] = tour[hi]
            tour[hi] = t
            lo++
            hi--
          }
          improved = true
          break // edge (a,b) changed, move on
        }
      }
      if ((i & 31) === 0 && Date.now() - startTime > TIME_LIMIT) return improved
    }
    return improved
  }

  // --- Or-opt: move a chain of length L to a better position ---
  const orOptPass = (tour: number[], segLen: number): boolean => {
    let improved = false
    for (let i = 1; i + segLen <= n; i++) {
      const p = tour[i - 1]
      const s0 = tour[i]
      const s1 = tour[i + segLen - 1]
      const q = tour[next(i + segLen - 1)]
      const removed = D(p, s0) + D(s1, q) - D(p, q)
      if (removed <= 1e-9) continue
      let bestJ = -1
      let bestGain = 1e-9
      for (let j = 0; j < n - 1; j++) {
        if (j >= i - 1 && j <= i + segLen - 1) continue // can't insert inside/adjacent
        const u = tour[j]
        const v = tour[j + 1]
        const added = D(u, s0) + D(s1, v) - D(u, v)
        const gain = removed - added
        if (gain > bestGain) {
          bestGain = gain
          bestJ = j
        }
      }
      if (bestJ >= 0) {
        const seg = tour.splice(i, segLen)
        const insertAt = bestJ < i ? bestJ + 1 : bestJ + 1 - segLen
        tour.splice(insertAt, 0, ...seg)
        improved = true
      }
      if ((i & 31) === 0 && Date.now() - startTime > TIME_LIMIT) return improved
    }
    return improved
  }

  // Run 2-opt + Or-opt until no move helps or we run out of time.
  const localSearch = (tour: number[]): void => {
    let keepGoing = true
    while (keepGoing && Date.now() - startTime < TIME_LIMIT) {
      keepGoing = false
      if (twoOptPass(tour)) keepGoing = true
      if (Date.now() - startTime > TIME_LIMIT) break
      if (orOptPass(tour, 1)) keepGoing = true
      if (orOptPass(tour, 2)) keepGoing = true
      if (orOptPass(tour, 3)) keepGoing = true
    }
  }

  // A simple deterministic pseudo-random generator (avoids relying on Math.random
  // seeding and keeps runs reproducible).
  let seed = 123456789
  const rand = (m: number): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % m
  }

  // Double-bridge: cut the tour (positions 1..n-1, leaving 0 fixed) into four
  // pieces A|B|C|D and reconnect as A|C|B|D. This is the classic ILS kick that
  // 2-opt cannot easily undo, letting us escape local optima.
  const doubleBridge = (tour: number[]): number[] => {
    const p1 = 1 + rand(n - 3)
    const p2 = p1 + 1 + rand(n - p1 - 2)
    const p3 = p2 + 1 + rand(n - p2 - 1)
    return [
      ...tour.slice(0, p1),
      ...tour.slice(p2, p3),
      ...tour.slice(p1, p2),
      ...tour.slice(p3),
    ]
  }

  localSearch(tour)
  let best = tour.slice()
  let bestLen = tourLength(best)

  // Iterated local search: kick + re-optimize, keep the best, until time runs out.
  if (n >= 8) {
    while (Date.now() - startTime < TIME_LIMIT) {
      const candidate = doubleBridge(best)
      localSearch(candidate)
      const len = tourLength(candidate)
      if (len < bestLen) {
        bestLen = len
        best = candidate
      }
    }
  }

  console.log(best.join(" ") + " 0")
}
