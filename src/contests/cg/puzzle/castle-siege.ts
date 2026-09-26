// 🎮 CodinGame Puzzle - castle-siege
// https://www.codingame.com/training/hard/castle-siege

// Straight simulation of the three phases of each round.

interface Enemy {
  x: number
  y: number
  hp: number
}

const [mapW, mapH] = readline().split(" ").map(Number)
const towers: [number, number][] = []
let enemies: Enemy[] = []
for (let y = 0; y < mapH; y++) {
  const row = readline()
  for (let x = 0; x < mapW; x++) {
    const ch = row[x]
    if (ch === "T") towers.push([x, y])
    else if (ch >= "0" && ch <= "9") enemies.push({ x, y, hp: Number(ch) })
  }
}
const isTower = new Set(towers.map(([x, y]) => y * mapW + x))

let result = ""
for (let round = 1; !result; round++) {
  // 1. Targeting: northmost, then closest, then eastmost
  const hits = new Map<Enemy, number>()
  for (const [tx, ty] of towers) {
    let best: Enemy | null = null
    for (const e of enemies) {
      if (Math.abs(e.x - tx) > 2 || Math.abs(e.y - ty) > 2) continue
      if (!best) {
        best = e
        continue
      }
      const d = (e.x - tx) ** 2 + (e.y - ty) ** 2
      const bd = (best.x - tx) ** 2 + (best.y - ty) ** 2
      if (e.y < best.y || (e.y === best.y && (d < bd || (d === bd && e.x > best.x)))) best = e
    }
    if (best) hits.set(best, (hits.get(best) ?? 0) + 1)
  }
  // 2. Damage
  for (const [e, n] of hits) e.hp -= n
  enemies = enemies.filter(e => e.hp > 0)
  if (enemies.length === 0) {
    result = `WIN ${round}`
    break
  }
  // 3. Move north
  for (const e of enemies) e.y--
  if (enemies.some(e => e.y < 0)) result = `LOSE ${round}`
  enemies = enemies.filter(e => !isTower.has(e.y * mapW + e.x))
}
console.log(result)
