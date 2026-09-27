// 🎮 CodinGame Multiplayer - soak-overflow
// https://www.codingame.com/multiplayer/bot-programming/soak-overflow
//
// Summer 2025 water fight. The wood leagues are tutorials with a fixed goal
// each (3 successes out of 5 vs the boss to be promoted).
// Wood 4 (LEAGUE = 1): move one agent to (6,1) and the other to (6,3).
// Wood 3 (LEAGUE = 2): every agent shoots the wettest enemy each turn.

const LEAGUE: number = 2
const myId = parseInt(readline())
const agentDataCount = parseInt(readline())
const owner = new Map<number, number>()
for (let i = 0; i < agentDataCount; i++) {
  const [id, player] = readline().split(" ").map(Number)
  owner.set(id, player)
}
const [W, H] = readline().split(" ").map(Number)
// Tiles: one line per row with `x y type` triples (not one line per cell).
for (let y = 0; y < H; y++) readline()
void W

while (true) {
  const n = parseInt(readline())
  const mine: { id: number; x: number; y: number }[] = []
  const foes: { id: number; x: number; y: number; wet: number }[] = []
  for (let i = 0; i < n; i++) {
    const [id, x, y, , , wet] = readline().split(" ").map(Number)
    if (owner.get(id) === myId) mine.push({ id, x, y })
    else foes.push({ id, x, y, wet })
  }
  readline() // my agent count
  mine.sort((a, b) => a.id - b.id)
  const out: string[] = []
  if (LEAGUE === 1) {
    const goals = [
      [6, 1],
      [6, 3],
    ]
    // Assignment with the smaller total distance.
    const d = (a: { x: number; y: number }, g: number[]) => Math.abs(a.x - g[0]) + Math.abs(a.y - g[1])
    const swap = mine.length === 2 && d(mine[0], goals[1]) + d(mine[1], goals[0]) < d(mine[0], goals[0]) + d(mine[1], goals[1])
    mine.forEach((a, i) => {
      const g = goals[(swap ? 1 - i : i) % 2]
      out.push(`${a.id};MOVE ${g[0]} ${g[1]}`)
    })
  }
  if (LEAGUE === 2) {
    const target = foes.sort((a, b) => b.wet - a.wet || a.id - b.id)[0]
    for (const a of mine) out.push(target ? `${a.id};SHOOT ${target.id}` : `${a.id};HUNKER_DOWN`)
  }
  console.log(out.join("\n"))
}
