// 🎮 CodinGame Puzzle - battleship-solitaire
// https://www.codingame.com/training/hard/battleship-solitaire

// Cell-branching backtracking. Every ship placement (with the water ring around
// it) is precomputed and statically checked against the clues. At each node we
// pick a cell and decide which placement covers it (or that it is water):
// uncovered ship clues first (fewest candidates), otherwise the first free cell
// of the tightest row/column. Rows/columns must keep enough free cells for their
// remaining count, which prunes the search strongly.

const bsN = parseInt(readline())
const colTarget = readline().trim().split(/\s+/).map(Number)
const rowTarget = readline().trim().split(/\s+/).map(Number)
readline() // ships count
const shipLengths = readline().trim().split(/\s+/).map(Number)
const hints: string[] = []
for (let i = 0; i < bsN; i++) hints.push(readline().trim())

interface Placement {
  len: number
  cells: number[]
  ring: number[]
  rows: number[]
  cols: number[]
}

const total = bsN * bsN
const isShip = new Uint8Array(total)
const blocked = new Int32Array(total)
const rowCnt = new Int32Array(bsN)
const colCnt = new Int32Array(bsN)
const remaining = new Int32Array(6)
for (const l of shipLengths) remaining[l]++
const hintAt = (idx: number): string => hints[Math.floor(idx / bsN)][idx % bsN]
const isShipHint = (idx: number): boolean => hintAt(idx) !== "." && hintAt(idx) !== "x"
for (let i = 0; i < total; i++) if (hintAt(i) === "x") blocked[i]++
const hintCells: number[] = []
for (let i = 0; i < total; i++) if (isShipHint(i)) hintCells.push(i)

// Precompute statically valid placements
const covering: Placement[][] = Array.from({ length: total }, () => [])
for (const len of new Set(shipLengths)) {
  for (const vertical of len === 1 ? [false] : [false, true]) {
    for (let r = 0; r + (vertical ? len - 1 : 0) < bsN; r++) {
      for (let c = 0; c + (vertical ? 0 : len - 1) < bsN; c++) {
        const cells: number[] = []
        let ok = true
        for (let i = 0; i < len && ok; i++) {
          const rr = vertical ? r + i : r
          const cc = vertical ? c : c + i
          const h = hints[rr][cc]
          if (h === "x" || rowTarget[rr] === 0 || colTarget[cc] === 0) ok = false
          else if (h !== ".") {
            let role: string
            if (len === 1) role = "o"
            else if (i === 0) role = vertical ? "^" : "<"
            else if (i === len - 1) role = vertical ? "v" : ">"
            else role = "#"
            if (h !== role) ok = false
          }
          cells.push(rr * bsN + cc)
        }
        if (!ok) continue
        if (vertical ? colTarget[c] < len : rowTarget[r] < len) continue
        const r1 = vertical ? r + len - 1 : r
        const c1 = vertical ? c : c + len - 1
        const ring: number[] = []
        for (let rr = r - 1; rr <= r1 + 1; rr++) {
          for (let cc = c - 1; cc <= c1 + 1; cc++) {
            if (rr < 0 || cc < 0 || rr >= bsN || cc >= bsN) continue
            if (rr >= r && rr <= r1 && cc >= c && cc <= c1) continue
            if (isShipHint(rr * bsN + cc)) ok = false
            ring.push(rr * bsN + cc)
          }
        }
        if (!ok) continue
        const rows = cells.map(x => Math.floor(x / bsN))
        const cols = cells.map(x => x % bsN)
        const p: Placement = { len, cells, ring, rows, cols }
        for (const x of cells) covering[x].push(p)
      }
    }
  }
}

const available = (idx: number): boolean => isShip[idx] === 0 && blocked[idx] === 0

const canPlace = (p: Placement): boolean => {
  if (remaining[p.len] === 0) return false
  for (const x of p.cells) if (!available(x)) return false
  for (const r of p.rows) rowCnt[r]++
  for (const c of p.cols) colCnt[c]++
  let ok = true
  for (const r of p.rows) if (rowCnt[r] > rowTarget[r]) ok = false
  for (const c of p.cols) if (colCnt[c] > colTarget[c]) ok = false
  for (const r of p.rows) rowCnt[r]--
  for (const c of p.cols) colCnt[c]--
  return ok
}

const place = (p: Placement, sign: number): void => {
  remaining[p.len] -= sign
  for (const x of p.cells) isShip[x] = sign > 0 ? 1 : 0
  for (const x of p.ring) blocked[x] += sign
  for (const r of p.rows) rowCnt[r] += sign
  for (const c of p.cols) colCnt[c] += sign
}

const solve = (): boolean => {
  // Feasibility of lines and clue cells
  let bestLine = -1
  let bestSlack = Infinity
  let done = true
  for (let k = 0; k < 2 * bsN; k++) {
    const isRow = k < bsN
    const line = k % bsN
    const deficit = isRow ? rowTarget[line] - rowCnt[line] : colTarget[line] - colCnt[line]
    if (deficit === 0) continue
    done = false
    let free = 0
    for (let j = 0; j < bsN; j++) if (available(isRow ? line * bsN + j : j * bsN + line)) free++
    if (free < deficit) return false
    if (free - deficit < bestSlack) {
      bestSlack = free - deficit
      bestLine = k
    }
  }
  let bestHint: Placement[] | null = null
  for (const h of hintCells) {
    if (isShip[h]) continue
    if (!available(h)) return false
    const opts = covering[h].filter(canPlace)
    if (opts.length === 0) return false
    if (bestHint === null || opts.length < bestHint.length) bestHint = opts
  }
  if (done) {
    for (let l = 1; l <= 5; l++) if (remaining[l] !== 0) return false
    return true
  }
  if (bestHint !== null) {
    for (const p of bestHint) {
      place(p, 1)
      if (solve()) return true
      place(p, -1)
    }
    return false
  }
  // First free cell of the tightest line: a ship covers it, or it is water
  const isRow = bestLine < bsN
  const line = bestLine % bsN
  let cell = -1
  for (let j = 0; j < bsN && cell < 0; j++) {
    const idx = isRow ? line * bsN + j : j * bsN + line
    if (available(idx)) cell = idx
  }
  for (const p of covering[cell]) {
    if (!canPlace(p)) continue
    place(p, 1)
    if (solve()) return true
    place(p, -1)
  }
  blocked[cell]++
  if (solve()) return true
  blocked[cell]--
  return false
}

solve()
for (let r = 0; r < bsN; r++) {
  let out = ""
  for (let c = 0; c < bsN; c++) out += isShip[r * bsN + c] ? "o" : "x"
  console.log(out)
}
