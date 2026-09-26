// Offline referee for selenia-city: a faithful port of the rules of
// github.com/CodinGame/FallChallenge2024-SeleniaCity (City/TravelManager/Referee).
// Plays ../selenia-city.ts as a child process on tests/<n>.txt (raw test inputs).
// Usage: node referee.mjs [idx,...]   (default: all tests in tests/)
import { spawn } from "child_process"
import { readFileSync, readdirSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"
const dir = path.dirname(fileURLToPath(import.meta.url))
const solver = process.env.SOLVER || path.join(dir, "..", "selenia-city.ts")

function parseTest(txt) {
  const L = txt.split("\n")
  let p = 0
  if (L[p].startsWith("x")) p++
  if (L[p].startsWith("simplified")) p++
  const n = +L[p++]
  const months = []
  let id = 0
  for (let m = 0; m < n; m++) {
    const [nb, res] = L[p++].split(" ").map(Number)
    const bs = []
    for (let i = 0; i < nb; i++) {
      const [t, x, y] = L[p++].split(" ").map(Number)
      const b = { id: id++, type: t, x, y, slots: 5, tp: false }
      if (t === 0) b.ast = L[p++].trim().split(" ").map(Number)
      bs.push(b)
    }
    months.push({ res, bs })
  }
  return months
}

const key = (a, b) => (a < b ? a * 1000 + b : b * 1000 + a)

class City {
  constructor() {
    this.B = []
    this.tubes = new Map() // key -> {a,b,cap}
    this.tubeList = []
    this.adj = new Map() // id -> [otherIds]
    this.tpOut = new Map()
    this.tpList = []
    this.pods = new Map()
    this.res = 0
  }
  cost(a, b) {
    return Math.floor(Math.hypot(a.x - b.x, a.y - b.y) * 10)
  }
  orient(a, b, c) {
    return Math.sign((c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x))
  }
  tube(i, j) {
    const a = this.B[i], b = this.B[j]
    if (!a || !b) throw "no building"
    if (a === b) throw "self"
    if (this.tubes.has(key(i, j))) throw "dup tube"
    if (a.slots <= 0 || b.slots <= 0) throw "slots"
    const c = this.cost(a, b)
    if (this.res < c) throw "res tube"
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    for (const w of this.B) {
      if (w === a || w === b) continue
      const dd = Math.hypot(a.x - w.x, a.y - w.y) + Math.hypot(w.x - b.x, w.y - b.y) - d
      if (-1e-7 < dd && dd < 1e-7) throw "through building " + w.id
    }
    for (const t of this.tubeList) {
      const c1 = this.B[t.a], d1 = this.B[t.b]
      if (this.orient(a, b, c1) * this.orient(a, b, d1) < 0 && this.orient(c1, d1, a) * this.orient(c1, d1, b) < 0) throw "cross " + t.a + "-" + t.b
    }
    this.res -= c
    a.slots--
    b.slots--
    const t = { a: i, b: j, cap: 1 }
    this.tubes.set(key(i, j), t)
    this.tubeList.push(t)
    if (!this.adj.has(i)) this.adj.set(i, [])
    if (!this.adj.has(j)) this.adj.set(j, [])
    this.adj.get(i).push(j)
    this.adj.get(j).push(i)
  }
  upgrade(i, j) {
    const t = this.tubes.get(key(i, j))
    if (!t) throw "no tube"
    const c = (t.cap + 1) * this.cost(this.B[t.a], this.B[t.b])
    if (this.res < c) throw "res upgrade"
    this.res -= c
    t.cap++
  }
  teleport(i, j) {
    const a = this.B[i], b = this.B[j]
    if (!a || !b) throw "no building"
    if (a.tp || b.tp) throw "tp taken"
    if (a === b) throw "self"
    if (this.res < 5000) throw "res tp"
    this.tpOut.set(i, j)
    this.tpList.push([i, j])
    a.tp = b.tp = true
    this.res -= 5000
  }
  pod(id, route) {
    if (this.pods.has(id)) throw "dup pod"
    if (id < 0 || id > 500) throw "pod id"
    for (const r of route) if (!this.B[r]) throw "no building"
    for (let i = 0; i + 1 < route.length; i++) if (!this.tubes.has(key(route[i], route[i + 1]))) throw "pod no tube " + route[i] + "-" + route[i + 1]
    if (this.res < 1000) throw "res pod"
    this.res -= 1000
    this.pods.set(id, route.length > 20 ? route.slice(0, 21) : route)
  }
  destroy(id) {
    if (!this.pods.has(id)) throw "no pod"
    this.pods.delete(id)
    this.res += 750
  }
}

function distances(city) {
  // dist[b] = Map(type -> dist) via BFS from b (0 over teleporter, 1 per tube)
  const res = new Map()
  for (const b of city.B) {
    const dist = new Map([[b.id, 0]])
    const dq = [b.id]
    // 0-1 BFS
    const deque = [[b.id, 0]]
    while (deque.length) {
      const [u, d] = deque.shift()
      if (d > dist.get(u)) continue
      const e = city.tpOut.get(u)
      if (e !== undefined && (dist.get(e) === undefined || d < dist.get(e))) {
        dist.set(e, d)
        deque.unshift([e, d])
      }
      for (const v of city.adj.get(u) || []) {
        if (dist.get(v) === undefined || d + 1 < dist.get(v)) {
          dist.set(v, d + 1)
          deque.push([v, d + 1])
        }
      }
    }
    void dq
    const m = new Map()
    for (const [v, d] of dist) {
      const t = city.B[v].type
      if (!m.has(t) || d < m.get(t)) m.set(t, d)
    }
    res.set(b.id, m)
  }
  return res
}

function simulateMonth(city) {
  const D = distances(city)
  let ast = []
  for (const b of city.B) if (b.type === 0) b.ast.forEach((t, i) => ast.push({ id: b.id * 1000 + i, cur: b.id, t }))
  const podIds = [...city.pods.keys()].sort((a, b) => a - b)
  const pidx = new Map(podIds.map((id) => [id, 0]))
  const alloc = new Map()
  let score = 0
  const arrive = (a, day) => {
    score += 50 - day
    const k = alloc.get(a.cur) || 0
    alloc.set(a.cur, k + 1)
    if (50 - k > 0) score += 50 - k
  }
  let wasEmpty = false
  for (let day = 0; day < 20; day++) {
    let moved = false
    const alive = []
    for (const a of ast) {
      const e = city.tpOut.get(a.cur)
      if (e !== undefined) {
        const dc = D.get(a.cur).get(a.t), de = D.get(e).get(a.t)
        if ((dc === undefined && de !== undefined) || (de !== undefined && de <= dc)) {
          a.cur = e
          moved = true
          if (city.B[e].type === a.t) {
            arrive(a, day)
            continue
          }
        }
      }
      alive.push(a)
    }
    ast = alive
    const used = new Map()
    const leaving = new Map()
    const rem = new Map()
    for (const id of podIds) {
      const r = city.pods.get(id)
      const i = pidx.get(id)
      if (i + 1 >= r.length) continue
      const cur = r[i], nx = r[i + 1]
      const k = key(cur, nx)
      const u = used.get(k) || 0
      if (u < city.tubes.get(k).cap) {
        used.set(k, u + 1)
        if (!leaving.has(cur)) leaving.set(cur, [])
        leaving.get(cur).push(id)
        rem.set(id, 10)
        let ni = i + 1
        if (ni === r.length - 1 && r[0] === r[r.length - 1]) ni = 0
        pidx.set(id, ni)
        moved = true
      }
    }
    ast.sort((a, b) => a.id - b.id)
    const alive2 = []
    for (const a of ast) {
      const lst = leaving.get(a.cur)
      const dc = D.get(a.cur).get(a.t)
      if (lst && dc !== undefined) {
        let done = false
        for (const id of lst) {
          const nb = city.pods.get(id)[pidx.get(id)]
          if (rem.get(id) > 0 && D.get(nb).get(a.t) < dc) {
            rem.set(id, rem.get(id) - 1)
            a.cur = nb
            if (city.B[nb].type === a.t) {
              arrive(a, day + 1)
              done = true
            }
            break
          }
        }
        if (done) continue
      }
      alive2.push(a)
    }
    ast = alive2
    if (!moved || wasEmpty) break
    wasEmpty = ast.length === 0
  }
  return score
}

async function play(file) {
  const months = parseTest(readFileSync(file, "utf8"))
  const city = new City()
  const p = spawn("node", ["--no-warnings", "-r", path.join(dir, "readline-preload.cjs"), solver], { stdio: ["pipe", "pipe", "pipe"] })
  let err = ""
  p.stderr.on("data", (d) => (err += d))
  let obuf = ""
  const lines = []
  let waiter = null
  p.stdout.on("data", (d) => {
    obuf += d
    let k
    while ((k = obuf.indexOf("\n")) >= 0) {
      lines.push(obuf.slice(0, k))
      obuf = obuf.slice(k + 1)
    }
    if (waiter && lines.length) {
      const w = waiter
      waiter = null
      w()
    }
  })
  const next = () => new Promise((r) => (lines.length ? r() : (waiter = r)))
  let total = 0
  let maxT = 0
  const warns = []
  const perMonth = []
  for (let m = 0; m < months.length; m++) {
    if (m > 0) city.res = Math.floor((city.res * 110) / 100)
    city.res += months[m].res
    const out = [String(city.res), String(city.tubeList.length + city.tpList.length)]
    for (const [a, b] of city.tpList) out.push(`${a} ${b} 0`)
    for (const t of city.tubeList) out.push(`${t.a} ${t.b} ${t.cap}`)
    out.push(String(city.pods.size))
    for (const [id, r] of [...city.pods].sort((a, b) => a[0] - b[0])) out.push(`${id} ${r.length} ${r.join(" ")}`)
    out.push(String(months[m].bs.length))
    for (const b of months[m].bs) {
      city.B[b.id] = b
      out.push(b.type === 0 ? `0 ${b.id} ${b.x} ${b.y} ${b.ast.length} ${b.ast.join(" ")}` : `${b.type} ${b.id} ${b.x} ${b.y}`)
    }
    const t0 = Date.now()
    p.stdin.write(out.join("\n") + "\n")
    await next()
    const dt = Date.now() - t0
    if (m > 0) maxT = Math.max(maxT, dt)
    else if (dt > 1000) warns.push(`TIMEOUT m0 ${dt}ms`)
    if (m > 0 && dt > 500) warns.push(`TIMEOUT m${m} ${dt}ms`)
    const line = lines.shift()
    for (const raw of line.split(";")) {
      const a = raw.trim().split(" ")
      try {
        if (a[0] === "TUBE") city.tube(+a[1], +a[2])
        else if (a[0] === "UPGRADE") city.upgrade(+a[1], +a[2])
        else if (a[0] === "TELEPORT") city.teleport(+a[1], +a[2])
        else if (a[0] === "POD") city.pod(+a[1], a.slice(2).map(Number))
        else if (a[0] === "DESTROY") city.destroy(+a[1])
        else if (a[0] === "WAIT" || a[0] === "") {
        } else throw "bad action " + a[0]
      } catch (e) {
        warns.push(`m${m} ${raw.trim()}: ${e}`)
      }
    }
    const s = simulateMonth(city)
    perMonth.push(s)
    total += s
  }
  p.kill()
  return { total, maxT, warns, perMonth, err }
}

const tdir = path.join(dir, "tests")
const all = readdirSync(tdir).map((f) => +f.replace(".txt", "")).sort((a, b) => a - b)
const which = process.argv[2] ? process.argv[2].split(",").map(Number) : all
let tot = 0
for (const i of which) {
  const r = await play(path.join(tdir, i + ".txt"))
  tot += r.total
  console.log(`test ${i}: ${r.total}  maxT ${r.maxT}ms  months ${r.perMonth.join(",")}`)
  if (r.warns.length) console.log("  warns: " + r.warns.slice(0, 5).join(" | ") + (r.warns.length > 5 ? ` (+${r.warns.length - 5})` : ""))
  if (process.env.ERR) console.log(r.err)
}
console.log("TOTAL", tot)
