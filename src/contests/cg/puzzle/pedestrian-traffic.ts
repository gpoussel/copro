// 🎮 CodinGame Puzzle - pedestrian-traffic
// https://www.codingame.com/training/hard/pedestrian-traffic

// Second-by-second simulation. Within a second, every walker starts with its
// preferred move (switch lane if in the wrong one, else forward) and moves are
// optimistically assumed to succeed; failures are then propagated until a fixed
// point (switch -> forward -> stay), which lets chains and cycles of moves into
// freshly vacated cells succeed. "Forward movers" that beat lane switchers are
// people walking forward in their own lane; someone who fell back to walking
// forward in the wrong lane yields to a switcher. A repeated state means congestion.
const n = parseInt(readline())
const grid: string[] = [readline(), readline()].join("").split("") // lane 0 = upper (R), lane 1 = lower (L)

const STAY = 0
const FORWARD = 1
const SWITCH = 2
const mode = new Int8Array(2 * n)

const dirOf = (id: number): number => (grid[id] === "R" ? 1 : -1)
const correct = (id: number): boolean => (grid[id] === "R") === id < n
// Person at (lane, c) if any, else -1
const cell = (lane: number, c: number): number => (c < 0 || c >= n || grid[lane * n + c] === "o" ? -1 : lane * n + c)

const seen = new Set<string>()
let people = grid.filter(ch => ch !== "o").length
let seconds = 0
while (people > 0) {
  const key = grid.join("")
  if (seen.has(key)) break
  seen.add(key)

  for (let id = 0; id < 2 * n; id++) if (grid[id] !== "o") mode[id] = correct(id) ? FORWARD : SWITCH

  let changed = true
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < 2 * n; k++) {
        const id = pass === 0 ? k : 2 * n - 1 - k
        if (grid[id] === "o") continue
        const lane = id < n ? 0 : 1
        const c = id % n
        if (mode[id] === SWITCH) {
          const other = 1 - lane
          const left = cell(other, c - 1)
          const right = cell(other, c + 1)
          const occ = cell(other, c)
          const claimed =
            (left >= 0 && mode[left] === FORWARD && dirOf(left) === 1 && correct(left)) ||
            (right >= 0 && mode[right] === FORWARD && dirOf(right) === -1 && correct(right))
          if (claimed || (occ >= 0 && mode[occ] === STAY)) {
            mode[id] = FORWARD
            changed = true
          }
        }
        if (mode[id] === FORWARD) {
          const d = dirOf(id)
          const t = c + d
          if (t < 0 || t >= n) continue // exits
          const occ = cell(lane, t)
          const rival = cell(lane, t + d)
          const sw = cell(1 - lane, t)
          const blocked =
            (occ >= 0 && (mode[occ] === STAY || (mode[occ] === FORWARD && dirOf(occ) === -d))) ||
            (rival >= 0 && mode[rival] === FORWARD && dirOf(rival) === -d && correct(rival) && !correct(id)) ||
            (!correct(id) && sw >= 0 && mode[sw] === SWITCH)
          if (blocked) {
            mode[id] = STAY
            changed = true
          }
        }
      }
    }
  }

  const next = new Array<string>(2 * n).fill("o")
  let moved = false
  for (let id = 0; id < 2 * n; id++) {
    if (grid[id] === "o") continue
    const lane = id < n ? 0 : 1
    const c = id % n
    if (mode[id] === STAY) next[id] = grid[id]
    else {
      moved = true
      if (mode[id] === SWITCH) next[(1 - lane) * n + c] = grid[id]
      else {
        const t = c + dirOf(id)
        if (t < 0 || t >= n) people--
        else next[lane * n + t] = grid[id]
      }
    }
  }
  if (!moved) break
  for (let id = 0; id < 2 * n; id++) grid[id] = next[id]
  seconds++
}
console.log(people > 0 ? "Congestion" : String(seconds))
