// 🎮 CodinGame Puzzle - the-labyrinth
// https://www.codingame.com/training/hard/the-labyrinth

// Explore with a BFS towards the nearest unscanned cell (never stepping on
// the control room) until the control room is known and the known path back
// to the start fits in the alarm countdown; then go to C and BFS back to T.

const [R, C, A] = readline().split(" ").map(Number)
const DIRS: [number, number, string][] = [
  [-1, 0, "UP"],
  [1, 0, "DOWN"],
  [0, -1, "LEFT"],
  [0, 1, "RIGHT"],
]

let grid: string[] = []
let reachedControl = false

// BFS from (sr, sc) over known free cells; returns the first move towards the
// closest cell accepted by isGoal, and its distance
const bfs = (
  sr: number,
  sc: number,
  isGoal: (ch: string) => boolean,
  blockControl: boolean
): { move: string; dist: number } | null => {
  const dist = new Int32Array(R * C).fill(-1)
  const first: string[] = new Array(R * C).fill("")
  const queue = [sr * C + sc]
  dist[sr * C + sc] = 0
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi]
    const r = (cur / C) | 0
    const c = cur % C
    const ch = grid[r][c]
    if (qi > 0 && isGoal(ch)) return { move: first[cur], dist: dist[cur] }
    // unknown cells can be targets but are never walked through
    if (qi > 0 && ch === "?") continue
    for (const [dr, dc, name] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue
      const n = nr * C + nc
      const nch = grid[nr][nc]
      if (dist[n] >= 0 || nch === "#") continue
      if (blockControl && nch === "C") continue
      dist[n] = dist[cur] + 1
      first[n] = qi === 0 ? name : first[cur]
      queue.push(n)
    }
  }
  return null
}

const find = (ch: string): [number, number] | null => {
  for (let r = 0; r < R; r++) {
    const c = grid[r].indexOf(ch)
    if (c >= 0) return [r, c]
  }
  return null
}

while (true) {
  const [kr, kc] = readline().split(" ").map(Number)
  grid = []
  for (let i = 0; i < R; i++) grid.push(readline())
  if (grid[kr][kc] === "C") reachedControl = true

  let move = ""
  if (reachedControl) {
    move = bfs(kr, kc, ch => ch === "T", false)!.move
  } else {
    const ctrl = find("C")
    const back = ctrl ? bfs(ctrl[0], ctrl[1], ch => ch === "T", false) : null
    if (ctrl && back && back.dist <= A) {
      move = bfs(kr, kc, ch => ch === "C", false)!.move
    } else {
      const explore = bfs(kr, kc, ch => ch === "?", true)
      // nothing left to explore: head to the control room anyway
      move = explore ? explore.move : bfs(kr, kc, ch => ch === "C", false)!.move
    }
  }
  console.log(move)
}
