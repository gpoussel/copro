// 🎮 CodinGame Puzzle - maze-for-the-champions
// https://www.codingame.com/training/medium/maze-for-the-champions

const W = Number(readline())
const H = Number(readline())
const maze: string[][] = []
for (let i = 0; i < H; i++) maze.push(readline().split(""))

const ARROWS = "^>v<"
// Straight moves first (same index as ARROWS), then diagonals
const DIRS: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1], [-1, 1], [1, 1], [1, -1], [-1, -1]]

const inside = (r: number, c: number) => r >= 0 && r < H && c >= 0 && c < W
const isBorder = (r: number, c: number) => r === 0 || c === 0 || r === H - 1 || c === W - 1
const isWall = (r: number, c: number) => !inside(r, c) || maze[r][c] === "#"

// Locate entry (arrow pointing inside) and exit (arrow pointing outside)
let entry: [number, number] = [0, 0]
let entryDir = 0
let exit: [number, number] = [0, 0]
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const d = ARROWS.indexOf(maze[r][c])
    if (d < 0) continue
    const nr = r + DIRS[d][0]
    const nc = c + DIRS[d][1]
    if (inside(nr, nc)) {
      entry = [r, c]
      entryDir = d
    } else {
      exit = [r, c]
    }
  }
}

interface Move {
  r: number
  c: number
  dir: number
}

type MoveGen = (r: number, c: number) => Move[]

const warriorMoves: MoveGen = (r, c) => {
  const res: Move[] = []
  for (let d = 0; d < 4; d++) {
    const nr = r + DIRS[d][0]
    const nc = c + DIRS[d][1]
    if (!isWall(nr, nc)) res.push({ r: nr, c: nc, dir: d })
  }
  return res
}

// The dwarf may step into an inner wall cell if the cell right behind it (same direction) is not a wall
const dwarfMoves: MoveGen = (r, c) => {
  const res: Move[] = []
  for (let d = 0; d < 4; d++) {
    const nr = r + DIRS[d][0]
    const nc = c + DIRS[d][1]
    if (!inside(nr, nc)) continue
    if (!isWall(nr, nc)) res.push({ r: nr, c: nc, dir: d })
    else if (!isBorder(nr, nc) && !isWall(nr + DIRS[d][0], nc + DIRS[d][1])) res.push({ r: nr, c: nc, dir: d })
  }
  return res
}

const elfMoves: MoveGen = (r, c) => {
  const res: Move[] = []
  for (let d = 0; d < 8; d++) {
    const nr = r + DIRS[d][0]
    const nc = c + DIRS[d][1]
    if (!isWall(nr, nc)) res.push({ r: nr, c: nc, dir: d })
  }
  return res
}

const mageMoves: MoveGen = (r, c) => {
  const res: Move[] = []
  for (let d = 0; d < 4; d++) {
    let nr = r + DIRS[d][0]
    let nc = c + DIRS[d][1]
    while (!isWall(nr, nc)) {
      res.push({ r: nr, c: nc, dir: d })
      nr += DIRS[d][0]
      nc += DIRS[d][1]
    }
  }
  return res
}

interface Result {
  marks: number
  grid: string[][]
}

function solve(moves: MoveGen, restrictFirst: (m: Move) => boolean): Result {
  const parent: (Move | null)[][] = []
  const seen: boolean[][] = []
  for (let r = 0; r < H; r++) {
    parent.push(new Array<Move | null>(W).fill(null))
    seen.push(new Array<boolean>(W).fill(false))
  }
  const [er, ec] = entry
  seen[er][ec] = true
  const queue: [number, number][] = [entry]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    if (r === exit[0] && c === exit[1]) break
    const isEntry = r === er && c === ec
    for (const m of moves(r, c)) {
      if (isEntry && !restrictFirst(m)) continue
      if (seen[m.r][m.c]) continue
      seen[m.r][m.c] = true
      // Store where we came from and the direction used
      parent[m.r][m.c] = { r, c, dir: m.dir }
      queue.push([m.r, m.c])
    }
  }
  const grid = maze.map(row => row.slice())
  let marks = 1
  let [r, c] = exit
  while (r !== er || c !== ec) {
    const p = parent[r][c]!
    grid[p.r][p.c] = p.dir < 4 ? ARROWS[p.dir] : "o"
    marks++
    r = p.r
    c = p.c
  }
  return { marks, grid }
}

const straightEntry = (m: Move) => m.dir === entryDir
const firstStep = (m: Move) => m.dir === entryDir && m.r === entry[0] + DIRS[entryDir][0] && m.c === entry[1] + DIRS[entryDir][1]

const champions: [string, number, Result][] = [
  ["WARRIOR", 2, solve(warriorMoves, straightEntry)],
  ["DWARF", 3, solve(dwarfMoves, straightEntry)],
  ["ELF", 4, solve(elfMoves, firstStep)],
  ["MAGE", 5, solve(mageMoves, straightEntry)],
]

let best = champions[0]
for (const ch of champions) if (ch[1] * ch[2].marks < best[1] * best[2].marks) best = ch
console.log(`${best[0]} ${best[1] * best[2].marks}`)
for (const row of best[2].grid) console.log(row.join(""))
