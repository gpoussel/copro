// 🎮 CodinGame Multiplayer - green-circle
// https://www.codingame.com/multiplayer/bot-programming/green-circle
//
// Deck building (Samsara): each turn move to a desk (0-7, one-way) to take
// its skill card, then maybe RELEASE an application (tasks paid by skill
// cards; a specific skill fills 2 of its tasks well and 2 others badly, a
// BONUS 1 well + 1 badly; bad tasks give technical debt). 5 applications
// win. Bot: MOVE to the desk whose card most reduces the missing tasks of
// the applications closest to completion (over all our cards); RELEASE the
// offered application with the fewest missing tasks; other phases pick the
// first listed move.

const SKILLS = 8
type App = { id: number; need: number[] }

while (true) {
  const phase = readline().trim()
  const ac = parseInt(readline())
  const apps: App[] = []
  for (let i = 0; i < ac; i++) {
    const p = readline().trim().split(" ")
    apps.push({ id: +p[1], need: p.slice(2, 2 + SKILLS).map(Number) })
  }
  readline() // me
  readline() // opponent
  const lc = parseInt(readline())
  const owned = new Array(10).fill(0)
  for (let i = 0; i < lc; i++) {
    const p = readline().trim().split(" ")
    if (p[0] === "OPPONENT_CARDS") continue
    p.slice(1).map(Number).forEach((v, k) => (owned[k] += v))
  }
  const mc = parseInt(readline())
  const moves: string[] = []
  for (let i = 0; i < mc; i++) moves.push(readline().trim())
  // Tasks still missing for an app with a given card collection.
  const missing = (app: App, cards: number[]) => {
    let good = 0
    let short = 0
    for (let k = 0; k < SKILLS; k++) {
      const covered = Math.min(app.need[k], 2 * cards[k])
      good += covered
      short += app.need[k] - covered
    }
    // Bonus cards and spare skills fill the rest (badly).
    return Math.max(0, short - cards[8] * 2) + 0 * good
  }
  let out = moves[0] ?? "WAIT"
  if (phase === "MOVE") {
    let best = -Infinity
    for (const m of moves) {
      const p = m.split(" ")
      if (p[0] !== "MOVE") continue
      const z = +p[1]
      const cards = owned.slice()
      cards[z]++
      let score = 0
      for (const app of apps) {
        const before = missing(app, owned)
        const after = missing(app, cards)
        score += (before - after) / (before + 1)
      }
      if (score > best) {
        best = score
        out = m
      }
    }
  } else if (phase === "RELEASE") {
    const rel = moves.filter(m => m.startsWith("RELEASE"))
    if (rel.length) {
      rel.sort((a, b) => {
        const A = apps.find(x => x.id === +a.split(" ")[1])!
        const B = apps.find(x => x.id === +b.split(" ")[1])!
        return missing(A, owned) - missing(B, owned)
      })
      out = rel[0]
    } else out = "WAIT"
  }
  console.log(out)
}
