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
let turn = 0
const banned = new Set<number>()
let lastBuild = ""
let sameBuild = 0

while (true) {
  const [gold, touched] = readline().split(" ").map(Number)
  const start = Date.now()
  turn++
  void touched
  const st: SiteState[] = []
  for (let i = 0; i < numSites; i++) {
    const [id, g, maxSize, type, owner, p1, p2] = readline().split(" ").map(Number)
    st[id] = { gold: g, maxSize, type, owner, p1, p2 }
  }
  const numUnits = parseInt(readline())
  let queen = { x: 0, y: 0 }
  const enemies: { x: number; y: number }[] = []
  const knights: { x: number; y: number; hp: number }[] = []
  for (let i = 0; i < numUnits; i++) {
    const [x, y, owner, type, hp] = readline().split(" ").map(Number)
    if (owner === 0 && type === -1) queen = { x, y }
    else if (owner === 1 && type !== -1) {
      enemies.push({ x, y })
      if (type === 0) knights.push({ x, y, hp })
    }
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
  // Nearest enemy knight (the tactical search below runs when it is close).
  const knightDist = (x: number, y: number) =>
    knights.reduce((m, k) => Math.min(m, Math.hypot(k.x - x, k.y - y)), Infinity)
  const nearK = knights
    .slice()
    .sort((a, b) => Math.hypot(a.x - queen.x, a.y - queen.y) - Math.hypot(b.x - queen.x, b.y - queen.y))[0]
  const kd = nearK ? knightDist(queen.x, queen.y) : Infinity
  const ourTowers = sites.filter(q => mine(q) && st[q.id].type === 1)
  const enemyTowerList = sites.filter(q => st[q.id].owner === 1 && st[q.id].type === 1)
  // Move (x, y) by up to `step` towards (tx, ty), sliding out of sites.
  const slide = (x: number, y: number, tx: number, ty: number, step: number, rad: number): [number, number] => {
    const d = Math.hypot(tx - x, ty - y)
    if (d > 0) {
      const k = Math.min(1, step / d)
      x += (tx - x) * k
      y += (ty - y) * k
    }
    for (const q of sites) {
      const e = Math.hypot(x - q.x, y - q.y)
      if (e < q.r + rad && e > 0) {
        x = q.x + ((x - q.x) / e) * (q.r + rad)
        y = q.y + ((y - q.y) / e) * (q.r + rad)
      }
    }
    return [Math.max(30, Math.min(1890, x)), Math.max(30, Math.min(970, y))]
  }
  // Index of the best first direction (0-7), or -1 to follow the plan.
  const search = (q0: { x: number; y: number }, plan: { x: number; y: number; r: number }): number => {
    let bestScore = -Infinity
    let bestFirst = -1
    const seq = [0, 0, 0, 0]
    const total = 9 ** 4
    const deadline = start + 25 // 35 timed out twice in the arena
    for (let n = 0; n < total; n++) {
      if ((n & 15) === 0 && Date.now() > deadline) break
      let m = n
      for (let i = 0; i < 4; i++) {
        seq[i] = m % 9
        m = Math.floor(m / 9)
      }
      let qx = q0.x
      let qy = q0.y
      const ks = knights.map(k => ({ x: k.x, y: k.y, hp: k.hp }))
      let dmg = 0
      for (let t = 0; t < 4; t++) {
        const o = seq[t]
        if (o === 8) {
          if (Math.hypot(plan.x - qx, plan.y - qy) > plan.r) [qx, qy] = slide(qx, qy, plan.x, plan.y, 60, 30)
        } else {
          const ang = (o * Math.PI) / 4
          ;[qx, qy] = slide(qx, qy, qx + Math.cos(ang) * 60, qy + Math.sin(ang) * 60, 60, 30)
        }
        for (const k of ks) {
          if (k.hp <= 0) continue
          const d = Math.hypot(qx - k.x, qy - k.y)
          if (d > 50) [k.x, k.y] = slide(k.x, k.y, qx, qy, Math.min(100, d - 50), 20)
          if (Math.hypot(qx - k.x, qy - k.y) < 55) dmg++
          k.hp--
        }
        for (const tw of ourTowers) {
          let bk: { x: number; y: number; hp: number } | null = null
          let bd = st[tw.id].p2
          for (const k of ks)
            if (k.hp > 0) {
              const d = Math.hypot(tw.x - k.x, tw.y - k.y)
              if (d < bd) ((bd = d), (bk = k))
            }
          if (bk) bk.hp -= 3 + Math.floor((st[tw.id].p2 - bd) / 200)
        }
        for (const tw of enemyTowerList) {
          const d = Math.hypot(tw.x - qx, tw.y - qy)
          if (d < st[tw.id].p2) dmg += 1 + Math.floor((st[tw.id].p2 - d) / 200)
        }
      }
      const edge = Math.min(qx, qy, 1920 - qx, 1000 - qy)
      const score =
        -100 * dmg -
        0.05 * Math.max(0, Math.hypot(plan.x - qx, plan.y - qy) - plan.r) -
        (edge < 150 ? 150 - edge : 0) +
        (seq[0] === 8 ? 1 : 0)
      if (score > bestScore) {
        bestScore = score
        bestFirst = seq[0] === 8 ? -1 : seq[0]
      }
    }
    return bestFirst
  }
  const attacked = enemies.some(e => Math.hypot(e.x - queen.x, e.y - queen.y) < 200)
  if (attacked && action === "WAIT") {
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
      // Forum (BlitzProg): a new tower on a site our towers already cover
      // (a tight cluster to hide in), never under an enemy tower.
      const underEnemy = (q: Site) =>
        sites.some(e => st[e.id].owner === 1 && st[e.id].type === 1 && Math.hypot(e.x - q.x, e.y - q.y) < st[e.id].p2)
      const cover = (q: Site) => towers.filter(tw => Math.hypot(tw.x - q.x, tw.y - q.y) < st[tw.id].p2).length
      const spot = free.filter(q => !underEnemy(q)).sort((a, b) => cover(b) - cover(a) || dq(a) - dq(b))[0]
      // Place all 3 towers first, grow them after (growing the first to 790
      // took ~12 turns while the knights came).
      const t = spot ?? closest(free)
      if (t) {
        improving = t.id
        action = `BUILD ${t.id} TOWER`
      }
    }
    // A second knight barracks once the base stands: waves of 8 knights
    // (forum: save gold, then train in bursts) get through towers.
    if (action === "WAIT" && towers.length >= 3 && towers.every(t => st[t.id].p1 >= 500) && barracks.length < 2) {
      const t = closest(free)
      if (t) action = `BUILD ${t.id} BARRACKS-KNIGHT`
    }
    // Raid (how KaZede beat this boss 12/13): with the base up and no
    // knight near, the queen walks to an enemy mine / barracks that no enemy
    // tower covers and destroys it by touching it (the tactical search
    // takes over when knights come).
    if (action === "WAIT" && turn > 60 && barracks.length >= 2 && kd > 600 && towers.every(t => st[t.id].p1 >= 500)) {
      const enemyCover = (q: Site) =>
        sites.some(
          e => st[e.id].owner === 1 && st[e.id].type === 1 && Math.hypot(e.x - q.x, e.y - q.y) < st[e.id].p2 + 40
        )
      const prey = sites
        .filter(q => st[q.id].owner === 1 && (st[q.id].type === 0 || st[q.id].type === 2) && !enemyCover(q))
        .sort((a, b) => dq(a) - dq(b))[0]
      if (prey) action = `MOVE ${prey.x} ${prey.y}`
    }
    if (action === "WAIT") {
      // Grow the weakest tower to 790, else rest in the corner.
      if (!(improving >= 0 && st[improving].p1 < 790)) {
        const weakest = towers.slice().sort((a, b) => st[a.id].p1 - st[b.id].p1)[0]
        improving = weakest ? weakest.id : -1
      }
      // Rest among our towers, never in the corner (knights trap a queen
      // there: several arena deaths were a queen jittering at x, y < 100).
      const rx = towers.length ? Math.round(towers.reduce((a, t) => a + t.x, 0) / towers.length) : Math.abs(c.x - 300)
      const ry = towers.length ? Math.round(towers.reduce((a, t) => a + t.y, 0) / towers.length) : Math.abs(c.y - 300)
      action = improving >= 0 ? `BUILD ${improving} TOWER` : `MOVE ${rx} ${ry}`
    }
  }
  // Tactical search (forum: Silver/Gold bots search the queen's moves over a
  // few turns): with knights near, try every 4-turn sequence of 8
  // directions or "follow the plan", on a small simulation — the queen (60)
  // and knights (100) slide around sites, knights age 1 HP and hit 1 in
  // contact, our towers shoot the nearest knight, enemy towers our queen.
  if (kd < 700) {
    const planM = action.match(/^(?:MOVE (\d+) (\d+)|BUILD (\d+))/)
    const plan = planM
      ? planM[3] !== undefined
        ? { x: sites[+planM[3]].x, y: sites[+planM[3]].y, r: sites[+planM[3]].r + 30 }
        : { x: +planM[1], y: +planM[2], r: 0 }
      : { x: queen.x, y: queen.y, r: 0 }
    const best = search(queen, plan)
    if (best >= 0) {
      const ang = (best * Math.PI) / 4
      action = `MOVE ${Math.round(queen.x + Math.cos(ang) * 60)} ${Math.round(queen.y + Math.sin(ang) * 60)}`
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
  const kb = sites.filter(s => mine(s) && st[s.id].type === 2 && st[s.id].p2 === 0)
  // With two barracks, train only both at once (a burst of 8).
  if (kb.length >= 2 && (gold < 160 || kb.some(s => st[s.id].p1 > 0))) g = 0
  for (const s of sites)
    if (mine(s) && st[s.id].type === 2 && st[s.id].p1 === 0 && COST[st[s.id].p2] < g) {
      train.push(s.id)
      g -= COST[st[s.id].p2]
    }
  console.log(action)
  console.log(train.length ? `TRAIN ${train.join(" ")}` : "TRAIN")
}
