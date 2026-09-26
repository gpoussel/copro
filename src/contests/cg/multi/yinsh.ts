// 🎮 CodinGame Multiplayer - yinsh
// https://www.codingame.com/multiplayer/bot-programming/yinsh
//
// Minimal legal bot (single league): we answer "yes" to get the legal moves,
// place rings near the centre, and prefer moves that remove rows (each `x`
// segment removes a row of our markers and one of our rings: 3 wins).
// TODO: a real engine (ring moves, flips, rows) and a search.

readline() // my id
console.log("yes")

const centreDistance = (cell: string) => Math.abs(cell.charCodeAt(0) - 102) + Math.abs(parseInt(cell.slice(1)) - 6)

while (true) {
  const count = parseInt(readline())
  for (let i = 0; i < count; i++) readline()
  const n = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < n; i++) actions.push(readline().trim())
  const removals = (a: string) => (a.match(/x/g) ?? []).length
  let best = actions[Math.floor(Math.random() * actions.length)]
  const most = Math.max(...actions.map(removals))
  if (most > 0) best = actions.find(a => removals(a) === most)!
  else if (actions.every(a => /^[a-k]\d+$/.test(a))) {
    // Placement phase: the most central free cell.
    best = actions.reduce((x, y) => (centreDistance(y) < centreDistance(x) ? y : x))
  }
  console.log(best)
}
