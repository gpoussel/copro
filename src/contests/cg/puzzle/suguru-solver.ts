// 🎮 CodinGame Puzzle - suguru-solver
// https://www.codingame.com/training/medium/suguru-solver

const [w, h] = readline().split(" ").map(Number)
const letters: string[] = []
const values: number[] = []
for (let r = 0; r < h; r++) {
  for (const cell of readline().trim().split(/\s+/)) {
    letters.push(cell[0])
    values.push(cell[1] === "." ? 0 : Number(cell[1]))
  }
}
const size = w * h

// Cages: 4-connected components sharing the same letter
const cageOf: number[] = new Array<number>(size).fill(-1)
const cages: number[][] = []
for (let start = 0; start < size; start++) {
  if (cageOf[start] >= 0) continue
  const cage: number[] = [start]
  cageOf[start] = cages.length
  for (let i = 0; i < cage.length; i++) {
    const cell = cage[i]
    const r = Math.floor(cell / w)
    const c = cell % w
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue
      const next = nr * w + nc
      if (cageOf[next] < 0 && letters[next] === letters[cell]) {
        cageOf[next] = cages.length
        cage.push(next)
      }
    }
  }
  cages.push(cage)
}

// King-move neighbours
const neighbours: number[][] = []
for (let cell = 0; cell < size; cell++) {
  const r = Math.floor(cell / w)
  const c = cell % w
  const list: number[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr
      const nc = c + dc
      if ((dr || dc) && nr >= 0 && nc >= 0 && nr < h && nc < w) list.push(nr * w + nc)
    }
  }
  neighbours.push(list)
}

/** Bitmask of the digits still allowed in an empty cell. */
function candidates(cell: number): number {
  const cage = cages[cageOf[cell]]
  let mask = ((1 << cage.length) - 1) << 1
  for (const other of cage) mask &= ~(1 << values[other])
  for (const other of neighbours[cell]) mask &= ~(1 << values[other])
  return mask
}

const bitCount = (mask: number): number => {
  let count = 0
  for (; mask; mask &= mask - 1) count++
  return count
}

function solve(): boolean {
  // Pick the most constrained choice: either a cell with few candidates,
  // or a digit of a cage with few possible cells
  let bestCount = Infinity
  let bestOptions: [number, number][] = []
  const masks: number[] = new Array<number>(size).fill(0)
  for (let cell = 0; cell < size; cell++) {
    if (values[cell] !== 0) continue
    const mask = (masks[cell] = candidates(cell))
    const count = bitCount(mask)
    if (count === 0) return false
    if (count < bestCount) {
      bestCount = count
      bestOptions = []
      for (let v = 1; v <= 6; v++) if (mask & (1 << v)) bestOptions.push([cell, v])
    }
  }
  if (bestCount === Infinity) return true
  if (bestCount > 1) {
    for (const cage of cages) {
      for (let v = 1; v <= cage.length; v++) {
        if (cage.some(cell => values[cell] === v)) continue
        const places = cage.filter(cell => values[cell] === 0 && masks[cell] & (1 << v))
        if (places.length === 0) return false
        if (places.length < bestCount) {
          bestCount = places.length
          bestOptions = places.map((cell): [number, number] => [cell, v])
        }
      }
    }
  }
  for (const [cell, v] of bestOptions) {
    values[cell] = v
    if (solve()) return true
    values[cell] = 0
  }
  return false
}

solve()
for (let r = 0; r < h; r++) console.log(values.slice(r * w, (r + 1) * w).join(""))
