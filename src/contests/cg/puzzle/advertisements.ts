// 🎮 CodinGame Puzzle - advertisements
// https://www.codingame.com/training/hard/advertisements

// Search over the order in which advertisements are applied (memoised on the
// set of remaining adverts and the still-available items). Applying an advert
// to k available items uses floor(k / X) * X of them; for a chosen subset the
// best grouping waives its g*(X-Y) highest prices (X > Y) or adds its g lowest
// prices (Y-X) times (X < Y), and those must be the highest (resp. lowest)
// prices of all available items. Which items are used is enumerated per class
// of (price, other advert still pending); items no other pending advert wants
// are taken in the most favourable price order.
const na = Number(readline())
interface Ad {
  name: string
  x: number
  y: number
}
const ads: Ad[] = []
for (let i = 0; i < na; i++) {
  const m = readline().match(/^All (\S+): (\d+) for the price of (\d+)/)!
  ads.push({ name: m[1], x: Number(m[2]), y: Number(m[3]) })
}
const ni = Number(readline())
const price: number[] = []
const quals: number[][] = []
let total = 0
for (let i = 0; i < ni; i++) {
  const [product, group, brand, p] = readline().trim().split(/\s+/)
  const cents = Math.round(parseFloat(p) * 100)
  price.push(cents)
  total += cents
  const q: number[] = []
  ads.forEach((a, j) => {
    if (a.name === product || a.name === group || a.name === brand) q.push(j)
  })
  quals.push(q)
}

// discount obtained by applying advert a on the chosen prices
function value(a: Ad, chosen: number[]): number {
  const g = chosen.length / a.x
  const sorted = chosen.slice().sort((u, v) => v - u)
  if (a.x > a.y) return sorted.slice(0, g * (a.x - a.y)).reduce((s, v) => s + v, 0)
  if (a.x < a.y) return -(a.y - a.x) * sorted.slice(sorted.length - g).reduce((s, v) => s + v, 0)
  return 0
}

// rule 4: the waived items are the highest prices of all available items
// (X > Y), the added ones the lowest (X < Y); only the others are free choices
function respectsRule4(a: Ad, used: number[], items: number[]): boolean {
  const g = used.length / a.x
  const all = items.map(i => price[i]).sort((u, v) => v - u)
  const mine = used.map(i => price[i]).sort((u, v) => v - u)
  if (a.x > a.y) {
    for (let j = 0; j < g * (a.x - a.y); j++) if (all[j] !== mine[j]) return false
  } else if (a.x < a.y) {
    for (let j = 1; j <= g; j++) if (all[all.length - j] !== mine[mine.length - j]) return false
  }
  return true
}

const memo = new Map<string, number>()
function best(mask: number, avail: boolean[]): number {
  if (mask === 0) return 0
  // only items still wanted by a pending advert matter
  let key = mask + ":"
  for (let i = 0; i < ni; i++) if (quals[i].some(b => mask & (1 << b))) key += avail[i] ? "1" : "0"
  const cached = memo.get(key)
  if (cached !== undefined) return cached
  let res = -Infinity
  for (let a = 0; a < na; a++) {
    if (!(mask & (1 << a))) continue
    const rest = mask & ~(1 << a)
    const ad = ads[a]
    const items: number[] = []
    for (let i = 0; i < ni; i++) if (avail[i] && quals[i].includes(a)) items.push(i)
    const m = Math.floor(items.length / ad.x) * ad.x
    if (m === 0) {
      res = Math.max(res, best(rest, avail))
      continue
    }
    // free items (wanted by no other pending advert): highest price first when
    // waiving, lowest first when the lowest prices are added
    const free = items.filter(i => !quals[i].some(b => b !== a && rest & (1 << b)))
    free.sort((u, v) => (ad.x < ad.y ? price[u] - price[v] : price[v] - price[u]))
    // contested items grouped by (other advert, price)
    const classes = new Map<string, number[]>()
    for (const i of items) {
      const other = quals[i].find(b => b !== a && rest & (1 << b))
      if (other === undefined) continue
      const k = other + "," + price[i]
      if (!classes.has(k)) classes.set(k, [])
      classes.get(k)!.push(i)
    }
    const cls = [...classes.values()]
    const picked: number[] = []
    const rec = (ci: number, count: number): void => {
      if (count > m) return
      if (ci === cls.length) {
        const k = m - count
        if (k > free.length) return
        const used = picked.concat(free.slice(0, k))
        if (!respectsRule4(ad, used, items)) return
        const nextAvail = avail.slice()
        for (const i of used) nextAvail[i] = false
        const v = value(
          ad,
          used.map(i => price[i])
        )
        res = Math.max(res, v + best(rest, nextAvail))
        return
      }
      const c = cls[ci]
      for (let t = 0; t <= c.length; t++) {
        for (let j = 0; j < t; j++) picked.push(c[j])
        rec(ci + 1, count + t)
        picked.length -= t
      }
    }
    rec(0, 0)
  }
  memo.set(key, res)
  return res
}

// adverts sharing no item are independent: solve each connected component
const comp = ads.map((_, i) => i)
const find = (u: number): number => (comp[u] === u ? u : (comp[u] = find(comp[u])))
for (const q of quals) for (let j = 1; j < q.length; j++) comp[find(q[j])] = find(q[0])
const masks = new Map<number, number>()
for (let a = 0; a < na; a++) masks.set(find(a), (masks.get(find(a)) ?? 0) | (1 << a))
let discount = 0
for (const m of masks.values()) discount += best(m, new Array<boolean>(ni).fill(true))
console.log(((total - discount) / 100).toFixed(2))
console.log((discount / 100).toFixed(2))
