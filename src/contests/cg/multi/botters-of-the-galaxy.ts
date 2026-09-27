// 🎮 CodinGame Multiplayer - botters-of-the-galaxy
// https://www.codingame.com/multiplayer/bot-programming/botters-of-the-galaxy
//
// MOBA lane: creeps walk to the enemy tower, heroes fight. Pick HULK (1450
// HP; IRONMAN's 820 HP died to the boss's Hulk even when kiting), then
// DOCTOR_STRANGE for a second hero in later leagues.
// Duel mode while towers are harmless (Wood 6-4), lane mode after (see
// below); the best affordable item is bought whenever gold allows.

const team = parseInt(readline())
const bushes = parseInt(readline())
for (let i = 0; i < bushes; i++) readline()
// Items: name cost damage health maxHealth mana maxMana moveSpeed
// manaRegeneration isPotion.
type Item = { name: string; cost: number; value: number }
const shop: Item[] = []
const itemCount = parseInt(readline())
for (let i = 0; i < itemCount; i++) {
  const p = readline().trim().split(" ")
  const v = p.map(Number)
  if (v[9] === 1) continue // potions
  shop.push({ name: p[0], cost: v[1], value: 15 * v[2] + v[4] + 2 * v[7] })
}
const dir = team === 0 ? 1 : -1
let picks = 0

while (true) {
  const gold = parseInt(readline())
  readline() // enemy gold
  const roundType = parseInt(readline())
  const n = parseInt(readline())
  type U = { id: number; team: number; type: string; x: number; y: number; range: number; hp: number; maxHp: number; dmg: number; items: number }
  const units: U[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    units.push({ id: +p[0], team: +p[1], type: p[2], x: +p[3], y: +p[4], range: +p[5], hp: +p[6], maxHp: +p[7], dmg: +p[9], items: +p[21] })
  }
  if (roundType < 0) {
    console.log(picks++ === 0 ? "HULK" : "DOCTOR_STRANGE")
    continue
  }
  const heroes = units.filter(u => u.team === team && u.type === "HERO")
  const myCreeps = units.filter(u => u.team === team && u.type === "UNIT")
  const tower = units.find(u => u.team === team && u.type === "TOWER")!
  const enemies = units.filter(u => u.team !== team && u.team >= 0 && u.team <= 1)
  const front = myCreeps.length ? (dir > 0 ? Math.max(...myCreeps.map(c => c.x)) : Math.min(...myCreeps.map(c => c.x))) : tower.x
  const out: string[] = []
  // Buy the best affordable item (damage first) while slots remain.
  const buyer = heroes.find(h => h.items < 4)
  const buy = buyer ? shop.filter(it => it.cost <= gold).sort((a, b) => b.value - a.value)[0] : undefined
  const bought = buy ? buyer!.id : -1
  // Wood 6-5 have no creeps (towers: 1500 HP, 1 damage; referee
  // github.com/Illedan/BOTG-Refree): a duel. HULK beats every hero head-on,
  // so attack whichever of the enemy hero / tower dies sooner, and the hero
  // whenever our tower would fall first.
  // Wood 4 adds creeps but towers still deal 1 damage: the duel holds.
  const harmless = enemies.some(e => e.type === "TOWER" && e.dmg <= 1)
  if (harmless) {
    const foeTower = enemies.find(e => e.type === "TOWER")
    for (const h of heroes) {
      const foe = enemies.find(e => e.type === "HERO")
      const d = (u: U) => Math.hypot(u.x - h.x, u.y - h.y)
      const eta = (u: U) => Math.max(0, d(u) - h.range) / 200 + Math.ceil(u.hp / h.dmg)
      let target = foe ?? foeTower
      if (foe && foeTower) {
        const oursFalls = Math.hypot(foe.x - tower.x, foe.y - tower.y) <= foe.range + 50 ? tower.hp / Math.max(1, foe.dmg) : Infinity
        // Fight back when it can hit us: its kiting would win the race.
        const hitsUs = d(foe) <= foe.range + 50
        target = hitsUs || eta(foe) <= eta(foeTower) || oursFalls < eta(foeTower) ? foe : foeTower
      }
      out.push(h.id === bought ? `BUY ${buy!.name}` : target ? `ATTACK ${target.id}` : "WAIT")
    }
    console.log(out.join("\n"))
    continue
  }
  // Lane mode (towers deal 190 per hit): never enter the enemy tower's
  // range, last-hit enemy creeps and deny ours (≤ 40 % HP) — the tie-break
  // at turn 200 is kills + denies —, duel the enemy hero away from its
  // tower, retreat when low.
  const foeTower = enemies.find(e => e.type === "TOWER")
  const inTowerRange = (x: number, y: number) =>
    !!foeTower && Math.hypot(x - foeTower.x, y - foeTower.y) <= foeTower.range + 40
  const allCreeps = units.filter(u => u.type === "UNIT")
  for (const h of heroes) {
    if (h.id === bought) {
      out.push(`BUY ${buy!.name}`)
      continue
    }
    const dist = (u: U) => Math.hypot(u.x - h.x, u.y - h.y)
    const reach = h.range + 150 // move part of the turn, then hit
    const safeX = front - dir * 60
    const low = h.hp < 0.3 * h.maxHp
    const canHit = (u: U) => dist(u) <= reach && !inTowerRange(u.x, u.y)
    const lastHit = allCreeps
      .filter(c => canHit(c) && c.hp <= h.dmg && (c.team !== team || c.hp <= 0.4 * c.maxHp))
      .sort((a, b) => (b.team !== team ? 1 : 0) - (a.team !== team ? 1 : 0) || a.hp - b.hp)[0]
    const foe = enemies.find(e => e.type === "HERO" && dist(e) <= 400 && !inTowerRange(e.x, e.y))
    const creep = enemies.filter(e => e.type === "UNIT" && canHit(e)).sort((a, b) => a.hp - b.hp)[0]
    if (low) out.push(`MOVE ${tower.x + dir * 80} ${tower.y}`)
    else if (lastHit) out.push(`ATTACK ${lastHit.id}`)
    else if (foe && h.hp > foe.hp) out.push(`ATTACK ${foe.id}`)
    else if ((h.x - safeX) * dir > 0 || inTowerRange(h.x, h.y)) out.push(`MOVE ${Math.round(safeX)} ${h.y}`)
    else if (creep && creep.hp > 2 * h.dmg) out.push(`ATTACK ${creep.id}`)
    else out.push(`MOVE ${Math.round(safeX)} ${h.y}`)
  }
  console.log(out.join("\n"))
}
