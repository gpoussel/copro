// Feeds a dumped replay's inputs (our seat) to the bot, printing its outputs next to the recorded ones.
// Run: DBG=<turn> node --import <repo>/node_modules/tsx/dist/esm/index.mjs replay-bot.ts replay.json [from] [to]
import { readFileSync } from "fs"
import { Bot } from "./bot.js"
type Frame = { stdout?: string; stderr?: string; seat: number }
const rp = JSON.parse(readFileSync(process.argv[2], "utf8")) as { frames: Frame[]; agents: { seat: number; pseudo: string }[] }
const meSeat = rp.agents.find(a => a.pseudo === "gpoussel_")!.seat
const from = +(process.argv[3] ?? 1)
const to = +(process.argv[4] ?? 300)
let bot: Bot | null = null
let t = 0
for (const f of rp.frames.slice(1)) {
  if (f.seat !== meSeat) continue
  t++
  let l = (f.stderr ?? "").trim().split("\n")[0].split("|")
  if (!bot) {
    const n = parseInt(l[0])
    bot = new Bot(l.slice(1, n + 1))
    l = l.slice(n + 1)
  }
  const o = bot.turn(l)
  if (t === 1) console.log("plans", bot.planScores)
  if (t >= from && t <= to) console.log(`t${t}: ${o}   (recorded: ${(f.stdout ?? "").trim()})`)
  if (t >= from && t <= to && process.env.IN) console.log("   in: " + l.slice(0, 2).join(" / ") + " / " + l.filter(x => x.split(" ").length === 14).join(" / "))
}
