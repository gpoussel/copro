// 🎮 CodinGame Puzzle - european-rugby-champions-cup-ranking
// https://www.codingame.com/training/medium/european-rugby-champions-cup-ranking

type Game = { a: string; pa: number; ta: number; b: string; pb: number; tb: number }

const pools: string[][] = []
for (let i = 0; i < 5; i++) pools.push(readline().split(",").map(s => s.trim()))
const games: Game[] = []
for (let i = 0; i < 60; i++) {
  const [a, pa, ta, b, pb, tb] = readline().split(",").map(s => s.trim())
  games.push({ a, pa: +pa, ta: +ta, b, pb: +pb, tb: +tb })
}

// Ranking points and game-points difference over the games involving only `teams`
const table = (teams: string[]) => {
  const pts: { [team: string]: number } = {}
  const diff: { [team: string]: number } = {}
  for (const t of teams) {
    pts[t] = 0
    diff[t] = 0
  }
  for (const g of games) {
    if (teams.indexOf(g.a) < 0 || teams.indexOf(g.b) < 0) continue
    const score = (me: number, other: number, tries: number) => {
      let p = me > other ? 4 : me === other ? 2 : 0
      if (tries >= 4) p++
      if (me < other && other - me <= 7) p++
      return p
    }
    pts[g.a] += score(g.pa, g.pb, g.ta)
    pts[g.b] += score(g.pb, g.pa, g.tb)
    diff[g.a] += g.pa - g.pb
    diff[g.b] += g.pb - g.pa
  }
  return { pts, diff }
}

type Ranked = { team: string; pts: number; diff: number }
const leaders: Ranked[] = []
const runnersUp: Ranked[] = []
for (const pool of pools) {
  const { pts, diff } = table(pool)
  const order = pool.slice().sort((x, y) => {
    if (pts[x] !== pts[y]) return pts[y] - pts[x]
    // Tie-breakers from the games between the teams tied on points
    const tied = pool.filter(t => pts[t] === pts[x])
    const h2h = table(tied)
    if (h2h.pts[x] !== h2h.pts[y]) return h2h.pts[y] - h2h.pts[x]
    if (h2h.diff[x] !== h2h.diff[y]) return h2h.diff[y] - h2h.diff[x]
    return diff[y] - diff[x]
  })
  leaders.push({ team: order[0], pts: pts[order[0]], diff: diff[order[0]] })
  runnersUp.push({ team: order[1], pts: pts[order[1]], diff: diff[order[1]] })
}

const byPoints = (x: Ranked, y: Ranked) => (x.pts !== y.pts ? y.pts - x.pts : y.diff - x.diff)
const seeds = leaders.sort(byPoints).concat(runnersUp.sort(byPoints).slice(0, 3))
for (let i = 0; i < 4; i++) console.log(`${seeds[i].team} - ${seeds[7 - i].team}`)
