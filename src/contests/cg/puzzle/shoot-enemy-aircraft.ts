// 🎮 CodinGame Puzzle - shoot-enemy-aircraft
// https://www.codingame.com/training/easy/shoot-enemy-aircraft

const n: number = parseInt(readline())
const rows: string[] = []
for (let i = 0; i < n; i++) rows.push(readline())
const ground: string = rows[n - 1]
const launcher: number = ground.indexOf("^")
const shootTurns: number[] = []
for (let r = 0; r < n - 1; r++) {
  const line: string = rows[r]
  const height: number = n - 1 - r
  for (let c = 0; c < line.length; c++) {
    const ch: string = line[c]
    if (ch === ">" || ch === "<") {
      const dir: number = ch === ">" ? 1 : -1
      const reach: number = (launcher - c) / dir
      if (Number.isInteger(reach) && reach >= 0) {
        const shot: number = reach - height - 1
        if (shot >= 0) shootTurns.push(shot)
      }
    }
  }
}
shootTurns.sort((a, b) => a - b)
const used: Set<number> = new Set<number>()
for (const t of shootTurns) {
  let slot: number = t
  while (used.has(slot)) slot++
  used.add(slot)
}
const last: number = used.size > 0 ? Math.max(...Array.from(used)) : -1
const out: string[] = []
for (let t = 0; t <= last; t++) out.push(used.has(t) ? "SHOOT" : "WAIT")
console.log(out.join("\n"))
