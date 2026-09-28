// 🎮 CodinGame Multiplayer - spring-challenge-2022
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2022
//
// 3 heroes per side, monsters walk to a base within 5000 and hit it within
// 300 (3 hits lose). Heroes hit monsters within 800 (2 damage, +1 mana per
// damage); spells cost 10 mana: WIND (push 2200 within 1280), SHIELD,
// CONTROL. Entity: id type x y shield controlled health vx vy nearBase
// threatFor (1 = us, 2 = them).
// Bot: two defenders guard posts at ~5000 from our base and intercept the
// monster threatening us that reaches the base soonest (WIND it away when it
// gets within 2500 of the base); the attacker farms mana mid-map until turn
// 70, then prowls ~4500 from the enemy base: WIND monsters into it, SHIELD
// monsters already heading there.

const [bx, by] = readline().split(" ").map(Number)
readline() // heroes per player
const ex = 17630 - bx
const ey = 9000 - by
const sgn = bx === 0 ? 1 : -1
const dist = (ax: number, ay: number, cx: number, cy: number) => Math.hypot(ax - cx, ay - cy)
let turn = 0

type E = { id: number; type: number; x: number; y: number; shield: number; hp: number; vx: number; vy: number; threat: number }

while (true) {
  turn++
  const [, myMana] = readline().split(" ").map(Number)
  readline() // opponent base / mana
  let mana = myMana
  const n = parseInt(readline())
  const ents: E[] = []
  for (let i = 0; i < n; i++) {
    const v = readline().split(" ").map(Number)
    ents.push({ id: v[0], type: v[1], x: v[2], y: v[3], shield: v[4], hp: v[6], vx: v[7], vy: v[8], threat: v[10] })
  }
  const heroes = ents.filter(e => e.type === 1).sort((a, b) => a.id - b.id)
  const monsters = ents.filter(e => e.type === 0)
  // Threats to us, soonest first.
  const threats = monsters
    .filter(m => m.threat === 1)
    .sort((a, b) => dist(a.x, a.y, bx, by) - dist(b.x, b.y, bx, by))
  const out: string[] = []
  const taken = new Set<number>()
  const posts: [number, number][] = [
    [bx + sgn * 4200, by + sgn * 1800],
    [bx + sgn * 1800, by + sgn * 4200],
  ]
  heroes.forEach((h, i) => {
    if (i < 2) {
      // Defender.
      const target = threats.find(m => !taken.has(m.id)) ?? threats[0]
      if (target) {
        taken.add(target.id)
        const dBase = dist(target.x, target.y, bx, by)
        if (
          mana >= 10 &&
          dBase < 2500 &&
          dist(h.x, h.y, target.x, target.y) < 1280 &&
          target.shield === 0
        ) {
          out.push(`SPELL WIND ${ex} ${ey}`)
          mana -= 10
          return
        }
        out.push(`MOVE ${target.x + target.vx} ${target.y + target.vy}`)
        return
      }
      // Nothing threatening: farm the nearest monster near the post, else post.
      const [px, py] = posts[i]
      const near = monsters
        .filter(m => dist(m.x, m.y, px, py) < 3000)
        .sort((a, b) => dist(a.x, a.y, h.x, h.y) - dist(b.x, b.y, h.x, h.y))[0]
      out.push(near ? `MOVE ${near.x + near.vx} ${near.y + near.vy}` : `MOVE ${px} ${py}`)
      return
    }
    // Attacker.
    if (turn < 70) {
      const mid = monsters
        .filter(m => m.threat !== 1)
        .sort((a, b) => dist(a.x, a.y, h.x, h.y) - dist(b.x, b.y, h.x, h.y))[0]
      out.push(mid ? `MOVE ${mid.x + mid.vx} ${mid.y + mid.vy}` : `MOVE ${8815} ${4500}`)
      return
    }
    const nearEnemy = monsters.filter(m => dist(m.x, m.y, ex, ey) < 6500)
    const windable = nearEnemy.filter(m => dist(m.x, m.y, h.x, h.y) < 1280 && m.shield === 0)
    if (mana >= 20 && windable.length) {
      out.push(`SPELL WIND ${ex} ${ey}`)
      mana -= 10
      return
    }
    const shieldable = nearEnemy.find(
      m => m.threat === 2 && m.shield === 0 && m.hp >= 10 && dist(m.x, m.y, h.x, h.y) < 2200 && dist(m.x, m.y, ex, ey) < 5000,
    )
    if (mana >= 50 && shieldable) {
      out.push(`SPELL SHIELD ${shieldable.id}`)
      mana -= 10
      return
    }
    // Prowl ~4500 from the enemy base, towards monsters there.
    const prey = nearEnemy.sort((a, b) => dist(a.x, a.y, h.x, h.y) - dist(b.x, b.y, h.x, h.y))[0]
    if (prey && dist(prey.x, prey.y, ex, ey) > 3000) out.push(`MOVE ${prey.x} ${prey.y}`)
    else out.push(`MOVE ${ex - sgn * 3500} ${ey - sgn * 2500}`)
  })
  console.log(out.join("\n"))
}
