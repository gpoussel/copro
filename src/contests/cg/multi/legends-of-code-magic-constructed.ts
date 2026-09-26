// 🎮 CodinGame Multiplayer - legends-of-code-magic-constructed
// https://www.codingame.com/multiplayer/bot-programming/legends-of-code-magic-constructed
//
// LOCM with a constructed phase (pick 30 of 120 cards, up to 2 copies each)
// then 2-lane battles. Heuristic bot:
// - deck: value-per-cost score with a mana curve (≈ 18 creatures);
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
  area: number
  lane: number
  canAttack?: boolean
}
const has = (c: Card, a: string) => c.abilities.includes(a)

function readState() {
  const players = [0, 1].map(() => {
    const [health, mana, deck, draw] = readline().split(" ").map(Number)
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
      area: v[11],
      lane: v[12],
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
    if (c.area) v *= 1.6
    return v - 2 * c.cost
  }
  // Items: removal and damage are the useful ones.
  let v = Math.abs(c.attack) + Math.abs(c.defense) + c.draw * 1.5 + (c.myHp - c.oppHp) * 0.4
  if (c.type === 2 && c.abilities.includes("G")) v += 1
  if (c.area) v *= 1.5
  return v - 2 * c.cost - 1
}

function construct(cards: Card[]): string {
  const ranked = cards.slice().sort((a, b) => cardValue(b) - cardValue(a))
  const curve = new Map<number, number>() // cost bucket -> picked
  const limit = (cost: number) =>
    cost <= 1 ? 4 : cost <= 2 ? 6 : cost <= 3 ? 6 : cost <= 4 ? 5 : cost <= 5 ? 4 : cost <= 6 ? 3 : 2
  const picks: number[] = []
  let items = 0
  for (const pass of [0, 1]) {
    for (const c of ranked) {
      for (let copy = 0; copy < 2 && picks.length < 30; copy++) {
        if (picks.filter(x => x === c.number).length >= 2) break
        const bucket = Math.min(c.cost, 7)
        if (pass === 0 && (curve.get(bucket) ?? 0) >= limit(c.cost)) break
        if (pass === 0 && c.type !== 0 && items >= 10) break
        picks.push(c.number)
        curve.set(bucket, (curve.get(bucket) ?? 0) + 1)
        if (c.type !== 0) items++
      }
    }
  }
  return picks.map(id => `CHOOSE ${id}`).join(";")
}

// --- Battle phase -------------------------------------------------------------

function battle(state: ReturnType<typeof readState>): string {
  const actions: string[] = []
  let mana = state.me.mana
  let oppHp = state.opp.health
  const hand = state.cards.filter(c => c.location === 0)
  const mine = state.cards.filter(c => c.location === 1).map(c => ({ ...c, canAttack: true }))
  const theirs = state.cards.filter(c => c.location === -1)
  const laneCount = (l: number) => mine.filter(c => c.lane === l).length

  // Summons: best value first while mana allows.
  const creatures = hand
    .filter(c => c.type === 0)
    .sort((a, b) => cardValue(b) + b.cost * 2 - (cardValue(a) + a.cost * 2))
  for (const c of creatures) {
    if (c.cost > mana) continue
    // Lane with fewer creatures, or where the enemy is stronger (to defend).
    const lanes = [0, 1].filter(l => laneCount(l) < 3)
    if (!lanes.length) break
    const pressure = (l: number) => theirs.filter(t => t.lane === l).reduce((s, t) => s + t.attack, 0)
    const lane = lanes.sort((a, b) => pressure(b) - pressure(a) || laneCount(a) - laneCount(b))[0]
    actions.push(`SUMMON ${c.id} ${lane}`)
    mana -= c.cost
    oppHp += c.oppHp
    mine.push({ ...c, lane, canAttack: has(c, "C") })
    if (c.area === 2 && laneCount(1 - lane) < 3)
      mine.push({ ...c, id: c.id + 1, lane: 1 - lane, canAttack: has(c, "C") })
    if (c.area === 1 && laneCount(lane) < 3) mine.push({ ...c, id: c.id + 1, lane, canAttack: has(c, "C") })
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
  // Attacks, lane by lane.
  for (const lane of [0, 1]) {
    const attackers = mine.filter(c => c.lane === lane && c.canAttack && c.attack > 0)
    const enemies = theirs.filter(c => c.lane === lane)
    const faceDamage = attackers.reduce((s, c) => s + c.attack, 0)
    for (const a of attackers.sort((x, y) => y.attack - x.attack)) {
      const guards = enemies.filter(e => has(e, "G") && e.defense > 0)
      let target: Card | null = null
      if (guards.length) target = guards.sort((x, y) => x.defense - y.defense)[0]
      else if (faceDamage < oppHp) {
        // Favourable trade: kill it and survive.
        target =
          enemies
            .filter(
              e => e.defense > 0 && (a.attack >= e.defense || has(a, "L")) && (e.attack < a.defense || has(a, "W"))
            )
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
  }
  return actions.length ? actions.join(";") : "PASS"
}

let turn = 0
while (true) {
  const state = readState()
  // Constructed phase: mana is 0 and 120 cards are offered.
  if (turn === 0 && state.me.mana === 0 && state.cards.length === 120) console.log(construct(state.cards))
  else console.log(battle(state))
  turn++
}
