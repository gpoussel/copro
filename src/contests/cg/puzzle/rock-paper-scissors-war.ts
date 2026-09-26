// 🎮 CodinGame Puzzle - rock-paper-scissors-war
// https://www.codingame.com/training/medium/rock-paper-scissors-war

const [terrainW, terrainH, dayCount] = readline().split(" ").map(Number)
let terrain: string[][] = []
for (let i = 0; i < terrainH; i++) terrain.push(readline().substr(0, terrainW).split(""))

// Life forms each one defeats
const DEFEATS: { [form: string]: string } = { C: "PL", P: "RS", R: "LC", L: "SP", S: "CR" }

function beats(a: string, b: string): boolean {
  return DEFEATS[a].indexOf(b) >= 0
}

const NEIGHBOURS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

for (let day = 0; day < dayCount; day++) {
  const next: string[][] = []
  for (let r = 0; r < terrainH; r++) {
    const row: string[] = []
    for (let c = 0; c < terrainW; c++) {
      const current = terrain[r][c]
      // Every form beats exactly two others, so at most two distinct winners can claim this cell
      let winner = ""
      for (const [dr, dc] of NEIGHBOURS) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= terrainH || nc >= terrainW) continue
        const attacker = terrain[nr][nc]
        if (!beats(attacker, current)) continue
        if (winner === "" || beats(attacker, winner)) winner = attacker
      }
      row.push(winner === "" ? current : winner)
    }
    next.push(row)
  }
  terrain = next
}

console.log(terrain.map((row) => row.join("")).join("\n"))
