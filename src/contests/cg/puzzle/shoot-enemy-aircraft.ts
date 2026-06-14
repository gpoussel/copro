// 🎮 CodinGame Puzzle - shoot-enemy-aircraft
// https://www.codingame.com/training/easy/shoot-enemy-aircraft

const n: number = parseInt(readline())
const rows: string[] = []
for (let i = 0; i < n; i++) rows.push(readline())

const groundRow = n - 1
const launcherCol = rows[groundRow].indexOf("^")

const shootTurns: number[] = []
for (let r = 0; r < groundRow; r++) {
  const line = rows[r]
  for (let x = 0; x < line.length; x++) {
    const ch = line[x]
    if (ch === ">" || ch === "<") {
      const dir = ch === ">" ? 1 : -1
      const s = (launcherCol - x) / dir
      const t = s - (groundRow - r) - 1
      shootTurns.push(t)
    }
  }
}

const counts: { [turn: number]: number } = {}
let maxTurn = -1
for (const t of shootTurns) {
  counts[t] = (counts[t] || 0) + 1
  if (t > maxTurn) maxTurn = t
}

const out: string[] = []
for (let turn = 0; turn <= maxTurn; turn++) {
  out.push(counts[turn] ? "SHOOT" : "WAIT")
}
console.log(out.join("\n"))
