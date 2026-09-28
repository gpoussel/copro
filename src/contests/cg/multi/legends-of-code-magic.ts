// 🎮 CodinGame Multiplayer - legends-of-code-magic
// https://www.codingame.com/multiplayer/bot-programming/legends-of-code-magic
//
// LOCM: a 30-turn draft (PICK 0/1/2 of 3 cards) then a one-board battle
// (≤ 6 creatures). Same heuristics as legends-of-code-magic-constructed:
// - draft: ClosetAI's leaked card values, with a mana-curve penalty;
// - battle: lethal check, greedy summons, items (red on threats, green on
//   our creatures, blue damage to face), guards first, favourable trades,
//   the rest to face.

interface Card {
  number: number
  id: number
  location: number
  type: number // 0 creature, 1 green, 2 red, 3 blue
  cost: number
  attack: number
  defense: number
  abilities: string
  myHp: number
  oppHp: number
  draw: number
  canAttack?: boolean
}
const has = (c: Card, a: string) => c.abilities.includes(a)

function readState() {
  const players = [0, 1].map(() => {
    const [health, mana, deck, , draw] = readline().split(" ").map(Number)
    return { health, mana, deck, draw }
  })
  const [, opponentActions] = readline().split(" ").map(Number)
  for (let i = 0; i < opponentActions; i++) readline()
  const n = parseInt(readline())
  const cards: Card[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const v = p.map(Number)
    cards.push({
      number: v[0],
      id: v[1],
      location: v[2],
      type: v[3],
      cost: v[4],
      attack: v[5],
      defense: v[6],
      abilities: p[7],
      myHp: v[8],
      oppHp: v[9],
      draw: v[10],
    })
  }
  return { me: players[0], opp: players[1], cards }
}

// --- Constructed phase --------------------------------------------------------

function cardValue(c: Card): number {
  if (c.type === 0) {
    let v = c.attack + c.defense
    if (has(c, "G")) v += 1.5
    if (has(c, "W")) v += c.attack * 0.5 + 1
    if (has(c, "L")) v += 2
    if (has(c, "D")) v += c.attack * 0.3
    if (has(c, "B")) v += 0.5
    if (has(c, "C")) v += 0.5
    if (c.attack === 0) v -= 3
    v += c.draw * 1.5 + (c.myHp - c.oppHp) * 0.3
    return v - 2 * c.cost
  }
  // Items: removal and damage are the useful ones.
  let v = Math.abs(c.attack) + Math.abs(c.defense) + c.draw * 1.5 + (c.myHp - c.oppHp) * 0.4
  if (c.type === 2 && c.abilities.includes("G")) v += 1
  return v - 2 * c.cost - 1
}

const curve = new Map<number, number>() // cost bucket -> picked
let items = 0
// ClosetAI's leaked draft values (indexed by cardNumber − 1), as used by
// gym-locm's ClosetAIDraftAgent (github.com/ronaldosvieira/gym-locm).
const CLOSET = [
  -666, 65, 50, 80, 50, 70, 71, 115, 71, 73, 43, 77, 62, 63, 50, 66, 60, 66, 90, 75, 50, 68, 67, 100, 42, 63, 67, 52,
  69, 90, 60, 47, 87, 81, 67, 62, 75, 94, 56, 62, 51, 61, 43, 54, 97, 64, 67, 49, 109, 111, 89, 114, 93, 92, 89, 2, 54,
  25, 63, 76, 58, 99, 79, 19, 82, 115, 106, 104, 146, 98, 70, 56, 65, 52, 54, 65, 55, 77, 48, 84, 115, 75, 89, 68, 80,
  71, 46, 73, 69, 47, 63, 70, 11, 71, 54, 85, 77, 77, 64, 82, 62, 49, 43, 78, 67, 72, 67, 36, 48, 75, -8, 82, 69, 32,
  87, 98, 124, 35, 60, 59, 49, 72, 54, 35, 22, 50, 54, 51, 54, 59, 38, 31, 43, 62, 55, 57, 41, 70, 38, 76, 1, -100,
  -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100,
]
function draft(cards: Card[]): string {
  const limit = (cost: number) =>
    cost <= 1 ? 4 : cost <= 2 ? 6 : cost <= 3 ? 6 : cost <= 4 ? 5 : cost <= 5 ? 4 : cost <= 6 ? 3 : 2
  let best = 0
  let bestScore = -Infinity
  cards.forEach((c, i) => {
    const bucket = Math.min(c.cost, 7)
    let score = CLOSET[c.number - 1] ?? cardValue(c) * 10
    if ((curve.get(bucket) ?? 0) >= limit(c.cost)) score -= 15
    if (c.type !== 0 && items >= 10) score -= 15
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  })
  const c = cards[best]
  curve.set(Math.min(c.cost, 7), (curve.get(Math.min(c.cost, 7)) ?? 0) + 1)
  if (c.type !== 0) items++
  return `PICK ${best}`
}

// --- Battle phase -------------------------------------------------------------

function battle(state: ReturnType<typeof readState>): string {
  const actions: string[] = []
  let mana = state.me.mana
  let oppHp = state.opp.health
  const hand = state.cards.filter(c => c.location === 0)
  const mine = state.cards.filter(c => c.location === 1).map(c => ({ ...c, canAttack: true }))
  const theirs = state.cards.filter(c => c.location === -1)

  // Summons: the subset of creatures (≤ board space) that uses the most
  // mana, ties by total value (hand ≤ 8: brute force over subsets).
  const creatures = hand.filter(c => c.type === 0)
  let bestSet: Card[] = []
  let bestKey = -Infinity
  for (let m = 0; m < 1 << creatures.length; m++) {
    const set = creatures.filter((_, i) => (m >> i) & 1)
    const cost = set.reduce((t, c) => t + c.cost, 0)
    if (cost > mana || mine.length + set.length > 6) continue
    const key = cost * 100 + set.reduce((t, c) => t + cardValue(c) + c.cost * 2, 0)
    if (key > bestKey) {
      bestKey = key
      bestSet = set
    }
  }
  for (const c of bestSet) {
    actions.push(`SUMMON ${c.id}`)
    mana -= c.cost
    oppHp += c.oppHp
    mine.push({ ...c, canAttack: has(c, "C") })
  }
  // Items.
  for (const it of hand.filter(c => c.type !== 0)) {
    if (it.cost > mana) continue
    if (it.type === 1 && mine.length) {
      const target = mine.slice().sort((a, b) => b.attack + b.defense - (a.attack + a.defense))[0]
      actions.push(`USE ${it.id} ${target.id}`)
      target.attack += it.attack
      target.defense += it.defense
      if (it.abilities.includes("G") && !has(target, "G")) target.abilities += "G"
    } else if (it.type === 2 && theirs.length) {
      const target = theirs
        .slice()
        .sort((a, b) => (has(b, "G") ? 5 : 0) + b.attack - ((has(a, "G") ? 5 : 0) + a.attack))[0]
      actions.push(`USE ${it.id} ${target.id}`)
      target.defense += it.defense
      target.attack = Math.max(0, target.attack + it.attack)
      if (it.abilities.includes("G")) target.abilities = target.abilities.replace("G", "-")
      if (target.defense <= 0) theirs.splice(theirs.indexOf(target), 1)
    } else if (it.type === 3) {
      actions.push(`USE ${it.id} -1`)
      oppHp += it.oppHp + Math.min(0, it.defense)
    } else continue
    mana -= it.cost
  }
  // Attacks: guards first, favourable trades unless we have lethal, face.
  const attackers = mine.filter(c => c.canAttack && c.attack > 0)
  const enemies = theirs
  const faceDamage = attackers.reduce((s, c) => s + c.attack, 0)
  for (const a of attackers.sort((x, y) => y.attack - x.attack)) {
    const guards = enemies.filter(e => has(e, "G") && e.defense > 0)
    let target: Card | null = null
    if (guards.length) target = guards.sort((x, y) => x.defense - y.defense)[0]
    else if (faceDamage < oppHp) {
      target =
        enemies
          .filter(e => e.defense > 0 && (a.attack >= e.defense || has(a, "L")) && (e.attack < a.defense || has(a, "W")))
          .sort((x, y) => y.attack - x.attack)[0] ?? null
    }
    if (target) {
      actions.push(`ATTACK ${a.id} ${target.id}`)
      if (has(target, "W")) target.abilities = target.abilities.replace("W", "-")
      else target.defense = has(a, "L") ? 0 : target.defense - a.attack
    } else {
      actions.push(`ATTACK ${a.id} -1`)
      oppHp -= a.attack
    }
  }
  return actions.length ? actions.join(";") : "PASS"
}

while (true) {
  const state = readState()
  // Draft: mana is 0 and the 3 offered cards are listed.
  if (state.me.mana === 0) console.log(draft(state.cards))
  else console.log(battle(state))
}
