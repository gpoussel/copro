// 🎮 CodinGame Multiplayer - fireworks
// https://www.codingame.com/multiplayer/bot-programming/fireworks
//
// Hanabi for 3 of the 4 players per round. Each turn the referee repeats the
// whole knowledge as CARD lines (ours with "?" for unknown parts) plus the
// last actions; fireworks progress is tracked from PLAY lines (reset on
// NEWGAME, whose player id is ours for the round). Policy: play a surely
// playable card, else hint a partner's playable card, else discard a useless
// or the least-known card.

const COLORS = ["WHITE", "RED", "BLUE", "GREEN", "YELLOW"]
const LETTERS = "ABCDE"
let myId = 0
// Cards left to draw: 50 − 3 hands of 5. Discarding with an empty deck is an
// invalid action ("no more card").
let deck = 35
// Our occupied hand slots: with an empty deck a played/discarded slot stays
// empty (letters do not shift), and naming it is invalid.
let slots = new Set(LETTERS)
let fireworks: Record<string, number> = {}
const resetFireworks = () => (fireworks = Object.fromEntries(COLORS.map(c => [c, 0])))
resetFireworks()

interface Card {
  color: string // "?" if unknown
  level: number // 0 if unknown
}

while (true) {
  const [, infos] = readline().split(" ").map(Number)
  const n = parseInt(readline())
  const mine = new Map<string, Card>()
  const others = new Map<number, Map<string, Card>>()
  for (let i = 0; i < n; i++) {
    const parts = readline().trim().split(":")
    const p = parseInt(parts[0])
    const kind = parts[1]
    if (kind === "NEWGAME") {
      myId = p
      deck = 35
      slots = new Set(LETTERS)
      resetFireworks()
    }
    if (kind === "PLAY" || kind === "DISCARD" || kind === "ERROR") deck = Math.max(0, deck - 1)
    if (kind === "PLAY") {
      const [color, level] = parts[3].split("-")
      fireworks[color] = Math.max(fireworks[color], parseInt(level))
    } else if (kind === "CARD") {
      const [color, level] = parts[3].split("-")
      const card = { color, level: level === "?" ? 0 : parseInt(level) }
      if (p === myId) mine.set(parts[2], card)
      else {
        if (!others.has(p)) others.set(p, new Map())
        others.get(p)!.set(parts[2], card)
      }
    }
  }
  const playable = (c: Card) =>
    c.level > 0 &&
    (c.color !== "?" ? fireworks[c.color] + 1 === c.level : COLORS.every(col => fireworks[col] + 1 === c.level))
  const useless = (c: Card) =>
    c.level > 0 && (c.color !== "?" ? fireworks[c.color] >= c.level : COLORS.every(col => fireworks[col] >= c.level))

  let action = ""
  // 1. A card we know is playable.
  for (const l of [...LETTERS].filter(x => slots.has(x))) {
    const c = mine.get(l)
    if (c && playable(c)) {
      action = `PLAY:${l}`
      break
    }
  }
  // 2. Hint a partner about a playable card they do not know yet.
  if (!action && infos > 0) {
    for (const [p, hand] of others) {
      for (const c of hand.values()) {
        if (c.color === "?" || c.level === 0) continue
        if (fireworks[c.color] + 1 === c.level) {
          action = `SAY:${p}:${c.level}`
          break
        }
      }
      if (action) break
    }
  }
  // 3. Discard (only allowed below 12 infos): a useless card, else the least known.
  if (!action && infos < 12 && deck > 0) {
    let pick = [...slots][0] ?? "A"
    let bestKnown = Infinity
    for (const l of [...LETTERS].filter(x => slots.has(x))) {
      const c = mine.get(l) ?? { color: "?", level: 0 }
      if (useless(c)) {
        pick = l
        break
      }
      const known = (c.color !== "?" ? 1 : 0) + (c.level > 0 ? 1 : 0)
      if (known < bestKnown) {
        bestKnown = known
        pick = l
      }
    }
    action = `DISCARD:${pick}`
  }
  // 4. Nothing else allowed: hint anything, else play our likeliest card.
  if (!action) {
    const p = [...others.keys()][0] ?? (myId + 1) % 3
    if (infos > 0) action = `SAY:${p}:1`
    else {
      let pick = [...slots][0] ?? "A"
      for (const l of [...LETTERS].filter(x => slots.has(x))) {
        const c = mine.get(l)
        if (c && c.level > 0 && COLORS.some(col => fireworks[col] + 1 === c.level)) pick = l
      }
      action = `PLAY:${pick}`
    }
  }
  const [verb, letter] = action.split(":")
  if ((verb === "PLAY" || verb === "DISCARD") && deck === 0) slots.delete(letter)
  console.log(action)
}
