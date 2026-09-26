// Local referee: node arena.mjs <botA.ts> <botB.ts> [games]
// Plays games alternating first seat and prints A/B/D per game + the tally.
// Relative strength only: this machine is not CodinGame's, so timings here
// do not calibrate the time budget (use the it= counts from IDE games).
import { spawn } from "node:child_process"
import { createInterface } from "node:readline"
const [, , A, B, G = "10"] = process.argv
const LINES = [0o007, 0o070, 0o700, 0o111, 0o222, 0o444, 0o421, 0o124]
const win = m => LINES.some(l => (m & l) === l)
const pop = m => m.toString(2).split("1").length - 1
function startBot(path) {
  const p = spawn("node", ["--import", "tsx", new URL("./shim.mjs", import.meta.url).pathname, path], {
    stdio: ["pipe", "pipe", "pipe"],
  })
  const rl = createInterface({ input: p.stdout })
  const q = []
  let waiter = null
  rl.on("line", l => {
    if (waiter) {
      const w = waiter
      waiter = null
      w(l)
    } else q.push(l)
  })
  let err = ""
  p.stderr.on("data", d => {
    err += d
  })
  return {
    p,
    ask: txt => {
      p.stdin.write(txt)
      return new Promise(r => (q.length ? r(q.shift()) : (waiter = r)))
    },
    err: () => err,
  }
}
async function game(first, second) {
  const bots = [startBot(first), startBot(second)]
  const cells = [new Array(9).fill(0), new Array(9).fill(0)],
    won = [0, 0]
  let closed = 0,
    next = -1,
    turn = 0,
    last = [-1, -1],
    result = -1,
    maxT = [0, 0]
  const moves = () => {
    const out = []
    for (let b = 0; b < 9; b++) {
      if (next >= 0 && b !== next) continue
      if ((closed >> b) & 1) continue
      for (let c = 0; c < 9; c++)
        if (!(((cells[0][b] | cells[1][b]) >> c) & 1))
          out.push([Math.floor(b / 3) * 3 + Math.floor(c / 3), (b % 3) * 3 + (c % 3)])
    }
    return out
  }
  for (let t = 0; result < 0; t++) {
    const ms = moves()
    const t0 = Date.now()
    const ans = await bots[turn].ask(`${last[0]} ${last[1]}\n${ms.length}\n${ms.map(m => m.join(" ")).join("\n")}\n`)
    const dt = Date.now() - t0
    if (t >= 2) maxT[turn] = Math.max(maxT[turn], dt)
    const [r, c0] = ans.trim().split(" ").map(Number)
    if (!ms.some(m => m[0] === r && m[1] === c0)) {
      result = turn ^ 1
      console.log("ILLEGAL", turn, ans)
      break
    }
    const b = Math.floor(r / 3) * 3 + Math.floor(c0 / 3),
      c = (r % 3) * 3 + (c0 % 3)
    cells[turn][b] |= 1 << c
    if (win(cells[turn][b])) {
      won[turn] |= 1 << b
      closed |= 1 << b
      if (win(won[turn])) result = turn
    } else if ((cells[0][b] | cells[1][b]) === 511) closed |= 1 << b
    if (result < 0 && closed === 511) result = pop(won[0]) > pop(won[1]) ? 0 : pop(won[1]) > pop(won[0]) ? 1 : 2
    next = (closed >> c) & 1 ? -1 : c
    last = [r, c0]
    turn ^= 1
  }
  bots.forEach(b => b.p.kill())
  return { result, maxT }
}
const score = { A: 0, B: 0, D: 0 }
let maxA = 0,
  maxB = 0
for (let g = 0; g < +G; g++) {
  const aFirst = g % 2 === 0
  const { result, maxT } = await game(aFirst ? A : B, aFirst ? B : A)
  maxA = Math.max(maxA, maxT[aFirst ? 0 : 1])
  maxB = Math.max(maxB, maxT[aFirst ? 1 : 0])
  if (result === 2) score.D++
  else if ((result === 0) === aFirst) score.A++
  else score.B++
  process.stdout.write(`${result === 2 ? "D" : (result === 0) === aFirst ? "A" : "B"}`)
}
console.log(`\nA=${score.A} B=${score.B} D=${score.D}  maxTurnMs A=${maxA} B=${maxB}`)
