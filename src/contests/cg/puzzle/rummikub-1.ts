// 🎮 CodinGame Puzzle - rummikub-1
// https://www.codingame.com/training/medium/rummikub-1

interface Tile {
  value: number
  color: string
}
interface Row {
  id: number
  kind: "run" | "set"
  tiles: Tile[] // runs sorted by value, sets sorted by color
}
interface State {
  rows: Row[] // sorted by id
  nextId: number
}

const parseTile = (s: string): Tile => ({ value: Number(s.slice(0, -1)), color: s.slice(-1) })
const tileText = (t: Tile): string => `${t.value}${t.color}`
const sameTile = (a: Tile, b: Tile): boolean => a.value === b.value && a.color === b.color

const goal = parseTile(readline().trim())
const nrow = Number(readline())
const initialRows: Row[] = []
for (let i = 0; i < nrow; i++) {
  const [id, ...tiles] = readline().trim().split(/\s+/)
  const parsed = tiles.map(parseTile)
  const kind = parsed.every(t => t.value === parsed[0].value) ? "set" : "run"
  initialRows.push(makeRow(Number(id), kind, parsed))
}
initialRows.sort((a, b) => a.id - b.id)

function makeRow(id: number, kind: "run" | "set", tiles: Tile[]): Row {
  const sorted = tiles.slice()
  if (kind === "run") sorted.sort((a, b) => a.value - b.value)
  else sorted.sort((a, b) => (a.color < b.color ? -1 : 1))
  return { id, kind, tiles: sorted }
}

/** Builds a run of `color` covering [from, to]. */
function runTiles(color: string, from: number, to: number): Tile[] {
  const tiles: Tile[] = []
  for (let v = from; v <= to; v++) tiles.push({ value: v, color })
  return tiles
}

function withRows(state: State, removed: number[], added: Row[], nextId: number): State {
  const rows = state.rows.filter(r => removed.indexOf(r.id) < 0).concat(added)
  rows.sort((a, b) => a.id - b.id)
  return { rows, nextId }
}

function combine(state: State, a: Row, b: Row): State | null {
  if (a.kind !== "run" || b.kind !== "run" || a.tiles[0].color !== b.tiles[0].color) return null
  const aMin = a.tiles[0].value
  const aMax = a.tiles[a.tiles.length - 1].value
  const bMin = b.tiles[0].value
  const bMax = b.tiles[b.tiles.length - 1].value
  if (aMax + 1 !== bMin && bMax + 1 !== aMin) return null
  const merged = makeRow(a.id, "run", a.tiles.concat(b.tiles))
  return withRows(state, [a.id, b.id], [merged], state.nextId)
}

function take(state: State, row: Row, tile: Tile): State | null {
  const rest = row.tiles.filter(t => !sameTile(t, tile))
  if (row.kind === "set") {
    return rest.length >= 3 ? withRows(state, [row.id], [makeRow(row.id, "set", rest)], state.nextId) : null
  }
  const min = row.tiles[0].value
  const max = row.tiles[row.tiles.length - 1].value
  if (tile.value === min || tile.value === max) {
    return rest.length >= 3 ? withRows(state, [row.id], [makeRow(row.id, "run", rest)], state.nextId) : null
  }
  // Taking from the middle splits the run; the upper part gets a new id
  if (tile.value - min < 3 || max - tile.value < 3) return null
  const low = makeRow(row.id, "run", runTiles(tile.color, min, tile.value - 1))
  const high = makeRow(state.nextId, "run", runTiles(tile.color, tile.value + 1, max))
  return withRows(state, [row.id], [low, high], state.nextId + 1)
}

function put(state: State, row: Row, tile: Tile): State | null {
  if (row.kind === "set") {
    if (row.tiles.length >= 4 || tile.value !== row.tiles[0].value) return null
    if (row.tiles.some(t => t.color === tile.color)) return null
    return withRows(state, [row.id], [makeRow(row.id, "set", row.tiles.concat([tile]))], state.nextId)
  }
  if (tile.color !== row.tiles[0].color) return null
  const min = row.tiles[0].value
  const max = row.tiles[row.tiles.length - 1].value
  if (tile.value === min - 1 || tile.value === max + 1) {
    return withRows(state, [row.id], [makeRow(row.id, "run", row.tiles.concat([tile]))], state.nextId)
  }
  // Putting a duplicate value inside the run splits it; the upper part gets a new id
  if (tile.value < min || tile.value > max) return null
  if (tile.value - min < 2 || max - tile.value < 2) return null
  const low = makeRow(row.id, "run", runTiles(tile.color, min, tile.value))
  const high = makeRow(state.nextId, "run", runTiles(tile.color, tile.value, max))
  return withRows(state, [row.id], [low, high], state.nextId + 1)
}

const stateKey = (state: State): string =>
  state.nextId + "|" + state.rows.map(r => r.id + ":" + r.tiles.map(tileText).join(",")).join(";")

const failed = new Set<string>()
const actions: string[] = []
let solution: State | null = null

/** Depth-first search for exactly `remaining` actions, combines tried first. */
function search(state: State, remaining: number): boolean {
  if (remaining === 1) {
    for (const row of state.rows) {
      const next = put(state, row, goal)
      if (next) {
        actions.push(`PUT ${tileText(goal)} ${row.id}`)
        solution = next
        return true
      }
    }
    return false
  }
  const key = remaining + "#" + stateKey(state)
  if (failed.has(key)) return false
  for (let i = 0; i < state.rows.length; i++) {
    for (let j = i + 1; j < state.rows.length; j++) {
      const next = combine(state, state.rows[i], state.rows[j])
      if (!next) continue
      actions.push(`COMBINE ${state.rows[i].id} ${state.rows[j].id}`)
      if (search(next, remaining - 1)) return true
      actions.pop()
    }
  }
  if (remaining >= 3) {
    for (const source of state.rows) {
      for (const tile of source.tiles) {
        const afterTake = take(state, source, tile)
        if (!afterTake) continue
        for (const target of afterTake.rows) {
          if (target.id === source.id) continue
          const afterPut = put(afterTake, target, tile)
          if (!afterPut) continue
          actions.push(`TAKE ${tileText(tile)} ${source.id}`, `PUT ${tileText(tile)} ${target.id}`)
          if (search(afterPut, remaining - 2)) return true
          actions.pop()
          actions.pop()
        }
      }
    }
  }
  failed.add(key)
  return false
}

const start: State = { rows: initialRows, nextId: nrow + 1 }
for (let depth = 1; depth <= 12 && !search(start, depth); depth++);

for (const action of actions) console.log(action)
const finalRows = solution ? (solution as State).rows : []
for (const row of finalRows) {
  console.log(`${row.id} ${row.tiles.map(tileText).join(" ")}`)
}
