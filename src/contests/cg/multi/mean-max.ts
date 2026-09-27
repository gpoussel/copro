// 🎮 CodinGame Multiplayer - mean-max
// https://www.codingame.com/multiplayer/bot-programming/mean-max
//
// 3 players on a disc of radius 6000. Units: Reaper (mass 0.5, friction
// 0.2) harvests 1 water per wreck it stands in; Destroyer (1.5, 0.3) breaks
// tankers it touches into wrecks; Doof (1, 0.25) makes rage from its speed
// and can spread oil (no friction, no harvest) for 30 rage. Types: 0 reaper,
// 1 destroyer, 2 doof, 3 tanker, 4 wreck, 5 tar, 6 oil.
// Bot: reaper → best wreck by (water + overlaps) / distance, else waits next
// to the destroyer's tanker; destroyer → the tanker closest to it and to
// our reaper; doof → rams the leading enemy reaper, oils it when it sits in
// a wreck we are not in. Steering cancels velocity (aim = target − v).

type U = {
  id: number
  type: number
  player: number
  mass: number
  r: number
  x: number
  y: number
  vx: number
  vy: number
  extra: number
}
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
const steer = (u: U, tx: number, ty: number, max: number) => {
  const dx = tx - u.x - u.vx
  const dy = ty - u.y - u.vy
  const acc = Math.min(max, Math.round(Math.hypot(dx, dy) * u.mass))
  return `${Math.round(u.x + dx)} ${Math.round(u.y + dy)} ${acc}`
}

while (true) {
  const scores = [0, 1, 2].map(() => parseInt(readline()))
  const myRage = parseInt(readline())
  readline()
  readline()
  const n = parseInt(readline())
  const units: U[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    units.push({
      id: +p[0],
      type: +p[1],
      player: +p[2],
      mass: +p[3],
      r: +p[4],
      x: +p[5],
      y: +p[6],
      vx: +p[7],
      vy: +p[8],
      extra: +p[9],
    })
  }
  const mine = (t: number) => units.find(u => u.type === t && u.player === 0)
  const reaper = mine(0)!
  const destroyer = mine(1)
  const doof = mine(2)
  // Reapers cannot harvest inside oil: those wrecks are skipped.
  const oils = units.filter(u => u.type === 6)
  const wrecks = units.filter(u => u.type === 4 && !oils.some(o => dist(o, u) < o.r))
  const tankers = units.filter(u => u.type === 3 && Math.hypot(u.x, u.y) < 5800)

  // Destroyer: a tanker close to it and to our reaper.
  let tank: U | null = null
  if (destroyer)
    for (const t of tankers)
      if (!tank || dist(destroyer, t) + 0.5 * dist(t, reaper) < dist(destroyer, tank) + 0.5 * dist(tank, reaper)) tank = t

  // Reaper.
  let target: U | null = null
  let bestScore = -Infinity
  for (const w of wrecks) {
    const overlap = wrecks.filter(o => o !== w && dist(o, w) < o.r + w.r).length
    const score = (w.extra + overlap * 3) / (dist(w, reaper) + 600)
    if (score > bestScore) {
      bestScore = score
      target = w
    }
  }
  let reaperOrder = "WAIT"
  if (target) {
    const inside = dist(target, reaper) < target.r * 0.6
    reaperOrder = inside && Math.hypot(reaper.vx, reaper.vy) < 100 ? "WAIT" : steer(reaper, target.x, target.y, 300)
  } else if (tank) reaperOrder = steer(reaper, tank.x, tank.y, 200)

  let destroyerOrder = destroyer && tank ? steer(destroyer, tank.x + tank.vx, tank.y + tank.vy, 300) : "WAIT"
  // Grenade (60 rage, range 2000, radius 1000): blow an enemy reaper out of
  // a wreck we are not harvesting.
  let rage = myRage
  if (destroyer && rage >= 60) {
    for (const foe of units.filter(u => u.type === 0 && u.player !== 0)) {
      const w = wrecks.find(w => dist(w, foe) < w.r)
      if (!w || w.extra < 2 || dist(destroyer, foe) > 1900 || dist(reaper, foe) < 1300) continue
      // Land between it and the wreck centre so it is pushed out (a grenade
      // on a vehicle's centre does not move it).
      const d = dist(w, foe) || 1
      const ux = d > 1 ? (w.x - foe.x) / d : 1
      const uy = d > 1 ? (w.y - foe.y) / d : 0
      destroyerOrder = `SKILL ${Math.round(foe.x + ux * 300)} ${Math.round(foe.y + uy * 300)}`
      rage -= 60
      break
    }
  }

  // Doof: the leading enemy's reaper.
  let doofOrder = "WAIT"
  if (doof) {
    const leader = [1, 2].sort((a, b) => scores[b] - scores[a])[0]
    const foe = units.find(u => u.type === 0 && u.player === leader)
    if (foe) {
      const foeWreck = wrecks.find(w => dist(w, foe) < w.r)
      if (rage >= 30 && foeWreck && dist(doof, foe) < 2000 && dist(reaper, foe) > 1500)
        doofOrder = `SKILL ${foe.x} ${foe.y}`
      else doofOrder = `${Math.round(foe.x + foe.vx)} ${Math.round(foe.y + foe.vy)} 300`
    }
  }
  console.log(reaperOrder)
  console.log(destroyerOrder)
  console.log(doofOrder)
}
