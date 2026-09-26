// 🎮 CodinGame Multiplayer - clash-of-bots
// https://www.codingame.com/multiplayer/bot-programming/clash-of-bots
//
// Toroidal arena; each robot sees a 5x5 minimap (itself in the middle,
// allies > 0, enemies < 0, values = health). Simultaneous actions: moves,
// then attacks (2 dmg on a neighbour), then self-destructions (4 dmg in 3x3);
// GUARD halves damage. Per robot: hit the weakest adjacent enemy, blow up
// when surrounded and weak, guard when an enemy is close, else close in.

const DIRS: [string, number, number][] = [
  ["UP", -1, 0],
  ["DOWN", 1, 0],
  ["LEFT", 0, -1],
  ["RIGHT", 0, 1],
]

while (true) {
  const k = parseInt(readline())
  const out: string[] = []
  for (let r = 0; r < k; r++) {
    const m: number[][] = []
    for (let i = 0; i < 5; i++) m.push(readline().trim().split(/\s+/).map(Number))
    const hp = m[2][2]
    // Adjacent enemies (orthogonal) and enemies in the 3x3 ring.
    let target: [string, number] | null = null
    for (const [name, dr, dc] of DIRS) {
      const v = m[2 + dr][2 + dc]
      if (v < 0 && (!target || -v < target[1])) target = [name, -v]
    }
    let around = 0
    let alliesAround = 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue
        if (m[2 + dr][2 + dc] < 0) around++
        else if (m[2 + dr][2 + dc] > 0) alliesAround++
      }
    }
    let nearest: [number, number] | null = null
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (m[i][j] >= 0) continue
        const d = Math.abs(i - 2) + Math.abs(j - 2)
        if (!nearest || d < Math.abs(nearest[0] - 2) + Math.abs(nearest[1] - 2)) nearest = [i, j]
      }
    }
    if (around >= 3 && hp <= 4 && alliesAround === 0) out.push("SELFDESTRUCTION")
    else if (target) out.push(`ATTACK ${target[0]}`)
    else if (nearest && Math.abs(nearest[0] - 2) + Math.abs(nearest[1] - 2) <= 2) out.push("GUARD")
    else if (nearest) {
      // Step towards the enemy along the longer axis, into a free cell.
      const dr = Math.sign(nearest[0] - 2)
      const dc = Math.sign(nearest[1] - 2)
      const options = DIRS.filter(([, a, b]) => (a !== 0 && a === dr) || (b !== 0 && b === dc)).filter(
        ([, a, b]) => m[2 + a][2 + b] === 0
      )
      out.push(options.length ? `MOVE ${options[0][0]}` : "GUARD")
    } else out.push("GUARD")
  }
  console.log(out.join("\n"))
}
