// 🎮 CodinGame Multiplayer - mean-max
// https://www.codingame.com/multiplayer/bot-programming/mean-max
//
// 3 players on a disc of radius 6000; a Reaper (mass 0.5, friction 0.2,
// acc = ACC / mass) harvests 1 water per wreck it stands in at the end of a
// turn. Bot: target the wreck with the best water / (distance + 600), with
// a bonus for wrecks overlapping other wrecks; steer with the velocity
// cancelled (aim = target − v, ACC proportional to the correction needed).
// Destroyer / Doof lines are WAIT until later leagues.

type U = { id: number; type: number; player: number; r: number; x: number; y: number; vx: number; vy: number; extra: number }

while (true) {
  for (let i = 0; i < 6; i++) readline() // scores, rage
  const n = parseInt(readline())
  const units: U[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    units.push({
      id: +p[0],
      type: +p[1],
      player: +p[2],
      r: +p[4],
      x: +p[5],
      y: +p[6],
      vx: +p[7],
      vy: +p[8],
      extra: +p[9],
    })
  }
  const reaper = units.find(u => u.type === 0 && u.player === 0)!
  const wrecks = units.filter(u => u.type === 4)
  let target: U | null = null
  let bestScore = -Infinity
  for (const w of wrecks) {
    const d = Math.hypot(w.x - reaper.x, w.y - reaper.y)
    const overlap = wrecks.filter(o => o !== w && Math.hypot(o.x - w.x, o.y - w.y) < o.r + w.r).length
    const score = (w.extra + overlap * 3) / (d + 600)
    if (score > bestScore) {
      bestScore = score
      target = w
    }
  }
  let order = "WAIT"
  if (target) {
    const dx = target.x - reaper.x - reaper.vx
    const dy = target.y - reaper.y - reaper.vy
    const need = Math.hypot(dx, dy) * 0.5
    const inside = Math.hypot(target.x - reaper.x, target.y - reaper.y) < target.r * 0.6
    const acc = inside && Math.hypot(reaper.vx, reaper.vy) < 100 ? 0 : Math.min(300, Math.round(need))
    order = `${Math.round(reaper.x + dx)} ${Math.round(reaper.y + dy)} ${acc}`
  }
  console.log(order)
  console.log("WAIT")
  console.log("WAIT")
}
