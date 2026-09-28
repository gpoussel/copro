// Clone fidelity: on dumped replays vs the Gold boss, feed Boss5 the boss's view of each turn and
// compare its per-troll action (kind + target cell) with what the real boss did.
import { readFileSync, readdirSync } from "fs"
import { gameFromInput } from "./bot.js"
import { turnInput } from "./engine.js"
import { Boss5 } from "./boss5.js"
type Frame = { stdout?: string; stderr?: string; seat: number }
const dir = process.argv[2]
const files = process.argv.slice(3).length ? process.argv.slice(3) : readdirSync(dir).filter(f => f.endsWith(".json")).map(f => dir + "/" + f)
const stat: Record<string, [number, number]> = {}
const conf: Record<string, number> = {}
for (const file of files) {
  const rp = JSON.parse(readFileSync(file, "utf8")) as { frames: Frame[]; agents: { seat: number; pseudo: string }[] }
  const me = rp.agents.find(a => a.pseudo === "gpoussel_")
  const boss = rp.agents.find(a => a.pseudo.startsWith("Boss 5"))
  if (!me || !boss) continue
  let init: string[] = []
  const inputs: string[][] = []
  const bossOut: string[] = []
  for (const f of rp.frames.slice(1)) {
    if (f.seat === me.seat) {
      let l = (f.stderr ?? "").trim().split("\n")[0].split("|")
      if (!inputs.length) {
        const n = parseInt(l[0])
        if (isNaN(n)) break
        init = l.slice(1, n + 1)
        l = l.slice(n + 1)
      }
      inputs.push(l)
    } else bossOut.push((f.stdout ?? "").trim().replace(/MSG [^;]*;?/, ""))
  }
  if (!inputs.length) continue
  const oppInit = [init[0], ...init.slice(1).map(r => r.replace(/[01]/g, ch => (ch === "0" ? "1" : "0")))]
  const clone = new Boss5(oppInit)
  const W = +init[0].split(" ")[0]
  for (let t = 0; t < inputs.length && t < bossOut.length; t++) {
    const g = gameFromInput(init, inputs[t], t)
    const out = clone.turn(turnInput(g, 1))
    const parse = (s: string) => {
      const m = new Map<string, string>()
      for (const c of s.split(";")) {
        const w = c.trim().split(/\s+/)
        if (w[0] === "TRAIN") m.set("T", c.trim())
        else if (w.length > 1 && w[0] !== "WAIT" && w[0] !== "MSG") m.set(w[1], w[0] + (w[0] === "MOVE" ? "" : ""))
      }
      return m
    }
    const real = parse(bossOut[t])
    for (const c of bossOut[t].split(";")) {
      const w = c.trim().split(/\s+/)
      if (w[0] === "PICK") clone.picked.set(+w[1], w[2] === "BANANA" ? 3 : 2)
      if (w[0] === "PLANT" || w[0] === "DROP") clone.picked.delete(+w[1])
    }
    const mine = parse(out)
    for (const u of g.trolls.filter(x => x.owner === 1)) {
      const r = real.get(String(u.id)) ?? "WAIT"
      const c = mine.get(String(u.id)) ?? "WAIT"
      const role = u.harvest === 0 && u.chop >= 2 ? "cutter" : "gardener"
      stat[role + " " + r] = stat[role + " " + r] ?? [0, 0]
      stat[role + " " + r][1]++
      if (r === c) stat[role + " " + r][0]++
      else conf[`${role} real ${r} clone ${c}`] = (conf[`${role} real ${r} clone ${c}`] ?? 0) + 1
    }
    const rt = real.get("T")
    if (rt) conf[`train real ${rt} clone ${mine.get("T") ?? "-"} @t${t + 1}`] = 1
    void W
  }
}
for (const k of Object.keys(stat).sort()) console.log(k, stat[k][0], "/", stat[k][1])
for (const [k, v] of Object.entries(conf).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(v, k)
