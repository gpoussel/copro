// 🎮 CodinGame Multiplayer - codebusters
// https://www.codingame.com/multiplayer/bot-programming/codebusters
//
// League 1: catch ghosts (BUST at 900..1760) and RELEASE them within 1600 of
// our base corner. Per buster: carry home and release, else bust a ghost in
// range, else approach a visible ghost, else explore a grid of waypoints
// (visited ones are dropped once seen within 2200).
// League 2: STUN (range 1760, 20-turn reload, target drops its ghost): stun
// an enemy carrier, or any active enemy near a buster of ours that carries
// or busts; our reload is tracked per buster.

const perPlayer = parseInt(readline())
readline() // ghost count
const team = parseInt(readline())
const BASE: [number, number] = team === 0 ? [0, 0] : [16000, 9000]
const waypoints: [number, number][] = []
for (let x = 1500; x <= 14500; x += 2600) for (let y = 1500; y <= 7500; y += 3000) waypoints.push([x, y])
const assigned = new Map<number, number>() // buster id -> waypoint index
const known = new Map<number, [number, number]>() // ghost id -> last seen position
const reloadUntil = new Map<number, number>() // buster id -> turn it can stun again
let turn = 0

const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1])

while (true) {
  turn++
  const n = parseInt(readline())
  const busters: { id: number; x: number; y: number; state: number; value: number }[] = []
  const enemies: { id: number; x: number; y: number; state: number; value: number }[] = []
  const ghosts: { id: number; x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const [id, x, y, type, state, value] = readline().split(" ").map(Number)
    if (type === team) busters.push({ id, x, y, state, value })
    else if (type >= 0) enemies.push({ id, x, y, state, value })
    else if (type === -1) ghosts.push({ id, x, y })
  }
  busters.sort((a, b) => a.id - b.id)
  // Ghost memory: forget the ones carried, or missing where we look.
  for (const g of ghosts) known.set(g.id, [g.x, g.y])
  for (const e of [...enemies, ...busters]) if (e.state === 1) known.delete(e.value)
  for (const [id, p] of known)
    if (!ghosts.some(g => g.id === id) && busters.some(b => dist([b.x, b.y], p) < 2000)) known.delete(id)
  // Drop waypoints we have seen.
  for (let w = waypoints.length - 1; w >= 0; w--)
    if (busters.some(b => dist([b.x, b.y], waypoints[w]) < 1800)) waypoints.splice(w, 1)
  const targeted = new Set<number>()
  const stunned = new Set<number>()
  const out: string[] = []
  for (const b of busters.slice(0, perPlayer)) {
    const pos: [number, number] = [b.x, b.y]
    if (b.state === 2) {
      out.push("MOVE 0 0")
      continue
    }
    // Stun: carriers first, then active enemies close to us (they could stun
    // us or steal our ghost); stunned ones only when about to wake up.
    // (never while carrying: stunning makes us drop our own ghost too).
    if (b.state !== 1 && (reloadUntil.get(b.id) ?? 0) <= turn) {
      const near = enemies
        .filter(e => !stunned.has(e.id) && dist(pos, [e.x, e.y]) < 1760 && (e.state !== 2 || e.value <= 1))
        .sort((e, f) => (f.state === 1 ? 1 : 0) - (e.state === 1 ? 1 : 0))
      const t = near[0]
      if (t && (t.state === 1 || ghosts.some(g => dist(pos, [g.x, g.y]) < 2200))) {
        stunned.add(t.id)
        reloadUntil.set(b.id, turn + 20)
        out.push(`STUN ${t.id}`)
        continue
      }
    }
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
    // Intercept an enemy carrier on its straight way home (800 per turn,
    // done once within 1600 of its base) if we can get within stun range.
    if ((reloadUntil.get(b.id) ?? 0) <= turn + 3) {
      const EB: [number, number] = [16000 - BASE[0], 9000 - BASE[1]]
      let goal: [number, number] | null = null
      for (const e of enemies) {
        if (e.state !== 1 || targeted.has(-1 - e.id)) continue
        const d = dist([e.x, e.y], EB)
        for (let k = 1; k <= 12 && !goal; k++) {
          const left = d - 800 * k
          if (left < 1500) break
          const p: [number, number] = [EB[0] + ((e.x - EB[0]) * left) / d, EB[1] + ((e.y - EB[1]) * left) / d]
          if (dist(pos, p) - 1600 <= 800 * k) {
            goal = p
            targeted.add(-1 - e.id)
          }
        }
        if (goal) break
      }
      if (goal) {
        out.push(`MOVE ${Math.round(goal[0])} ${Math.round(goal[1])}`)
        continue
      }
    }
    const seen = [...known]
      .map(([id, [x, y]]) => ({ id, x, y }))
      .filter(g => !targeted.has(g.id))
      .sort((g, h) => dist(pos, [g.x, g.y]) - dist(pos, [h.x, h.y]))[0]
    if (seen) {
      targeted.add(seen.id)
      // Stop ~1300 away, between the ghost and us.
      // (Too close to bust: step back, along the ghost-to-us line.)
      const d = dist(pos, [seen.x, seen.y]) || 1
      const k = (d - 1300) / d
      const tx = Math.min(16000, Math.max(0, Math.round(b.x + (seen.x - b.x) * k)))
      const ty = Math.min(9000, Math.max(0, Math.round(b.y + (seen.y - b.y) * k)))
      out.push(`MOVE ${tx} ${ty}`)
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
    // Nothing left to explore: wait near the enemy base to stun carriers.
    const camp = team === 0 ? [14300, 7300] : [1700, 1700]
    const target = w !== undefined && waypoints[w] ? waypoints[w] : camp
    out.push(`MOVE ${target[0]} ${target[1]}`)
  }
  // Waypoint indexes shift when some are removed: reassign next turn.
  assigned.clear()
  console.log(out.join("\n"))
}
