// 🎮 CodinGame Multiplayer - botters-of-the-galaxy
// https://www.codingame.com/multiplayer/bot-programming/botters-of-the-galaxy
//
// MOBA lane: creeps walk to the enemy tower, heroes fight. Pick HULK (1450
// HP; IRONMAN's 820 HP died to the boss's Hulk even when kiting), then
// DOCTOR_STRANGE for a second hero in later leagues.
// Bot: fight the enemy hero when it is within 400; otherwise stay behind our frontmost creep (the tower targets the closest
// unit); attack the weakest enemy creep in range (last hit when possible),
// the enemy hero if it is in range, else walk back behind the front; with
// no creep of ours ahead, fall back to our tower.

const team = parseInt(readline())
const bushes = parseInt(readline())
for (let i = 0; i < bushes; i++) readline()
const items = parseInt(readline())
for (let i = 0; i < items; i++) readline()
const dir = team === 0 ? 1 : -1
let picks = 0

while (true) {
  readline() // gold
  readline() // enemy gold
  const roundType = parseInt(readline())
  const n = parseInt(readline())
  type U = { id: number; team: number; type: string; x: number; y: number; range: number; hp: number; dmg: number }
  const units: U[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    units.push({ id: +p[0], team: +p[1], type: p[2], x: +p[3], y: +p[4], range: +p[5], hp: +p[6], dmg: +p[9] })
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
  for (const h of heroes) {
    const safeX = front - dir * 60
    const dist = (u: U) => Math.hypot(u.x - h.x, u.y - h.y)
    const inRange = enemies.filter(e => e.type !== "TOWER" && dist(e) <= h.range)
    const lastHit = inRange.filter(e => e.type === "UNIT" && e.hp <= h.dmg).sort((a, b) => a.hp - b.hp)[0]
    const hero = inRange.find(e => e.type === "HERO")
    const creep = inRange.filter(e => e.type === "UNIT").sort((a, b) => a.hp - b.hp)[0]
    const ahead = (h.x - safeX) * dir > 0
    // Fight the enemy hero when it comes close (our tower helps).
    const foe = enemies.find(e => e.type === "HERO" && dist(e) < 400)
    if (foe) {
      out.push(`ATTACK ${foe.id}`)
    } else if (ahead) out.push(`MOVE ${Math.round(safeX)} ${h.y}`)
    else if (lastHit) out.push(`ATTACK ${lastHit.id}`)
    else if (hero) out.push(`ATTACK ${hero.id}`)
    else if (creep) out.push(`ATTACK ${creep.id}`)
    else out.push(`MOVE ${Math.round(safeX)} ${h.y}`)
  }
  console.log(out.join("\n"))
}
