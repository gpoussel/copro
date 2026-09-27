// 🎮 CodinGame Multiplayer - green-circle
// https://www.codingame.com/multiplayer/bot-programming/green-circle
//
// Deck building (Samsara): each turn move to a desk (0-7) to take its skill
// card, then maybe RELEASE an application (a specific skill fills 2 of its
// tasks well and 2 others badly, a BONUS 1 well + 1 badly; bad tasks add
// technical debt cards to the deck). 5 applications win and the 5th must
// be clean. Referee: github.com/societe-generale/GreenCircle.
// Bot: MOVE to the desk whose skill the "cleanest" target application
// still lacks (fewest extra cards needed), then skills many apps use;
// RELEASE the offered app costing the least debt with the current hand;
// other phases pick the first listed move.

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
  const hand = new Array(10).fill(0)
  for (let i = 0; i < lc; i++) {
    const p = readline().trim().split(" ")
    if (p[0] === "OPPONENT_CARDS") continue
    p.slice(1).map(Number).forEach((v, k) => (owned[k] += v))
    if (p[0] === "HAND") p.slice(1).map(Number).forEach((v, k) => (hand[k] = v))
  }
  // Technical debt a release would cost with the cards in hand (a skill
  // card fills 2 of its tasks well, a BONUS 1 task well; the rest is botched).
  const debt = (app: App) => {
    let total = 0
    let good = 0
    for (let k = 0; k < SKILLS; k++) {
      total += app.need[k]
      good += Math.min(app.need[k], 2 * hand[k])
    }
    good = Math.min(total, good + hand[8])
    return total - good
  }
  const mc = parseInt(readline())
  const moves: string[] = []
  for (let i = 0; i < mc; i++) moves.push(readline().trim())
  let out = moves[0] ?? "WAIT"
  if (phase === "MOVE") {
    // The 5th application must be delivered cleanly: aim the deck at the
    // application needing the fewest extra skill cards (2 tasks per card).
    const shortfall = (app: App) =>
      app.need.reduce((t, n, k) => t + Math.max(0, Math.ceil(n / 2) - owned[k]), 0)
    const target = apps.slice().sort((a, b) => shortfall(a) - shortfall(b))[0]
    let best = -Infinity
    for (const m of moves) {
      const p = m.split(" ")
      if (p[0] !== "MOVE") continue
      const z = +p[1]
      let score = 0
      if (target) score += Math.max(0, Math.ceil(target.need[z] / 2) - owned[z]) * 10
      for (const app of apps) score += app.need[z] > 0 ? 1 : 0
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
        return debt(A) - debt(B)
      })
      out = rel[0]
    } else out = "WAIT"
  }
  if (phase === "PLAY_CARD") {
    // Simple cards: clear debt, draw more, get bonuses; else keep the hand.
    const order = ["REFACTORING", "TRAINING", "CODING", "CODE_REVIEW", "ARCHITECTURE_STUDY", "DAILY_ROUTINE"]
    const pick = order
      .map(o => moves.find(m => m.startsWith(o) && (o !== "REFACTORING" || hand[9] > 0)))
      .find(m => m)
    out = pick ?? (moves.find(m => m.startsWith("WAIT")) ?? moves[0] ?? "WAIT")
  } else if (phase === "GIVE_CARD") {
    // Give the skill we hold most of and need least.
    const need = new Array(SKILLS).fill(0)
    for (const app of apps) app.need.forEach((n, k) => (need[k] += n))
    const gives = moves.filter(m => m.startsWith("GIVE"))
    gives.sort((a, b) => {
      const ka = +a.split(" ")[1]
      const kb = +b.split(" ")[1]
      return (need[ka] ?? 99) - (need[kb] ?? 99)
    })
    out = gives[0] ?? moves[0] ?? "WAIT"
  }
  console.log(out)
}
