// 🎮 CodinGame Multiplayer - langton-s-ant
// https://www.codingame.com/multiplayer/bot-programming/langton-s-ant
//
// Players pick cells to paint, then an ant walks pathLength steps from the
// centre facing up, carrying the first player's colour: on a coloured cell
// it turns left, takes that colour and whitens the cell; on a white cell it
// turns right and paints it with its colour; it stops when leaving the grid.
// Two rounds with the first seat swapped (-1 -1 = we start a round, -2 -2 =
// round change, answer ignored). Early leagues give each player its own
// grid (SHARED = false): opponent moves are not applied to ours.
// Greedy: each pick is the free cell maximising our final cell count in a
// full simulation of the ant.

const SHARED = false
const dim = parseInt(readline())
readline() // number of picks
const pathLength = parseInt(readline())

// Cell colours: 0 white, 1 us, 2 opponent.
let grid = new Int8Array(dim * dim)
let weStart = false

function simulate(g: Int8Array): number {
  const c = g.slice()
  let r = Math.floor(dim / 2)
  let col = Math.floor(dim / 2)
  let dir = 0 // 0 up, 1 right, 2 down, 3 left
  let ant = weStart ? 1 : 2
  for (let s = 0; s < pathLength; s++) {
    const k = r * dim + col
    if (c[k] !== 0) {
      dir = (dir + 3) % 4
      ant = c[k]
      c[k] = 0
    } else {
      dir = (dir + 1) % 4
      c[k] = ant
    }
    if (dir === 0) r--
    else if (dir === 1) col++
    else if (dir === 2) r++
    else col--
    if (r < 0 || col < 0 || r >= dim || col >= dim) break
  }
  let mine = 0
  let theirs = 0
  for (let k = 0; k < c.length; k++) {
    if (c[k] === 1) mine++
    else if (c[k] === 2) theirs++
  }
  return SHARED ? mine - theirs : mine
}

while (true) {
  const [or, oc] = readline().split(" ").map(Number)
  if (or === -2) {
    // Round change: we were first, we are second now.
    grid = new Int8Array(dim * dim)
    weStart = false
    console.log("0 0")
    continue
  }
  if (or === -1) {
    grid = new Int8Array(dim * dim)
    weStart = true
  } else if (SHARED) grid[or * dim + oc] = 2
  let best = -1
  let bestScore = -Infinity
  for (let k = 0; k < dim * dim; k++) {
    if (grid[k] !== 0) continue
    grid[k] = 1
    const s = simulate(grid)
    grid[k] = 0
    if (s > bestScore) {
      bestScore = s
      best = k
    }
  }
  grid[best] = 1
  console.log(`${Math.floor(best / dim)} ${best % dim}`)
}
