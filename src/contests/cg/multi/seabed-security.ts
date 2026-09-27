// 🎮 CodinGame Multiplayer - seabed-security
// https://www.codingame.com/multiplayer/bot-programming/seabed-security
//
// Two drones scan fish (800u, 2000u with the power light for 5 battery) and
// save the scans at the surface (y ≤ 500). Monsters (type −1) chase lit
// drones; touching one within 500u loses the unsaved scans.
// Bot, per drone:
// - target: the fish not scanned yet (saved or carried), from the radar
//   blips (TL/TR/BL/BR), drone 0 favouring the left half, drone 1 the right;
// - surface when carrying ≥ 4 unsaved scans (or nothing left to find);
// - light every third turn below y 2500 with ≥ 5 battery, never with a
//   monster in sight;
// - move: among 24 headings (600u), the one closest to the wanted direction
//   that stays > 900u from every visible monster's next position.

const creatureCount = parseInt(readline())
const fishType = new Map<number, number>()
for (let i = 0; i < creatureCount; i++) {
  const [id, , type] = readline().split(" ").map(Number)
  fishType.set(id, type)
}
let turn = 0
const phase = new Map<number, string>()

while (true) {
  turn++
  readline() // my score
  readline() // foe score
  const saved = new Set<number>()
  const ms = parseInt(readline())
  for (let i = 0; i < ms; i++) saved.add(parseInt(readline()))
  const fs = parseInt(readline())
  for (let i = 0; i < fs; i++) readline()
  const dc = parseInt(readline())
  const drones: { id: number; x: number; y: number; emergency: number; battery: number }[] = []
  for (let i = 0; i < dc; i++) {
    const [id, x, y, emergency, battery] = readline().split(" ").map(Number)
    drones.push({ id, x, y, emergency, battery })
  }
  const fdc = parseInt(readline())
  for (let i = 0; i < fdc; i++) readline()
  const sc = parseInt(readline())
  const carried = new Map<number, Set<number>>()
  const carriedAny = new Set<number>()
  for (let i = 0; i < sc; i++) {
    const [d, c] = readline().split(" ").map(Number)
    if (!carried.has(d)) carried.set(d, new Set())
    carried.get(d)!.add(c)
    carriedAny.add(c)
  }
  const vc = parseInt(readline())
  const monsters: { x: number; y: number; vx: number; vy: number }[] = []
  for (let i = 0; i < vc; i++) {
    const [id, x, y, vx, vy] = readline().split(" ").map(Number)
    if (fishType.get(id) === -1) monsters.push({ x, y, vx, vy })
  }
  const rc = parseInt(readline())
  const blips: { drone: number; id: number; dir: string }[] = []
  for (let i = 0; i < rc; i++) {
    const [d, c, dir] = readline().trim().split(" ")
    blips.push({ drone: +d, id: +c, dir })
  }
  // Fish still to scan, shared between the drones.
  const wanted = (id: number) => fishType.get(id)! >= 0 && !saved.has(id) && !carriedAny.has(id)
  const out: string[] = []
  drones.forEach((d, idx) => {
    const mine = carried.get(d.id)?.size ?? 0
    let tx = d.x
    let ty = d.y
    const targets = blips.filter(b => b.drone === d.id && wanted(b.id))
    // Dive / surface cycle: go down our lane while wanted fish remain below,
    // then surface to save (first saves score double).
    const below = targets.filter(b => b.dir[0] === "B").length
    if (d.y <= 500) phase.set(d.id, "down")
    if (phase.get(d.id) !== "up" && (d.y >= 8800 || below === 0) && mine > 0) phase.set(d.id, "up")
    if (!targets.length && mine === 0) phase.set(d.id, "down")
    if (phase.get(d.id) === "up") {
      ty = 0
      tx = d.x
    } else {
      // Lane: drone 0 left, drone 1 right; drift towards the side where the
      // wanted fish below us are.
      const lane = idx === 0 ? 2500 : 7500
      const left = targets.filter(b => b.dir === "BL").length
      const right = targets.filter(b => b.dir === "BR").length
      tx = lane + (right - left) * 300
      ty = d.y + 600
      if (!targets.length) ty = 0
    }
    // Heading search avoiding monsters.
    const want = Math.atan2(ty - d.y, tx - d.x)
    let bx = tx
    let by = ty
    let bestDiff = Infinity
    for (let k = 0; k < 24; k++) {
      const a = (k * Math.PI) / 12
      const nx = Math.max(0, Math.min(9999, d.x + Math.cos(a) * 600))
      const ny = Math.max(0, Math.min(9999, d.y + Math.sin(a) * 600))
      const safe = monsters.every(m => Math.hypot(m.x + m.vx - nx, m.y + m.vy - ny) > 900)
      if (!safe) continue
      let diff = Math.abs(a - want)
      if (diff > Math.PI) diff = 2 * Math.PI - diff
      if (diff < bestDiff) {
        bestDiff = diff
        bx = nx
        by = ny
      }
    }
    const light = d.y > 2000 && d.battery >= 5 && turn % 2 === 0 && monsters.length === 0 ? 1 : 0
    out.push(`MOVE ${Math.round(bx)} ${Math.round(by)} ${light}`)
  })
  console.log(out.join("\n"))
}
