// 🎮 CodinGame Multiplayer - codebusters
// https://www.codingame.com/multiplayer/bot-programming/codebusters
//
// League 1: catch ghosts (BUST at 900..1760) and RELEASE them within 1600 of
// our base corner. Per buster: carry home and release, else bust a ghost in
// range, else approach a visible ghost, else explore a grid of waypoints
// (visited ones are dropped once seen within 2200).

const perPlayer = parseInt(readline())
readline() // ghost count
const team = parseInt(readline())
const BASE: [number, number] = team === 0 ? [0, 0] : [16000, 9000]
const waypoints: [number, number][] = []
for (let x = 1500; x <= 14500; x += 2600) for (let y = 1500; y <= 7500; y += 3000) waypoints.push([x, y])
const assigned = new Map<number, number>() // buster id -> waypoint index

const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1])

while (true) {
  const n = parseInt(readline())
  const busters: { id: number; x: number; y: number; state: number }[] = []
  const ghosts: { id: number; x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const [id, x, y, type, state] = readline().split(" ").map(Number)
    if (type === team) busters.push({ id, x, y, state })
    else if (type === -1) ghosts.push({ id, x, y })
  }
  busters.sort((a, b) => a.id - b.id)
  // Drop waypoints we have seen.
  for (let w = waypoints.length - 1; w >= 0; w--)
    if (busters.some(b => dist([b.x, b.y], waypoints[w]) < 1800)) waypoints.splice(w, 1)
  const targeted = new Set<number>()
  const out: string[] = []
  for (const b of busters.slice(0, perPlayer)) {
    const pos: [number, number] = [b.x, b.y]
    if (b.state === 1) {
      out.push(dist(pos, BASE) < 1550 ? "RELEASE" : `MOVE ${BASE[0]} ${BASE[1]}`)
      continue
    }
    const inRange = ghosts.filter(
      g => !targeted.has(g.id) && dist(pos, [g.x, g.y]) > 900 && dist(pos, [g.x, g.y]) < 1760
    )
    if (inRange.length) {
      targeted.add(inRange[0].id)
      out.push(`BUST ${inRange[0].id}`)
      continue
    }
    const seen = ghosts
      .filter(g => !targeted.has(g.id))
      .sort((g, h) => dist(pos, [g.x, g.y]) - dist(pos, [h.x, h.y]))[0]
    if (seen) {
      targeted.add(seen.id)
      // Stop ~1300 away, between the ghost and us.
      const d = dist(pos, [seen.x, seen.y]) || 1
      const k = Math.max(0, (d - 1300) / d)
      out.push(`MOVE ${Math.round(b.x + (seen.x - b.x) * k)} ${Math.round(b.y + (seen.y - b.y) * k)}`)
      continue
    }
    // Explore: keep our waypoint while it exists, else take the nearest free one.
    let w = assigned.get(b.id)
    if (w === undefined || w >= waypoints.length) {
      const taken = new Set(assigned.values())
      const options = waypoints.map((p, i) => ({ i, d: dist(pos, p) })).filter(o => !taken.has(o.i))
      w = (options.length ? options : waypoints.map((p, i) => ({ i, d: dist(pos, p) }))).sort((a, c) => a.d - c.d)[0]?.i
      if (w !== undefined) assigned.set(b.id, w)
    }
    const target = w !== undefined && waypoints[w] ? waypoints[w] : [16000 - BASE[0], 9000 - BASE[1]]
    out.push(`MOVE ${target[0]} ${target[1]}`)
  }
  // Waypoint indexes shift when some are removed: reassign next turn.
  assigned.clear()
  console.log(out.join("\n"))
}
