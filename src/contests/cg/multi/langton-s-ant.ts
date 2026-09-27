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
// Each turn: plan all our remaining picks (greedy seed + hill climbing on
// the set, full ant simulation as the score) and play the plan's most
// important cell.

const SHARED = false
const dim = parseInt(readline())
const PICKS = parseInt(readline())
const pathLength = parseInt(readline())

// Cell colours: 0 white, 1 us, 2 opponent.
let grid = new Int8Array(dim * dim)
let weStart = false
let placed = 0

function simulate(g: Int8Array): number {
  const c = g.slice()
  let r = Math.floor(dim / 2)
  let col = Math.floor(dim / 2)
  let dir = 0 // 0 up, 1 right, 2 down, 3 left
  // On separate grids the ant carries OUR colour (found by testing: the
  // statement's "first player's colour" only holds on a shared grid).
  let ant = SHARED && !weStart ? 2 : 1
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
    placed = 0
    console.log("0 0")
    continue
  }
  if (or === -1) {
    grid = new Int8Array(dim * dim)
    weStart = true
    placed = 0
  } else if (SHARED) grid[or * dim + oc] = 2
  // Plan all our remaining picks at once: hill climbing (with restarts from
  // the greedy plan) on the set of cells still to pick, within the time
  // budget; play one cell of the best plan.
  const start = Date.now()
  const budget = placed === 0 ? 700 : 200
  const left = Math.max(1, PICKS - placed)
  const freeCells: number[] = []
  for (let k = 0; k < dim * dim; k++) if (grid[k] === 0) freeCells.push(k)
  const scorePlan = (plan: number[]) => {
    for (const k of plan) grid[k] = 1
    const v = simulate(grid)
    for (const k of plan) grid[k] = 0
    return v
  }
  // Greedy seed.
  let plan: number[] = []
  for (let i = 0; i < left; i++) {
    let bk = -1
    let bv = -Infinity
    for (const k of freeCells) {
      if (plan.includes(k)) continue
      const v = scorePlan([...plan, k])
      if (v > bv) {
        bv = v
        bk = k
      }
    }
    plan.push(bk)
    if (Date.now() - start > budget / 2) break
  }
  while (plan.length < left) plan.push(freeCells.find(k => !plan.includes(k))!)
  let planScore = scorePlan(plan)
  let best = plan.slice()
  let bestScore = planScore
  while (Date.now() - start < budget) {
    const i = Math.floor(Math.random() * plan.length)
    const k = freeCells[Math.floor(Math.random() * freeCells.length)]
    if (plan.includes(k)) continue
    const old = plan[i]
    plan[i] = k
    const v = scorePlan(plan)
    if (v >= planScore) {
      planScore = v
      if (v > bestScore) {
        bestScore = v
        best = plan.slice()
      }
    } else plan[i] = old
  }
  // Play the plan cell whose absence hurts most (the most important one).
  let pick = best[0]
  let worst = Infinity
  for (const k of best) {
    const v = scorePlan(best.filter(c => c !== k))
    if (v < worst) {
      worst = v
      pick = k
    }
  }
  void bestScore
  const chosen = pick
  grid[chosen] = 1
  placed++
  console.log(`${Math.floor(chosen / dim)} ${chosen % dim}`)
}
