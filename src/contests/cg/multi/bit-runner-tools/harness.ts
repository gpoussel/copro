// Replay check: put the replay frames of both seats (bot dumping its input
// lines to stderr as "I ..." / "T ...|...") in seat0.txt / seat1.txt, then
// `node --import tsx harness.ts` from this folder.
import { readFileSync } from "fs"
import { State, play, target } from "./engine.js"
const parse = (f: string) =>
  readFileSync(f, "utf8").split("\n").slice(1).filter(l => l.startsWith("{")).map(l => eval("(" + l.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null") + ")"))
const us = parse("seat0.txt")
const them = parse("seat1.txt")
const inputs: string[][] = []
let P = { R: 5000, CR: 800, SW: 300 }
for (const f of us) {
  for (const line of (f.stderr ?? "").split("\n")) {
    if (line.startsWith("I ")) {
      const v = line.split(" ").slice(1).map(Number)
      P = { R: v[0], CR: v[1], SW: v[2] }
    } else if (line.startsWith("T ")) inputs.push(line.split("|"))
  }
}
const outsUs = us.map(f => (f.stdout ?? "").trim().split("\n"))
const outsThem = them.map(f => (f.stdout ?? "").trim().split("\n"))
function toState(inp: string[]): State {
  const [, a, b] = inp[0].split(" ").map(Number)
  const s: State = { cars: [], balls: [], score: [a, b], nextId: 0 }
  for (const l of inp.slice(1)) {
    const [id, type, x, y, vx, vy, ang, holds] = l.split(" ").map(Number)
    if (type === 2) s.balls.push({ id, x, y, vx, vy, cap: false, bx: 0, by: 0 })
    else s.cars.push({ id, owner: type, x, y, vx, vy, a: (ang * Math.PI) / 180, ball: holds, bx: 0, by: 0 })
    s.nextId = Math.max(s.nextId, id + 1)
  }
  s.cars.sort((p, q) => p.id - q.id)
  s.balls.sort((p, q) => p.id - q.id)
  return s
}
let bad = 0
for (let k = 0; k + 1 < inputs.length && k < outsUs.length && k < outsThem.length; k++) {
  const s = toState(inputs[k])
  const mine = s.cars.filter(c => c.owner === 0).sort((p, q) => p.id - q.id)
  const foes = s.cars.filter(c => c.owner === 1).sort((p, q) => p.id - q.id)
  mine.forEach((c, i) => {
    const [x, y, th] = outsUs[k][i].split(" ").map(Number)
    target(c, x, y, th)
  })
  foes.forEach((c, i) => {
    const [x, y, th] = outsThem[k][i].split(" ").map(Number)
    target(c, x, y, th)
  })
  play(s, P)
  const next = toState(inputs[k + 1])
  const diffs: string[] = []
  for (const c of next.cars) {
    const m = s.cars.find(q => q.id === c.id)!
    const d = [m.x - c.x, m.y - c.y, m.vx - c.vx, m.vy - c.vy, Math.round((m.a * 180) / Math.PI) % 360 - Math.round((c.a * 180) / Math.PI) % 360]
    if (d.some(v => v !== 0) || (m.ball >= 0) !== (c.ball >= 0)) diffs.push(`car${c.id} ${d.join(",")} ball ${m.ball}/${c.ball}`)
  }
  for (const b of next.balls) {
    const m = s.balls.find(q => q.id === b.id)
    if (!m) diffs.push(`ball${b.id} missing: have ${s.balls.map(q => [q.id, q.x, q.y, q.vx, q.vy].join(",")).join(" ")} want ${[b.x, b.y, b.vx, b.vy].join(",")}`)
    else if (m.x !== b.x || m.y !== b.y || m.vx !== b.vx || m.vy !== b.vy) diffs.push(`ball${b.id} ${m.x - b.x},${m.y - b.y},${m.vx - b.vx},${m.vy - b.vy}`)
  }
  if (next.score[0] !== s.score[0] || next.score[1] !== s.score[1]) diffs.push(`score ${s.score} vs ${next.score}`)
  if (diffs.length) {
    bad++
    if (bad <= 12) console.log(`turn ${k + 1}: ${diffs.join(" | ")}`)
  }
}
console.log(`P=${JSON.stringify(P)} turns=${inputs.length} mismatches=${bad}`)
