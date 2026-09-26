// 🎮 CodinGame Puzzle - nurikabe
// https://www.codingame.com/training/expert/nurikabe

// Each clue gets the list of every island shape it could take (connected
// sets of its size, avoiding other clues and their neighbours). Propagation:
// - shapes clashing with known cells (or whose border touches an island) die
// - cells common to all shapes of a clue are island, common border is water
// - cells no shape can cover are water
// - a 2x2 block with three water cells forces its last cell to be island
// - known water must stay connected through non-island cells
// When stuck, branch on the clue with the fewest remaining shapes.

const gridSize = Number(readline())
const total = gridSize * gridSize
const rows: string[] = []
for (let r = 0; r < gridSize; r++) rows.push(readline())

const WATER = -1
const UNKNOWN = -2

const nbrs: number[][] = []
for (let c = 0; c < total; c++) {
  const r = Math.floor(c / gridSize)
  const col = c % gridSize
  const list: number[] = []
  if (r > 0) list.push(c - gridSize)
  if (r < gridSize - 1) list.push(c + gridSize)
  if (col > 0) list.push(c - 1)
  if (col < gridSize - 1) list.push(c + 1)
  nbrs.push(list)
}

const clueCell: number[] = []
const clueSize: number[] = []
const clueAt = new Int32Array(total).fill(-1)
for (let r = 0; r < gridSize; r++) {
  for (let c = 0; c < gridSize; c++) {
    const ch = rows[r][c]
    if (ch >= "1" && ch <= "9") {
      clueAt[r * gridSize + c] = clueCell.length
      clueCell.push(r * gridSize + c)
      clueSize.push(Number(ch))
    }
  }
}
const clueCount = clueCell.length

// global shape store: cells and border of every shape
const shapeCells: number[][] = []
const shapeBorder: number[][] = []

const enumerateShapes = (ci: number): number[] => {
  const root = clueCell[ci]
  const size = clueSize[ci]
  const allowed = new Uint8Array(total)
  for (let c = 0; c < total; c++) {
    if (clueAt[c] >= 0 && clueAt[c] !== ci) continue
    if (nbrs[c].some(n => clueAt[n] >= 0 && clueAt[n] !== ci)) continue
    allowed[c] = 1
  }
  const ids: number[] = []
  const inSet = new Uint8Array(total)
  const marked = new Uint8Array(total) // in set, in extension, or banned
  const current: number[] = [root]
  inSet[root] = 1
  marked[root] = 1
  const emit = (): void => {
    const border: number[] = []
    const seen = new Set<number>()
    for (const c of current) {
      for (const n of nbrs[c]) {
        if (!inSet[n] && !seen.has(n)) {
          seen.add(n)
          border.push(n)
        }
      }
    }
    ids.push(shapeCells.length)
    shapeCells.push(current.slice())
    shapeBorder.push(border)
  }
  const rec = (ext: number[]): void => {
    if (current.length === size) {
      emit()
      return
    }
    const pending = ext.slice()
    while (pending.length > 0) {
      const w = pending.pop()!
      const added: number[] = []
      for (const n of nbrs[w]) {
        if (allowed[n] && !marked[n]) {
          marked[n] = 1
          added.push(n)
        }
      }
      current.push(w)
      inSet[w] = 1
      rec(pending.concat(added))
      current.pop()
      inSet[w] = 0
      for (const n of added) marked[n] = 0
      // w stays marked (owned by an ancestor): excluded for later siblings
    }
  }
  const firstExt: number[] = []
  for (const n of nbrs[root]) {
    if (allowed[n]) {
      marked[n] = 1
      firstExt.push(n)
    }
  }
  rec(firstExt)
  return ids
}

type NuriState = { cell: Int8Array; cand: number[][] }

const initial: NuriState = { cell: new Int8Array(total).fill(UNKNOWN), cand: [] }
for (let i = 0; i < clueCount; i++) {
  initial.cell[clueCell[i]] = i
  initial.cand.push(enumerateShapes(i))
}

const knownCount = new Int32Array(clueCount)
const hit = new Int32Array(total)
const hitClue = new Int32Array(total)

const propagate = (st: NuriState): boolean => {
  const cell = st.cell
  for (let changed = true; changed; ) {
    changed = false
    knownCount.fill(0)
    for (let c = 0; c < total; c++) if (cell[c] >= 0) knownCount[cell[c]]++
    const coverCount = new Int32Array(total)
    const coverClue = new Int32Array(total).fill(-1)
    for (let i = 0; i < clueCount; i++) {
      const kept: number[] = []
      for (const s of st.cand[i]) {
        let ok = true
        let mine = 0
        for (const c of shapeCells[s]) {
          const v = cell[c]
          if (v === i) mine++
          else if (v !== UNKNOWN) {
            ok = false
            break
          }
        }
        if (!ok || mine !== knownCount[i]) continue
        for (const c of shapeBorder[s]) {
          if (cell[c] >= 0) {
            ok = false
            break
          }
        }
        if (ok) kept.push(s)
      }
      if (kept.length === 0) return false
      st.cand[i] = kept
      // intersections
      hit.fill(0)
      hitClue.fill(0)
      for (const s of kept) {
        for (const c of shapeCells[s]) hit[c]++
        for (const c of shapeBorder[s]) hitClue[c]++
      }
      for (let c = 0; c < total; c++) {
        if (hit[c] > 0) {
          coverCount[c]++
          coverClue[c] = i
        }
        if (hit[c] === kept.length && cell[c] === UNKNOWN) {
          cell[c] = i
          changed = true
        }
        if (hitClue[c] === kept.length && cell[c] === UNKNOWN) {
          cell[c] = WATER
          changed = true
        }
      }
    }
    for (let c = 0; c < total; c++) {
      if (cell[c] === UNKNOWN && coverCount[c] === 0) {
        cell[c] = WATER
        changed = true
      }
    }
    // 2x2 pools
    for (let r = 0; r + 1 < gridSize; r++) {
      for (let q = 0; q + 1 < gridSize; q++) {
        const a = r * gridSize + q
        const block = [a, a + 1, a + gridSize, a + gridSize + 1]
        let water = 0
        let free = -1
        for (const c of block) {
          if (cell[c] === WATER) water++
          else if (cell[c] === UNKNOWN) free = c
        }
        if (water === 4) return false
        if (water === 3 && free >= 0 && coverCount[free] === 1) {
          cell[free] = coverClue[free]
          changed = true
        }
      }
    }
    // water connectivity through non-island cells
    let start = -1
    let waterTotal = 0
    for (let c = 0; c < total; c++) {
      if (cell[c] === WATER) {
        waterTotal++
        if (start < 0) start = c
      }
    }
    if (start >= 0) {
      const seen = new Uint8Array(total)
      const stack = [start]
      seen[start] = 1
      let reached = 0
      while (stack.length > 0) {
        const c = stack.pop()!
        if (cell[c] === WATER) reached++
        for (const n of nbrs[c]) {
          if (!seen[n] && cell[n] < 0) {
            seen[n] = 1
            stack.push(n)
          }
        }
      }
      if (reached !== waterTotal) return false
    }
  }
  return true
}

const solveNuri = (st: NuriState): NuriState | null => {
  if (!propagate(st)) return null
  let pick = -1
  for (let i = 0; i < clueCount; i++) {
    if (st.cand[i].length > 1 && (pick < 0 || st.cand[i].length < st.cand[pick].length)) pick = i
  }
  if (pick < 0) {
    // all islands fixed: every other cell is water, checked by propagation
    for (let c = 0; c < total; c++) if (st.cell[c] === UNKNOWN) st.cell[c] = WATER
    return propagate(st) ? st : null
  }
  for (const s of st.cand[pick]) {
    const next: NuriState = { cell: st.cell.slice(), cand: st.cand.slice() }
    next.cand[pick] = [s]
    const res = solveNuri(next)
    if (res) return res
  }
  return null
}

const solved = solveNuri(initial)!
const out: string[] = []
for (let r = 0; r < gridSize; r++) {
  let line = ""
  for (let c = 0; c < gridSize; c++) {
    const v = solved.cell[r * gridSize + c]
    line += v === WATER ? "~" : String(clueSize[v])
  }
  out.push(line)
}
console.log(out.join("\n"))
