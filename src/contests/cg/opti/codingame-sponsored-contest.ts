// 🎮 CodinGame Optimization - CodinGame Sponsored Contest
// https://www.codingame.com/training/optim/codingame-sponsored-contest
//
// The statement hides everything ("figure out what the inputs mean"). Decoding a
// test case (base64+zlib, TWICE) reveals a PAC-MAN maze: `P`=you, `1..4`=ghosts,
// `#`=walls, `.`=pellets, corners `A/B/C/D`. The program only gets LOCAL info, so
// it must build the map as it goes.
//
// I/O CONTRACT (reverse-engineered; see texus' Python solution for the original
// decode: https://github.com/texus/codingame "CodinGame Sponsored Contest"):
//   Init: width, height, players   (players = ghosts + you)
//   Each turn:
//     4 chars: UP, RIGHT, DOWN, LEFT  (content of the 4 cells around you)
//     `players` lines "x y", 1-indexed, with wrap-around; the LAST pair is YOU,
//     the others are the ghosts.
//   Output one action. Action mapping (the crucial bit):
//     A = RIGHT, B = STAY, C = UP, D = DOWN, E = LEFT.
//   (Our first naive bot always printed D = DOWN, a wall at spawn -> it froze.)
//
// STRATEGY (port of texus' approach): keep a grid of `?` (unknown) / `#` (wall) /
// `_` (eaten); each turn fill in our cell + the 4 neighbours, then BFS to the
// nearest still-unknown cell and step toward it (exploration == eating pellets),
// refusing any move that would walk us next to a ghost.

const DIR = { UP: "C", RIGHT: "A", DOWN: "D", LEFT: "E", STAY: "B" } as const

const width = parseInt(readline())
const height = parseInt(readline())
const players = parseInt(readline()) // ghosts + self

const mod = (a: number, n: number): number => ((a % n) + n) % n

const grid: string[][] = Array.from({ length: height }, () =>
  Array.from({ length: width }, () => "?"),
)

interface Pos {
  x: number
  y: number
}
const enemies: Pos[] = Array.from({ length: players - 1 }, () => ({ x: -1, y: -1 }))
const me: Pos = { x: -1, y: -1 }

const cell = (x: number, y: number): string => grid[mod(y, height)][mod(x, width)]

const enemyAt = (x: number, y: number): boolean =>
  enemies.some((e) => e.x === x && e.y === y)

// Neighbours that are not walls and not dangerously close to a ghost.
function possibleMoves(x: number, y: number): Pos[] {
  const moves: Pos[] = []
  if (
    cell(x, y - 1) !== "#" &&
    !enemyAt(x, y - 1) && !enemyAt(x, y - 2) && !enemyAt(x - 1, y - 1) && !enemyAt(x + 1, y - 1)
  )
    moves.push({ x, y: mod(y - 1, height) })
  if (
    cell(x + 1, y) !== "#" &&
    !enemyAt(x + 1, y) && !enemyAt(x + 2, y) && !enemyAt(x + 1, y - 1) && !enemyAt(x + 1, y + 1)
  )
    moves.push({ x: mod(x + 1, width), y })
  if (
    cell(x, y + 1) !== "#" &&
    !enemyAt(x, y + 1) && !enemyAt(x, y + 2) && !enemyAt(x - 1, y + 1) && !enemyAt(x + 1, y + 1)
  )
    moves.push({ x, y: mod(y + 1, height) })
  if (
    cell(x - 1, y) !== "#" &&
    !enemyAt(x - 1, y) && !enemyAt(x - 2, y) && !enemyAt(x - 1, y - 1) && !enemyAt(x - 1, y + 1)
  )
    moves.push({ x: mod(x - 1, width), y })
  return moves
}

// A cell worth heading to: unexplored (`?`) or a known, uneaten pellet (`.`).
const isTarget = (ch: string): boolean => ch === "?" || ch === "."

// BFS from the player to the nearest target cell; return the FIRST step to take.
function stepToNearestUnknown(): Pos {
  const start: Pos = { x: me.x, y: me.y }
  const key = (p: Pos): number => p.y * width + p.x
  const queue: Pos[] = [start]
  const visited = new Set<number>([key(start)])
  const firstStep = new Map<number, Pos>()
  let head = 0
  while (head < queue.length) {
    const node = queue[head++]
    if (isTarget(grid[node.y][node.x])) return firstStep.get(key(node)) ?? start
    for (const next of possibleMoves(node.x, node.y)) {
      const k = key(next)
      if (visited.has(k)) continue
      visited.add(k)
      const fs =
        node.x === me.x && node.y === me.y ? next : firstStep.get(key(node))!
      firstStep.set(k, fs)
      queue.push(next)
    }
  }
  return start
}

// Distance to the closest ghost from a cell (larger = safer).
function distToNearestGhost(x: number, y: number): number {
  let best = Infinity
  for (const e of enemies) {
    if (e.x < 0) continue
    const d = Math.abs(e.x - x) + Math.abs(e.y - y)
    if (d < best) best = d
  }
  return best
}

// No safe step toward a target: flee. Pick the safe neighbour that maximises the
// distance to the nearest ghost; else bump an adjacent ghost; else wait.
function alternativeMove(): string {
  const { x, y } = me
  const safe = (cx: number, cy: number, guards: boolean): boolean =>
    cell(cx, cy) !== "#" && guards
  const opts: { dir: string; nx: number; ny: number }[] = []
  if (safe(x, y - 1, !enemyAt(x, y - 1) && !enemyAt(x, y - 2) && !enemyAt(x - 1, y - 1) && !enemyAt(x + 1, y - 1)))
    opts.push({ dir: DIR.UP, nx: x, ny: y - 1 })
  if (safe(x + 1, y, !enemyAt(x + 1, y) && !enemyAt(x + 2, y) && !enemyAt(x + 1, y - 1) && !enemyAt(x + 1, y + 1)))
    opts.push({ dir: DIR.RIGHT, nx: x + 1, ny: y })
  if (safe(x, y + 1, !enemyAt(x, y + 1) && !enemyAt(x, y + 2) && !enemyAt(x - 1, y + 1) && !enemyAt(x + 1, y + 1)))
    opts.push({ dir: DIR.DOWN, nx: x, ny: y + 1 })
  if (safe(x - 1, y, !enemyAt(x - 1, y) && !enemyAt(x - 2, y) && !enemyAt(x - 1, y - 1) && !enemyAt(x - 1, y + 1)))
    opts.push({ dir: DIR.LEFT, nx: x - 1, ny: y })

  if (opts.length > 0) {
    let best = opts[0]
    let bestD = distToNearestGhost(best.nx, best.ny)
    for (const o of opts) {
      const d = distToNearestGhost(o.nx, o.ny)
      if (d > bestD) {
        bestD = d
        best = o
      }
    }
    return best.dir
  }

  if (enemyAt(x, y - 1)) return DIR.UP
  if (enemyAt(x + 1, y)) return DIR.RIGHT
  if (enemyAt(x, y + 1)) return DIR.DOWN
  if (enemyAt(x - 1, y)) return DIR.LEFT
  return DIR.STAY
}

// game loop
for (;;) {
  const up = readline()
  if (up === undefined || up === null) break
  const right = readline()
  const down = readline()
  const left = readline()

  for (let i = 0; i < players; i++) {
    const [px, py] = readline().split(/\s+/).map(Number)
    const x = mod(px - 1, width)
    const y = mod(py - 1, height)
    if (i + 1 === players) {
      me.x = x
      me.y = y
    } else {
      enemies[i].x = x
      enemies[i].y = y
    }
  }

  grid[me.y][me.x] = "_"
  grid[mod(me.y - 1, height)][me.x] = up
  grid[mod(me.y + 1, height)][me.x] = down
  grid[me.y][mod(me.x - 1, width)] = left
  grid[me.y][mod(me.x + 1, width)] = right

  const step = stepToNearestUnknown()
  const noTarget = step.x === me.x && step.y === me.y

  // Take the suggested step only if there is one and its destination is not next to a ghost.
  if (
    !noTarget &&
    !enemyAt(step.x - 1, step.y) && !enemyAt(step.x + 1, step.y) &&
    !enemyAt(step.x, step.y - 1) && !enemyAt(step.x, step.y + 1)
  ) {
    if (step.x === mod(me.x - 1, width)) console.log(DIR.LEFT)
    else if (step.y === mod(me.y - 1, height)) console.log(DIR.UP)
    else if (step.x === mod(me.x + 1, width)) console.log(DIR.RIGHT)
    else if (step.y === mod(me.y + 1, height)) console.log(DIR.DOWN)
    else console.log(DIR.STAY)
  } else {
    console.log(alternativeMove())
  }
}
