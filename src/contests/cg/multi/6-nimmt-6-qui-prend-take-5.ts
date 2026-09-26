// 🎮 CodinGame Multiplayer - 6-nimmt-6-qui-prend-take-5
// https://www.codingame.com/multiplayer/bot-programming/6-nimmt-6-qui-prend-take-5
//
// 4 players, simultaneous card choice, cards placed in ascending order onto
// the line ending with the closest lower card; the 6th card or a card lower
// than every line takes a line's cows. **The game phase line comes last in a
// turn's input** (the statement says first). Monte Carlo: for each card in
// hand, sample the opponents' cards among the unseen ones, resolve the turn,
// and play the card with the fewest expected cows.

const TURN_MS = 80
const FIRST_TURN_MS = 600
const cows = (c: number) => (c === 55 ? 7 : c % 11 === 0 ? 5 : c % 10 === 0 ? 3 : c % 5 === 0 ? 2 : 1)

const [playerCount, myId] = readline().split(" ").map(Number)
const nums = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .filter(x => x !== "")
    .map(Number)

let seen = new Set<number>() // cards known out of the unseen pool this round
let firstTurn = true

// Resolves one turn; returns the cows each player picks. `pickFor` chooses
// the line a player takes when their card fits nowhere.
function resolve(lines: number[][], plays: [number, number][]): number[] {
  const taken = new Array(playerCount).fill(0)
  const ls = lines.map(l => l.slice())
  plays.sort((a, b) => a[1] - b[1])
  for (const [p, card] of plays) {
    let best = -1
    for (let k = 0; k < ls.length; k++) {
      const last = ls[k][ls[k].length - 1]
      if (last < card && (best < 0 || last > ls[best][ls[best].length - 1])) best = k
    }
    if (best < 0) {
      // Take the cheapest line.
      let cheapest = 0
      let cost = Infinity
      for (let k = 0; k < ls.length; k++) {
        const c = ls[k].reduce((s, x) => s + cows(x), 0)
        if (c < cost) {
          cost = c
          cheapest = k
        }
      }
      taken[p] += cost
      ls[cheapest] = [card]
    } else if (ls[best].length === 5) {
      taken[p] += ls[best].reduce((s, x) => s + cows(x), 0)
      ls[best] = [card]
    } else ls[best].push(card)
  }
  return taken
}

while (true) {
  const lastPlayed = nums(readline())
  const lines: number[][] = []
  for (let k = 0; k < 4; k++) {
    readline()
    lines.push(nums(readline()))
  }
  readline() // scores
  const handCount = parseInt(readline())
  // With an empty hand the (empty) hand line may still be sent: read lines
  // until the phase keyword shows up.
  let hand: number[] = []
  let phase = readline().trim()
  if (!phase.startsWith("CHOOSE")) {
    hand = nums(phase)
    phase = readline().trim()
  }
  void handCount
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false

  if (handCount === 10) seen = new Set() // new round
  for (const c of lastPlayed) if (c > 0) seen.add(c)
  for (const l of lines) for (const c of l) seen.add(c)

  if (phase === "CHOOSE_LINE_TO_PICK") {
    let cheapest = 0
    let cost = Infinity
    for (let k = 0; k < 4; k++) {
      const c = lines[k].reduce((s, x) => s + cows(x), 0)
      if (c < cost) {
        cost = c
        cheapest = k
      }
    }
    console.log(`PICK ${cheapest}`)
    continue
  }

  const unseen: number[] = []
  for (let c = 1; c <= 104; c++) if (!seen.has(c) && !hand.includes(c)) unseen.push(c)
  const total = new Array(hand.length).fill(0)
  const samples = new Array(hand.length).fill(0)
  let round = 0
  while (Date.now() < deadline && round < 5000) {
    round++
    // One sample of opponents' cards, shared by every candidate.
    const pool = unseen.slice()
    const opp: [number, number][] = []
    for (let p = 0; p < playerCount; p++) {
      if (p === myId || pool.length === 0) continue
      const k = Math.floor(Math.random() * pool.length)
      opp.push([p, pool[k]])
      pool.splice(k, 1)
    }
    for (let i = 0; i < hand.length; i++) {
      const taken = resolve(lines, [...opp, [myId, hand[i]]])
      total[i] += taken[myId]
      samples[i]++
    }
  }
  let best = 0
  for (let i = 1; i < hand.length; i++) {
    const a = total[i] / samples[i]
    const b = total[best] / samples[best]
    // Tie-break: keep middle cards for later, shed extreme ones.
    if (a < b - 1e-9 || (Math.abs(a - b) < 1e-9 && Math.abs(hand[i] - 52) > Math.abs(hand[best] - 52))) best = i
  }
  console.error(`samples=${round} expected=${(total[best] / Math.max(1, samples[best])).toFixed(2)}`)
  console.log(`PLAY ${hand[best]}`)
}
