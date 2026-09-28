// 🎮 CodinGame Multiplayer - code-royale
// https://www.codingame.com/multiplayer/bot-programming/code-royale
//
// Queen builds on sites by touching them; barracks train knights (80 gold,
// 4 units, go for the enemy queen) or archers (100 gold, 2 units, defend).
// +10 gold per turn in the wood leagues. Bot: build the nearest free sites
// until we own 2 knight barracks and 1 archer barracks, train knights
// whenever affordable (archers when enemy knights are around), and keep
// the queen away from enemy knights, near our start corner.

const numSites = parseInt(readline())
const sites: { id: number; x: number; y: number; r: number }[] = []
for (let i = 0; i < numSites; i++) {
  const [id, x, y, r] = readline().split(" ").map(Number)
  sites[id] = { id, x, y, r }
}
let home: [number, number] | null = null
const TOWERS = true
const MINES = true

while (true) {
  // **gold and touchedSite come on one line** (the statement lists two).
  const [gold, touched] = readline().split(" ").map(Number)
  const state: { type: number; owner: number; cooldown: number; kind: number; left: number; maxRate: number }[] = []
  for (let i = 0; i < numSites; i++) {
    const [id, left, maxRate, type, owner, p1, p2] = readline().split(" ").map(Number)
    state[id] = { type, owner, cooldown: p1, kind: p2, left, maxRate }
  }
  const numUnits = parseInt(readline())
  let queen = { x: 0, y: 0 }
  const enemyKnights: { x: number; y: number }[] = []
  for (let i = 0; i < numUnits; i++) {
    const [x, y, owner, type] = readline().split(" ").map(Number)
    if (owner === 0 && type === -1) queen = { x, y }
    if (owner === 1 && type === 0) enemyKnights.push({ x, y })
  }
  if (!home) home = [queen.x < 960 ? 0 : 1920, queen.y < 500 ? 0 : 1000]
  const dq = (s: { x: number; y: number }) => Math.hypot(s.x - queen.x, s.y - queen.y)
  const mine = sites.filter(s => state[s.id].owner === 0)
  const knightBarracks = mine.filter(s => state[s.id].type === 2 && state[s.id].kind === 0)
  const archerBarracks = mine.filter(s => state[s.id].type === 2 && state[s.id].kind === 1)
  const threat = enemyKnights.some(k => Math.hypot(k.x - queen.x, k.y - queen.y) < 300)

  const towers = mine.filter(s => state[s.id].type === 1)
  const giantBarracks = mine.filter(s => state[s.id].type === 2 && state[s.id].kind === 2)
  const enemyTowers = sites.filter(s => state[s.id].owner === 1 && state[s.id].type === 1).length
  let action = "WAIT"
  // Build order: knights, towers around home, second knights, giants if
  // the enemy turtles behind towers (TOWERS = false before Wood 2).
  const mines = mine.filter(s => state[s.id].type === 0)
  let want = ""
  if (MINES && mines.length < 3) want = "MINE"
  else if (TOWERS && towers.length < 1) want = "TOWER"
  else if (knightBarracks.length < 1) want = "BARRACKS-KNIGHT"
  else if (MINES && mines.length < 4) want = "MINE"
  else if (TOWERS && towers.length < 3) want = "TOWER"
  else if (knightBarracks.length < 2) want = "BARRACKS-KNIGHT"
  else if (TOWERS && enemyTowers >= 2 && giantBarracks.length < 1) want = "BARRACKS-GIANT"
  else if (!TOWERS && archerBarracks.length < 1) want = "BARRACKS-ARCHER"
  else if (MINES && mines.length < 6) want = "MINE"
  else if (TOWERS && towers.length < 5) want = "TOWER"
  // Knights on us: shelter at (and repair) our nearest tower, or raise one.
  if (threat && TOWERS) {
    const refuge = towers.sort((a, b) => dq(a) - dq(b))[0]
    if (refuge) action = `BUILD ${refuge.id} TOWER`
    else {
      const free = sites.filter(s => state[s.id].type === -1).sort((a, b) => dq(a) - dq(b))[0]
      if (free) action = `BUILD ${free.id} TOWER`
    }
  }
  // Grow the mine we touch up to its maximum rate first.
  const t = touched >= 0 ? state[touched] : null
  if (action !== "WAIT") {
    // (threat handled above)
  } else if (MINES && t && t.owner === 0 && t.type === 0 && t.cooldown < t.maxRate) action = `BUILD ${touched} MINE`
  else if (want && !threat) {
    // Nearest free site, preferring our half of the map.
    const free = sites
      .filter(s => state[s.id].type === -1 && (want !== "MINE" || state[s.id].left !== 0))
      .sort((a, b) => dq(a) + Math.abs(a.x - home![0]) * 0.3 - (dq(b) + Math.abs(b.x - home![0]) * 0.3))[0]
    if (free) action = `BUILD ${free.id} ${want}`
  }
  // Idle: repair / grow the weakest tower (tower param1 = its HP).
  if (action === "WAIT" && TOWERS && towers.length) {
    const weakest = towers.sort((a, b) => state[a.id].cooldown - state[b.id].cooldown)[0]
    if (state[weakest.id].cooldown < 700) action = `BUILD ${weakest.id} TOWER`
  }
  if (action === "WAIT") {
    // Stay back, away from enemy knights.
    let tx = home[0] === 0 ? 100 : 1820
    let ty = home[1] === 0 ? 100 : 900
    for (const k of enemyKnights) {
      const d = Math.hypot(k.x - queen.x, k.y - queen.y)
      if (d < 400) {
        tx += ((queen.x - k.x) / (d || 1)) * 300
        ty += ((queen.y - k.y) / (d || 1)) * 300
      }
    }
    action = `MOVE ${Math.round(Math.max(30, Math.min(1890, tx)))} ${Math.round(Math.max(30, Math.min(970, ty)))}`
  }
  // Training: archers when knights threaten, else knights.
  const train: number[] = []
  let g = gold
  if (enemyKnights.length > 2)
    for (const s of archerBarracks)
      if (state[s.id].cooldown === 0 && g >= 100) {
        train.push(s.id)
        g -= 100
      }
  for (const s of giantBarracks)
    if (state[s.id].cooldown === 0 && g >= 140) {
      train.push(s.id)
      g -= 140
    }
  for (const s of knightBarracks)
    if (state[s.id].cooldown === 0 && g >= 80) {
      train.push(s.id)
      g -= 80
    }
  console.log(action)
  console.log(train.length ? `TRAIN ${train.join(" ")}` : "TRAIN")
}
