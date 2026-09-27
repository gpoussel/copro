// 🎮 CodinGame Multiplayer - green-circle
// https://www.codingame.com/multiplayer/bot-programming/green-circle
// Referee: https://github.com/societe-generale/GreenCircle (config/Boss.java)
//
// Deck building (Samsara): each turn move to a desk (0-7) to take its skill
// card, play a card, maybe RELEASE an application (a skill card fills 2 of
// its tasks well, a BONUS 1; the rest is botched → technical debt). 5 apps
// win, the 5th must be clean. From Bronze: moving back past desk 0 ends a
// cycle (throw 2 cards), ending next to the opponent costs a card, and
// complex cards exist. Bot, built on the boss's logic:
// - MOVE: the first desk ahead whose skill some app needs more of than we
//   own (2 per card + bonuses); prefer desks that do not wrap past 0 and
//   are not next to the opponent;
// - PLAY_CARD: REFACTORING (with debt), DAILY_ROUTINE, ARCHITECTURE_STUDY,
//   CODE_REVIEW, CONTINUOUS_INTEGRATION (automate a card), TRAINING;
// - RELEASE: an app our hand (+ automated cards) covers cleanly, or with at
//   most 2 botched tasks before the 5th;
// - GIVE / THROW: a bonus card if any, else the skill the apps need least.

const SKILLS = 8
const BONUS = 8
const DEBT = 9
type App = { id: number; need: number[] }

while (true) {
  const phase = readline().trim()
  const ac = parseInt(readline())
  const apps: App[] = []
  for (let i = 0; i < ac; i++) {
    const p = readline().trim().split(" ")
    apps.push({ id: +p[1], need: p.slice(2, 2 + SKILLS).map(Number) })
  }
  const [myLoc, myScore] = readline().trim().split(" ").map(Number)
  const [oppLoc] = readline().trim().split(" ").map(Number)
  const lc = parseInt(readline())
  const hand = new Array(10).fill(0)
  const owned = new Array(10).fill(0)
  const automated = new Array(10).fill(0)
  for (let i = 0; i < lc; i++) {
    const p = readline().trim().split(" ")
    const v = p.slice(1).map(Number)
    if (p[0] === "HAND") v.forEach((x, k) => (hand[k] = x))
    if (p[0] === "AUTOMATED") v.forEach((x, k) => (automated[k] = x))
    if (p[0] === "HAND" || p[0] === "DRAW" || p[0] === "DISCARD") v.forEach((x, k) => (owned[k] += x))
  }
  const mc = parseInt(readline())
  const moves: string[] = []
  for (let i = 0; i < mc; i++) moves.push(readline().trim())
  const has = (prefix: string) => moves.find(m => m === prefix || m.startsWith(prefix + " "))
  const totalNeed = new Array(SKILLS).fill(0)
  for (const app of apps) app.need.forEach((n, k) => (totalNeed[k] += n))

  let out = moves[0] ?? "WAIT"
  if (phase === "MOVE") {
    const bonus = owned[BONUS]
    let best = -1
    let bestKey = Infinity
    for (let step = 1; step < 8; step++) {
      const z = (myLoc + step) % 8
      if (!has(`MOVE ${z}`)) continue
      const avail = 2 * owned[z] + bonus
      if (!apps.some(app => app.need[z] > avail)) continue
      const wraps = myLoc >= 0 && z < myLoc
      const near = oppLoc >= 0 && (Math.abs(oppLoc - z) <= 1 || Math.abs(oppLoc - z) === 7)
      const key = step + (wraps ? 6 : 0) + (near ? 3 : 0)
      if (key < bestKey) {
        bestKey = key
        best = z
      }
    }
    if (best < 0) best = (myLoc + 1) % 8
    out = has(`MOVE ${best}`) ? `MOVE ${best}` : (moves.find(m => m.startsWith("MOVE")) ?? out)
  } else if (phase === "PLAY_CARD") {
    let pick: string | undefined
    if (hand[7] > 0 && hand[DEBT] > 0) pick = has("REFACTORING")
    pick = pick ?? (hand[2] > 0 ? has("DAILY_ROUTINE") : undefined)
    pick = pick ?? (hand[4] > 0 ? has("ARCHITECTURE_STUDY") : undefined)
    pick = pick ?? (hand[6] > 0 ? has("CODE_REVIEW") : undefined)
    if (!pick && hand[5] > 0) {
      for (let k = 0; k < 9 && !pick; k++)
        if ((k === 5 && hand[k] > 1) || (k !== 5 && hand[k] > 0)) pick = has(`CONTINUOUS_INTEGRATION ${k}`)
    }
    pick = pick ?? (hand[0] > 0 ? has("TRAINING") : undefined)
    out = pick ?? has("WAIT") ?? "WAIT"
  } else if (phase === "RELEASE") {
    const bonus = hand[BONUS] + automated[BONUS]
    let choice: string | null = null
    let bestMissing = Infinity
    for (const app of apps) {
      if (!has(`RELEASE ${app.id}`)) continue
      let missing = 0
      let spare = bonus
      for (let k = 0; k < SKILLS; k++) {
        const cap = 2 * (hand[k] + automated[k])
        missing += Math.max(0, app.need[k] - cap)
        spare += Math.max(0, cap - app.need[k])
      }
      const clean = missing <= bonus
      const ok = clean || (myScore < 4 && missing <= spare && missing - bonus <= 2)
      if (ok && missing < bestMissing) {
        bestMissing = missing
        choice = `RELEASE ${app.id}`
      }
    }
    out = choice ?? has("WAIT") ?? "WAIT"
  } else if (phase === "GIVE_CARD" || phase === "THROW_CARD") {
    const verb = phase === "GIVE_CARD" ? "GIVE" : "THROW"
    let pick = hand[BONUS] > 0 ? has(`${verb} ${BONUS}`) : undefined
    if (!pick) {
      const opts = moves.filter(m => m.startsWith(verb))
      opts.sort((a, b) => (totalNeed[+a.split(" ")[1]] ?? 99) - (totalNeed[+b.split(" ")[1]] ?? 99))
      pick = opts[0]
    }
    out = pick ?? moves[0] ?? "RANDOM"
  }
  console.log(out)
}
