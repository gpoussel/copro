// 🎮 CodinGame Multiplayer - code-royale
// https://www.codingame.com/multiplayer/bot-programming/code-royale
// Referee: https://github.com/csj/code-royale
//
// Queen builds on sites by touching them (buildings are free, units cost
// gold); knights (80 gold, 4 units) go for the enemy queen; creeps lose 1
// HP per turn; towers hit creeps (and queens) in a range growing with
// their HP (+100 per BUILD, max 800, melting 4 per turn). Score = queen HP.
// Turtle, after a Silver-level design (vadim-job-hg/Codingame,
// code-royale-silver.py): everything within ~970 of our corner — 2 fully
// grown mines, 1 knight barracks, 3 towers; enemy units within 200 of the
// queen: repair the tower being grown (< 790 HP) or raise one on the free
// site farthest from the queen; otherwise grow the weakest tower to 790,
// else rest in the corner. Every ready barracks trains when affordable.

const numSites = parseInt(readline())
type Site = { id: number; x: number; y: number; r: number }
const sites: Site[] = []
for (let i = 0; i < numSites; i++) {
  const [id, x, y, r] = readline().split(" ").map(Number)
  sites[id] = { id, x, y, r }
}
type SiteState = { gold: number; maxSize: number; type: number; owner: number; p1: number; p2: number }
const COST = [80, 100, 140]
let corner: { x: number; y: number } | null = null
let improving = -1 // tower being grown
const banned = new Set<number>()
let lastBuild = ""
let sameBuild = 0

while (true) {
  const [gold, touched] = readline().split(" ").map(Number)
  void touched
  const st: SiteState[] = []
  for (let i = 0; i < numSites; i++) {
    const [id, g, maxSize, type, owner, p1, p2] = readline().split(" ").map(Number)
    st[id] = { gold: g, maxSize, type, owner, p1, p2 }
  }
  const numUnits = parseInt(readline())
  let queen = { x: 0, y: 0 }
  const enemies: { x: number; y: number }[] = []
  for (let i = 0; i < numUnits; i++) {
    const [x, y, owner, type] = readline().split(" ").map(Number)
    if (owner === 0 && type === -1) queen = { x, y }
    else if (owner === 1 && type !== -1) enemies.push({ x, y })
  }
  if (!corner) corner = { x: queen.x < 960 ? 0 : 1920, y: queen.y < 500 ? 0 : 1000 }
  const c = corner
  const dq = (s: Site) => Math.hypot(s.x - queen.x, s.y - queen.y)
  const inArea = (s: Site) => Math.hypot(s.x - c.x, s.y - c.y) < (1920 + 1000) / 3
  const area = sites.filter(inArea)
  // Skip sites a BUILD kept failing on (a queen tried one for 22 turns).
  const free = area.filter(s => st[s.id].type === -1 && st[s.id].owner === -1 && !banned.has(s.id))
  const mine = (s: Site) => st[s.id].owner === 0
  const closest = (list: Site[]) => list.slice().sort((a, b) => dq(a) - dq(b))[0]
  const farthest = (list: Site[]) => list.slice().sort((a, b) => dq(b) - dq(a))[0]
  if (improving >= 0 && !(mine(sites[improving]) && st[improving].type === 1)) improving = -1

  let action = "WAIT"
  const attacked = enemies.some(e => Math.hypot(e.x - queen.x, e.y - queen.y) < 200)
  if (attacked) {
    if (improving >= 0 && st[improving].p1 < 790) action = `BUILD ${improving} TOWER`
    else {
      const t = farthest(free)
      if (t) {
        improving = t.id
        action = `BUILD ${t.id} TOWER`
      }
    }
  }
  if (action === "WAIT") {
    // Needs, in order: 2 complete mines, a knight barracks, 3 towers.
    const completeMines = sites.filter(s => mine(s) && st[s.id].type === 0 && st[s.id].p1 >= st[s.id].maxSize)
    const barracks = sites.filter(s => mine(s) && st[s.id].type === 2)
    const towers = sites.filter(s => mine(s) && st[s.id].type === 1)
    if (completeMines.length < 2) {
      const growing = area.filter(s => mine(s) && st[s.id].type === 0 && st[s.id].p1 < st[s.id].maxSize)
      const t = closest(growing) ?? closest(free.filter(s => st[s.id].gold !== 0 && st[s.id].maxSize !== 0))
      if (t) action = `BUILD ${t.id} MINE`
    }
    if (action === "WAIT" && barracks.length < 1) {
      const t = closest(free)
      if (t) action = `BUILD ${t.id} BARRACKS-KNIGHT`
    }
    if (action === "WAIT" && towers.length < 3) {
      const t = improving >= 0 && st[improving].p1 < 790 ? sites[improving] : closest(free)
      if (t) {
        improving = t.id
        action = `BUILD ${t.id} TOWER`
      }
    }
    if (action === "WAIT") {
      // Grow the weakest tower to 790, else rest in the corner.
      if (!(improving >= 0 && st[improving].p1 < 790)) {
        const weakest = towers.slice().sort((a, b) => st[a.id].p1 - st[b.id].p1)[0]
        improving = weakest ? weakest.id : -1
      }
      action = improving >= 0 ? `BUILD ${improving} TOWER` : `MOVE ${c.x} ${c.y}`
    }
  }
  // A BUILD on a touched site that stays unbuilt for 6 turns: ban it.
  const bm = action.match(/^BUILD (\d+) /)
  const touching = bm ? Math.hypot(sites[+bm[1]].x - queen.x, sites[+bm[1]].y - queen.y) < sites[+bm[1]].r + 40 : false
  if (bm && action === lastBuild && st[+bm[1]].owner !== 0 && touching) {
    if (++sameBuild >= 6) {
      banned.add(+bm[1])
      sameBuild = 0
    }
  } else sameBuild = 0
  lastBuild = action
  const train: number[] = []
  let g = gold
  for (const s of sites)
    if (mine(s) && st[s.id].type === 2 && st[s.id].p1 === 0 && COST[st[s.id].p2] < g) {
      train.push(s.id)
      g -= COST[st[s.id].p2]
    }
  console.log(action)
  console.log(train.length ? `TRAIN ${train.join(" ")}` : "TRAIN")
}
