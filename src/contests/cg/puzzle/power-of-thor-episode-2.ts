// 🎮 CodinGame Puzzle - power-of-thor-episode-2
// https://www.codingame.com/training/hard/power-of-thor-episode-2

// Giants step towards Thor along the closest of the 8 directions (a giant
// moves along an axis only if that axis offset is more than half the other
// one), nearest giants first, never onto an occupied cell.
// Each turn we run a beam search over Thor's future moves with that model,
// looking for the highest number of giants caught in the 9x9 strike square
// while staying alive. We strike when every giant is in range, when there is
// no safe move left, or when striking now kills "enough" giants and waiting
// does not promise more.
const W = 40
const H = 18
const RANGE = 4
const DEPTH = 22
const BEAM = 60
const TIME = 60 // ms of search per turn
const MOVES: [string, number, number][] = [
  ["WAIT", 0, 0],
  ["N", 0, -1],
  ["NE", 1, -1],
  ["E", 1, 0],
  ["SE", 1, 1],
  ["S", 0, 1],
  ["SW", -1, 1],
  ["W", -1, 0],
  ["NW", -1, -1],
]

type State = { tx: number; ty: number; gs: Int8Array; first: number; value: number; best: number; bestDepth: number }

const cheb = (ax: number, ay: number, bx: number, by: number) => Math.max(Math.abs(ax - bx), Math.abs(ay - by))
const occupied = new Int32Array(W * H)
let stamp = 0

// Moves every giant (flat [x0, y0, x1, y1, ...]) towards Thor; null if one catches him
const stepGiants = (gs: Int8Array, tx: number, ty: number): Int8Array | null => {
  const n = gs.length / 2
  // Bucket the giants by distance (stable), nearest first
  const buckets: number[][] = []
  stamp++
  for (let i = 0; i < n; i++) {
    const d = cheb(gs[2 * i], gs[2 * i + 1], tx, ty)
    if (d === 0) return null
    ;(buckets[d] ??= []).push(i)
    occupied[gs[2 * i] * H + gs[2 * i + 1]] = stamp
  }
  const out = Int8Array.from(gs)
  for (const bucket of buckets) {
    if (!bucket) continue
    for (const i of bucket) {
      const x = out[2 * i]
      const y = out[2 * i + 1]
      const dx = tx - x
      const dy = ty - y
      const nx = x + (2 * Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0)
      const ny = y + (2 * Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0)
      if (occupied[nx * H + ny] === stamp) continue
      if (nx === tx && ny === ty) return null
      occupied[x * H + y] = 0
      occupied[nx * H + ny] = stamp
      out[2 * i] = nx
      out[2 * i + 1] = ny
    }
  }
  return out
}

const inRange = (gs: Int8Array, tx: number, ty: number) => {
  let count = 0
  for (let i = 0; i < gs.length; i += 2) if (cheb(gs[i], gs[i + 1], tx, ty) <= RANGE) count++
  return count
}

// Ranking heuristic: giants in range first, then how close they are overall,
// with a penalty for hugging the walls (fewer escape routes)
const evaluate = (gs: Int8Array, tx: number, ty: number) => {
  let sum = 0
  for (let i = 0; i < gs.length; i += 2) sum += cheb(gs[i], gs[i + 1], tx, ty)
  const wall = Math.min(tx, W - 1 - tx, ty, H - 1 - ty)
  return inRange(gs, tx, ty) * 100 - (sum / (gs.length / 2)) * 10 + Math.min(wall, 3) * 5
}

let [tx, ty] = readline().split(" ").map(Number)

while (true) {
  const [hits, n] = readline().split(" ").map(Number)
  const gs = new Int8Array(2 * n)
  for (let i = 0; i < n; i++) {
    const [x, y] = readline().split(" ").map(Number)
    gs[2 * i] = x
    gs[2 * i + 1] = y
  }

  const start = Date.now()
  const now = inRange(gs, tx, ty)
  if (now === n) {
    console.log("STRIKE")
    continue
  }

  // Beam search; for each first move keep the best reachable in-range count
  const bestByFirst = new Array<number>(MOVES.length).fill(-1)
  const depthByFirst = new Array<number>(MOVES.length).fill(Infinity)
  const valueByFirst = new Array<number>(MOVES.length).fill(-Infinity)
  let beam: State[] = [{ tx, ty, gs, first: -1, value: 0, best: 0, bestDepth: 0 }]
  for (let depth = 1; depth <= DEPTH && beam.length > 0 && Date.now() - start < TIME; depth++) {
    const next = new Map<number, State>()
    for (const s of beam) {
      for (let m = 0; m < MOVES.length; m++) {
        const nx = s.tx + MOVES[m][1]
        const ny = s.ty + MOVES[m][2]
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue
        const moved = stepGiants(s.gs, nx, ny)
        if (moved === null) continue
        const first = s.first < 0 ? m : s.first
        const k = inRange(moved, nx, ny)
        const child: State = {
          tx: nx,
          ty: ny,
          gs: moved,
          first,
          value: evaluate(moved, nx, ny),
          best: Math.max(s.best, k),
          bestDepth: k > s.best ? depth : s.bestDepth,
        }
        const key = first * W * H + nx * H + ny
        const old = next.get(key)
        if (!old || old.value < child.value) next.set(key, child)
      }
    }
    beam = [...next.values()].sort((a, b) => b.value - a.value).slice(0, BEAM)
    for (const s of beam) {
      const f = s.first
      if (s.best > bestByFirst[f] || (s.best === bestByFirst[f] && s.bestDepth < depthByFirst[f])) {
        bestByFirst[f] = s.best
        depthByFirst[f] = s.bestDepth
      }
      valueByFirst[f] = Math.max(valueByFirst[f], s.value)
    }
  }

  // Only consider first moves that still have a surviving line at the horizon
  const alive = new Set(beam.map(s => s.first))
  let choice = -1
  for (let m = 0; m < MOVES.length; m++) {
    if (bestByFirst[m] < 0 || (alive.size > 0 && !alive.has(m))) continue
    if (
      choice < 0 ||
      bestByFirst[m] > bestByFirst[choice] ||
      (bestByFirst[m] === bestByFirst[choice] &&
        (depthByFirst[m] < depthByFirst[choice] ||
          (depthByFirst[m] === depthByFirst[choice] && valueByFirst[m] > valueByFirst[choice])))
    )
      choice = m
  }

  const need = Math.ceil(n / hits)
  if (choice < 0 || (now >= need && now >= bestByFirst[choice])) {
    console.log("STRIKE")
  } else {
    tx += MOVES[choice][1]
    ty += MOVES[choice][2]
    console.log(MOVES[choice][0])
  }
}
