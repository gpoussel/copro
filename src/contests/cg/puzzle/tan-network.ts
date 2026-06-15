// 🎮 CodinGame Puzzle - tan-network
// https://www.codingame.com/training/hard/tan-network

const start: string = readline()
const end: string = readline()
const n: number = parseInt(readline(), 10)

interface Stop {
  name: string
  lat: number
  lon: number
}

const stops: Map<string, Stop> = new Map()

for (let i = 0; i < n; i++) {
  const line: string = readline()
  const firstComma = line.indexOf(",")
  const id = line.substring(0, firstComma)
  const rest = line.substring(firstComma + 1)
  const closeQuote = rest.indexOf('",')
  const name = rest.substring(1, closeQuote)
  const after = rest.substring(closeQuote + 2)
  const fields = after.split(",")
  const lat = parseFloat(fields[1])
  const lon = parseFloat(fields[2])
  stops.set(id, { name, lat: (lat * Math.PI) / 180, lon: (lon * Math.PI) / 180 })
}

const m: number = parseInt(readline(), 10)
const adj: Map<string, string[]> = new Map()
for (const k of stops.keys()) adj.set(k, [])

function dist(a: Stop, b: Stop): number {
  const x = (b.lon - a.lon) * Math.cos((a.lat + b.lat) / 2)
  const y = b.lat - a.lat
  return Math.sqrt(x * x + y * y) * 6371
}

for (let i = 0; i < m; i++) {
  const line = readline()
  const [a, b] = line.split(" ")
  const list = adj.get(a)
  if (list) list.push(b)
}

if (start === end) {
  const s = stops.get(start)
  console.log(s ? s.name : "IMPOSSIBLE")
} else {
  const distTo: Map<string, number> = new Map()
  const prev: Map<string, string> = new Map()
  const visited: Set<string> = new Set()
  distTo.set(start, 0)

  const pq: Array<{ id: string; d: number }> = [{ id: start, d: 0 }]

  while (pq.length > 0) {
    let minIdx = 0
    for (let i = 1; i < pq.length; i++) if (pq[i].d < pq[minIdx].d) minIdx = i
    const cur = pq[minIdx]
    pq[minIdx] = pq[pq.length - 1]
    pq.pop()
    if (visited.has(cur.id)) continue
    visited.add(cur.id)
    if (cur.id === end) break
    const curStop = stops.get(cur.id)
    if (!curStop) continue
    const neighbors = adj.get(cur.id) || []
    for (const nb of neighbors) {
      const nbStop = stops.get(nb)
      if (!nbStop) continue
      const nd = cur.d + dist(curStop, nbStop)
      if (!distTo.has(nb) || nd < (distTo.get(nb) as number)) {
        distTo.set(nb, nd)
        prev.set(nb, cur.id)
        pq.push({ id: nb, d: nd })
      }
    }
  }

  if (!distTo.has(end)) {
    console.log("IMPOSSIBLE")
  } else {
    const path: string[] = []
    let cur: string | undefined = end
    while (cur !== undefined) {
      path.push(cur)
      if (cur === start) break
      cur = prev.get(cur)
    }
    path.reverse()
    const out: string[] = []
    for (const id of path) {
      const s = stops.get(id)
      out.push(s ? s.name : "")
    }
    console.log(out.join("\n"))
  }
}
