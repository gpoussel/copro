// 🎮 CodinGame Puzzle - dungeon-designer
// https://www.codingame.com/training/expert/dungeon-designer

// Build the maze with the Blum Blum Shub coin (exponent reduced modulo
// lcm(P-1, Q-1), then modular exponentiation), BFS from the entrance to find
// the treasure (farthest cell) and the path to it, BFS from the barracks cell
// to pick the path cell closest to it.

const [mazeW, mazeH] = readline().trim().split(/\s+/).map(Number)
const [bbsP, bbsQ, bbsR] = readline().trim().split(/\s+/).map(Number)

const mulMod = (a: number, b: number, m: number): number => Number((BigInt(a) * BigInt(b)) % BigInt(m))
const powMod = (b: number, e: number, m: number): number => {
  let res = 1 % m
  b %= m
  while (e > 0) {
    if (e & 1) res = mulMod(res, b, m)
    b = mulMod(b, b, m)
    e = Math.floor(e / 2)
  }
  return res
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const lambda = ((bbsP - 1) * (bbsQ - 1)) / gcd(bbsP - 1, bbsQ - 1)
const modulus = bbsP * bbsQ

const rows = 2 * mazeH + 1
const cols = 2 * mazeW + 1
const map: string[][] = []
for (let r = 0; r < rows; r++) {
  map.push([])
  for (let c = 0; c < cols; c++) {
    const border = r === 0 || c === 0 || r === rows - 1 || c === cols - 1
    map[r].push(border || (r % 2 === 0 && c % 2 === 0) ? "#" : ".")
  }
}
map[0][1] = "."
map[rows - 1][cols - 2] = "."
for (let y = 0; y < mazeH - 1; y++) {
  for (let x = 0; x < mazeW - 1; x++) {
    const e = powMod(2, x + y * mazeW + 1, lambda)
    const coin = powMod(bbsR, e, modulus)
    if (coin % 2 === 1) map[2 * y + 1][2 * x + 2] = "#"
    else map[2 * y + 2][2 * x + 1] = "#"
  }
}

const bfs = (sx: number, sy: number): { dist: number[]; prev: number[] } => {
  const dist: number[] = new Array(mazeW * mazeH).fill(-1)
  const prev: number[] = new Array(mazeW * mazeH).fill(-1)
  const queue = [sx + sy * mazeW]
  dist[queue[0]] = 0
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi]
    const x = cur % mazeW
    const y = Math.floor(cur / mazeW)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= mazeW || ny >= mazeH) continue
      if (map[2 * y + 1 + dy][2 * x + 1 + dx] === "#") continue
      const n = nx + ny * mazeW
      if (dist[n] >= 0) continue
      dist[n] = dist[cur] + 1
      prev[n] = cur
      queue.push(n)
    }
  }
  return { dist, prev }
}

const fromEntrance = bfs(0, 0)
let treasure = 0
fromEntrance.dist.forEach((d, i) => {
  if (d > fromEntrance.dist[treasure]) treasure = i
})
const fromBarracks = bfs(mazeW - 1, mazeH - 1)
let spot = treasure
for (let c = treasure; c >= 0; c = fromEntrance.prev[c]) {
  if (fromBarracks.dist[c] < fromBarracks.dist[spot]) spot = c
}
const mark = (cell: number, ch: string): void => {
  map[2 * Math.floor(cell / mazeW) + 1][2 * (cell % mazeW) + 1] = ch
}
if (spot !== treasure) mark(spot, "X")
mark(treasure, "T")
console.log(map.map(r => r.join("")).join("\n"))
