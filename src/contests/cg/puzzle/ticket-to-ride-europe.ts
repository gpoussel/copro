// 🎮 CodinGame Puzzle - ticket-to-ride-europe
// https://www.codingame.com/training/expert/ticket-to-ride-europe

// Branch and bound over the subsets of routes (include / exclude). A branch
// is cut when train cars run out, when the cards cannot pay for the chosen
// routes, or when an optimistic bound (fractional knapsack on the remaining
// routes + every ticket still linkable by the remaining routes counted as
// completed) cannot beat the best score.
// Card feasibility: colored routes consume their color, the shortfall and
// ferry engines come from engines; each gray route picks the color that fits
// best (greedy first, then a small DFS over colors memoised on the sorted
// leftovers).

const [trainCars, ticketCount, routeCount] = readline().trim().split(/\s+/).map(Number)
const hand = readline().trim().split(/\s+/).map(Number)
const COLORS = ["Red", "Yellow", "Green", "Blue", "White", "Black", "Orange", "Pink"]
const ROUTE_POINTS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10, 6: 15, 7: 18, 8: 21 }

const cityId = new Map<string, number>()
const idOf = (name: string): number => {
  if (!cityId.has(name)) cityId.set(name, cityId.size)
  return cityId.get(name)!
}

type Ticket = { pts: number; a: number; b: number }
type Route = { len: number; eng: number; color: number; a: number; b: number; pts: number }

const tickets: Ticket[] = []
for (let i = 0; i < ticketCount; i++) {
  const [p, a, b] = readline().trim().split(/\s+/)
  tickets.push({ pts: Number(p), a: idOf(a), b: idOf(b) })
}
const routes: Route[] = []
for (let i = 0; i < routeCount; i++) {
  const [len, eng, color, a, b] = readline().trim().split(/\s+/)
  const l = Number(len)
  routes.push({
    len: l,
    eng: Number(eng),
    color: COLORS.indexOf(color),
    a: idOf(a),
    b: idOf(b),
    pts: ROUTE_POINTS[l] ?? 0,
  })
}
routes.sort((x, y) => y.pts / y.len - x.pts / x.len || y.len - x.len)
const cityCount = cityId.size
const engines = hand[8]

// can the chosen routes be paid with the hand?
const affordable = (chosen: Route[]): boolean => {
  const left = hand.slice(0, 8)
  let engNeed = 0
  const grays: number[] = []
  for (const r of chosen) {
    if (r.color >= 0) left[r.color] -= r.len
    else {
      engNeed += r.eng
      if (r.len > r.eng) grays.push(r.len - r.eng)
    }
  }
  for (let c = 0; c < 8; c++) {
    if (left[c] < 0) {
      engNeed -= left[c]
      left[c] = 0
    }
  }
  if (engNeed > engines) return false
  grays.sort((x, y) => y - x)
  const budget = engines - engNeed
  // quick checks: not enough cards at all, or a greedy placement works
  let graySum = 0
  for (const g of grays) graySum += g
  if (graySum > budget + left.reduce((a, b) => a + b, 0)) return false
  const greedyLeft = left.slice()
  let greedySpare = budget
  for (const g of grays) {
    let bc = 0
    for (let c = 1; c < 8; c++) {
      const cur = greedyLeft[bc] >= g ? greedyLeft[bc] : -1
      const cand = greedyLeft[c] >= g ? greedyLeft[c] : -1
      // smallest color that covers it fully, else the largest color
      if (cand >= 0 ? cur < 0 || cand < cur : cur < 0 && greedyLeft[c] > greedyLeft[bc]) bc = c
    }
    const useColor = Math.min(greedyLeft[bc], g)
    greedyLeft[bc] -= useColor
    greedySpare -= g - useColor
  }
  if (greedySpare >= 0) return true
  const memo = new Set<string>()
  // assign grays[i..] to colors, spending at most `spare` engines
  const place = (i: number, spare: number): boolean => {
    if (i === grays.length) return true
    const key =
      i +
      "|" +
      spare +
      "|" +
      left
        .slice()
        .sort((x, y) => x - y)
        .join(",")
    if (memo.has(key)) return false
    const tried = new Set<number>()
    for (let c = 0; c < 8; c++) {
      if (tried.has(left[c])) continue
      tried.add(left[c])
      const useColor = Math.min(left[c], grays[i])
      const useEng = grays[i] - useColor
      if (useEng > spare) continue
      left[c] -= useColor
      const ok = place(i + 1, spare - useEng)
      left[c] += useColor
      if (ok) return true
    }
    memo.add(key)
    return false
  }
  return place(0, budget)
}

const parent: number[] = new Array(cityCount).fill(0)
const findRoot = (x: number): number => {
  while (parent[x] !== x) x = parent[x] = parent[parent[x]]
  return x
}
const scoreOf = (chosen: Route[]): number => {
  for (let i = 0; i < cityCount; i++) parent[i] = i
  let score = 0
  for (const r of chosen) {
    score += r.pts
    parent[findRoot(r.a)] = findRoot(r.b)
  }
  for (const t of tickets) score += findRoot(t.a) === findRoot(t.b) ? t.pts : -t.pts
  return score
}

// fractional knapsack bound on routes[from..] with `cars` left (sorted by ratio)
const routeBound = (from: number, cars: number): number => {
  let pts = 0
  for (let i = from; i < routes.length && cars > 0; i++) {
    const r = routes[i]
    if (r.len <= cars) {
      pts += r.pts
      cars -= r.len
    } else {
      pts += (r.pts * cars) / r.len
      cars = 0
    }
  }
  return pts
}

const picked: Route[] = []

// tickets that cannot be linked even with every remaining route are lost
const ticketBound = (from: number, cars: number): number => {
  for (let i = 0; i < cityCount; i++) parent[i] = i
  for (const r of picked) parent[findRoot(r.a)] = findRoot(r.b)
  for (let i = from; i < routes.length; i++) {
    if (routes[i].len <= cars) parent[findRoot(routes[i].a)] = findRoot(routes[i].b)
  }
  let sum = 0
  for (const t of tickets) sum += findRoot(t.a) === findRoot(t.b) ? t.pts : -t.pts
  return sum
}

let bestScore = -Infinity
// tb: ticket bound, inherited on "include" (still valid, just looser) and
// recomputed on "exclude"
const explore = (idx: number, cars: number, pts: number, tb: number): void => {
  if (idx === routes.length) {
    bestScore = Math.max(bestScore, scoreOf(picked))
    return
  }
  if (pts + routeBound(idx, cars) + tb <= bestScore) return
  const r = routes[idx]
  if (r.len <= cars) {
    picked.push(r)
    if (affordable(picked)) explore(idx + 1, cars - r.len, pts + r.pts, tb)
    picked.pop()
  }
  explore(idx + 1, cars, pts, ticketBound(idx + 1, cars))
}
explore(0, trainCars, 0, ticketBound(0, trainCars))
console.log(bestScore)
