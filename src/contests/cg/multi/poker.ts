// 🎮 CodinGame Multiplayer - poker
// https://www.codingame.com/multiplayer/bot-programming/poker
//
// Texas hold'em, 2-4 players. Monte Carlo equity (random opponent hands and
// board completion, 7-card evaluator) against the opponents still in the
// hand; raise the pot with a strong edge, call when the pot odds allow,
// otherwise check or fold. The legal actions are listed (BET_x = min raise).

const TIME_MS = 40
const RANKS = "23456789TJQKA"
const SUITS = "CDHS"
const card = (s: string) => RANKS.indexOf(s[0]) * 4 + SUITS.indexOf(s[1])

// Score of the best 5 of 7 cards: higher is better.
function evaluate(cards: number[]): number {
  const counts = new Array(13).fill(0)
  const suits = [0, 0, 0, 0]
  const bySuit: number[][] = [[], [], [], []]
  for (const c of cards) {
    counts[c >> 2]++
    suits[c & 3]++
    bySuit[c & 3].push(c >> 2)
  }
  const straightTop = (mask: number) => {
    for (let top = 12; top >= 4; top--) {
      let ok = true
      for (let k = 0; k < 5; k++) if (!(mask & (1 << (top - k)))) ok = false
      if (ok) return top
    }
    // Wheel: A-2-3-4-5.
    if ((mask & 0x100f) === 0x100f) return 3
    return -1
  }
  const flushSuit = suits.findIndex(n => n >= 5)
  if (flushSuit >= 0) {
    const mask = bySuit[flushSuit].reduce((m, r) => m | (1 << r), 0)
    const sf = straightTop(mask)
    if (sf >= 0) return 8e10 + sf
  }
  const ranksDesc = (pred: (n: number) => boolean) => {
    const out: number[] = []
    for (let r = 12; r >= 0; r--) if (pred(counts[r])) out.push(r)
    return out
  }
  const kick = (list: number[], n: number) => list.slice(0, n).reduce((s, r) => s * 13 + r, 0)
  const quads = ranksDesc(n => n === 4)
  if (quads.length) return 7e10 + quads[0] * 13 + ranksDesc(n => n > 0 && n < 4)[0]
  const trips = ranksDesc(n => n === 3)
  const pairs = ranksDesc(n => n === 2)
  if (trips.length && (pairs.length || trips.length > 1))
    return 6e10 + trips[0] * 13 + (trips.length > 1 ? trips[1] : pairs[0])
  if (flushSuit >= 0)
    return (
      5e10 +
      kick(
        bySuit[flushSuit].sort((a, b) => b - a),
        5
      )
    )
  const st = straightTop(counts.reduce((m, n, r) => (n ? m | (1 << r) : m), 0))
  if (st >= 0) return 4e10 + st
  if (trips.length)
    return (
      3e10 +
      trips[0] * 169 +
      kick(
        ranksDesc(n => n === 1),
        2
      )
    )
  if (pairs.length >= 2) {
    const kicker = ranksDesc(n => n > 0).find(r => r !== pairs[0] && r !== pairs[1]) ?? 0
    return 2e10 + pairs[0] * 169 + pairs[1] * 13 + kicker
  }
  if (pairs.length)
    return (
      1e10 +
      pairs[0] * 2197 +
      kick(
        ranksDesc(n => n === 1),
        3
      )
    )
  return kick(
    ranksDesc(n => n === 1),
    5
  )
}

function equity(hand: number[], board: number[], opponents: number, deadline: number): number {
  const used = new Set([...hand, ...board])
  const deck: number[] = []
  for (let c = 0; c < 52; c++) if (!used.has(c)) deck.push(c)
  let wins = 0
  let trials = 0
  while (Date.now() < deadline || trials < 50) {
    // Partial shuffle for the cards we need.
    const need = 5 - board.length + 2 * opponents
    for (let k = 0; k < need; k++) {
      const j = k + Math.floor(Math.random() * (deck.length - k))
      ;[deck[k], deck[j]] = [deck[j], deck[k]]
    }
    const full = [...board, ...deck.slice(0, 5 - board.length)]
    const mine = evaluate([...hand, ...full])
    let result = 1
    for (let o = 0; o < opponents; o++) {
      const off = 5 - board.length + 2 * o
      const theirs = evaluate([deck[off], deck[off + 1], ...full])
      if (theirs > mine) {
        result = 0
        break
      }
      if (theirs === mine) result = Math.min(result, 0.5)
    }
    wins += result
    trials++
    if (trials > 20000) break
  }
  return wins / trials
}

// Header.
for (let i = 0; i < 6; i++) readline() // blinds, level info, buy-in, first big blind
const playerNb = parseInt(readline())
const myId = parseInt(readline())
const folded = new Set<number>()
let currentHand = -1

while (true) {
  readline() // round
  const handNb = parseInt(readline())
  if (handNb !== currentHand) {
    currentHand = handNb
    folded.clear()
  }
  const stacks: number[] = []
  const inPot: number[] = []
  for (let p = 0; p < playerNb; p++) {
    const [s, c] = readline().split(" ").map(Number)
    stacks.push(s)
    inPot.push(c)
  }
  const boardCards = readline()
    .trim()
    .split("_")
    .filter(x => x !== "X")
  const hand = readline().trim().split("_").map(card)
  const na = parseInt(readline())
  for (let i = 0; i < na; i++) {
    const [, h, p, action] = readline().trim().split(" ")
    if (parseInt(h) === handNb && action === "FOLD") folded.add(parseInt(p))
  }
  const ns = parseInt(readline())
  for (let i = 0; i < ns; i++) readline()
  const np = parseInt(readline())
  const possible: string[] = []
  for (let i = 0; i < np; i++) possible.push(readline().trim())
  const deadline = Date.now() + TIME_MS

  const opponents = Math.max(
    1,
    [...Array(playerNb).keys()].filter(p => p !== myId && !folded.has(p) && stacks[p] + inPot[p] > 0).length
  )
  const e = equity(hand, boardCards.map(card), opponents, deadline)
  const pot = inPot.reduce((a, b) => a + b, 0)
  const toCall = Math.max(...inPot) - inPot[myId]
  const bet = possible.find(a => a.startsWith("BET_"))
  const can = (a: string) => possible.includes(a)
  let action = can("CHECK") ? "CHECK" : "FOLD"
  if (e > 0.75 && bet) {
    const minRaise = parseInt(bet.slice(4))
    action = `BET ${Math.max(minRaise, pot)}`
  } else if (e > 0.85 && can("ALL-IN")) action = "ALL-IN"
  else if (toCall > 0 && e > toCall / (pot + toCall) + 0.05 && can("CALL")) action = "CALL"
  console.error(`equity=${e.toFixed(2)} opp=${opponents} toCall=${toCall} pot=${pot}`)
  console.log(action)
}
