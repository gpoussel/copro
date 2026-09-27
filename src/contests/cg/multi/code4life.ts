// 🎮 CodinGame Multiplayer - code4life
// https://www.codingame.com/multiplayer/bot-programming/code4life
// Referee: https://github.com/CodinGame/Code4Life
//
// One robot, four modules (SAMPLES → DIAGNOSIS → MOLECULES → LABORATORY),
// ≤ 3 samples and ≤ 10 molecules carried, 5 of each molecule type in the
// shared pool, expertise (+1 per medicine of a type) lowers future costs,
// science projects (+50) for expertise targets. State machine:
// - SAMPLES: take samples up to 3; rank by total expertise (1 / 2 / 3);
// - DIAGNOSIS: diagnose, upload samples we cannot complete (more than 10
//   molecules or not enough in stock), download good cloud samples;
// - MOLECULES: take what the feasible samples need (samples in order, so the
//   first ones complete first), then go to the lab;
// - LABORATORY: produce every completable medicine, then molecules again or
//   samples.

const projectCount = parseInt(readline())
const projects: number[][] = []
for (let i = 0; i < projectCount; i++) projects.push(readline().split(" ").map(Number))
const TYPES = "ABCDE"

const uploaded = new Set<number>() // never download these back
type Sample = { id: number; by: number; rank: number; gain: string; health: number; cost: number[] }

while (true) {
  const robots = [0, 1].map(() => {
    const p = readline().trim().split(" ")
    const v = p.slice(1).map(Number)
    return { target: p[0], eta: v[0], score: v[1], storage: v.slice(2, 7), expertise: v.slice(7, 12) }
  })
  const available = readline().split(" ").map(Number)
  const n = parseInt(readline())
  const samples: Sample[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const v = p.map(Number)
    samples.push({ id: v[0], by: v[1], rank: v[2], gain: p[3], health: v[4], cost: v.slice(5, 10) })
  }
  const me = robots[0]
  if (me.eta > 0) {
    console.log("WAIT")
    continue
  }
  const carried = samples.filter(s => s.by === 0)
  // Expertise still missing for the science projects nobody completed yet
  // (+50 each): samples giving those types are worth more.
  const projNeed = [0, 0, 0, 0, 0]
  for (const pr of projects) {
    const done = robots.some(r => pr.every((v, k) => r.expertise[k] >= v))
    if (done) continue
    pr.forEach((v, k) => (projNeed[k] += Math.max(0, v - me.expertise[k])))
  }
  const gainValue = (s: Sample) => (TYPES.includes(s.gain) ? projNeed[TYPES.indexOf(s.gain)] * 4 : 0)
  const diagnosed = (s: Sample) => s.cost[0] >= 0
  const need = (s: Sample) => s.cost.map((c, k) => Math.max(0, c - me.expertise[k]))
  const totalNeed = (s: Sample) => need(s).reduce((a, b) => a + b, 0)
  const complete = (s: Sample) => need(s).every((c, k) => me.storage[k] >= c)
  // Feasible set: samples in order of value, molecules allocated greedily.
  const plan = () => {
    const alloc = [0, 0, 0, 0, 0]
    const ok: Sample[] = []
    for (const s of carried.filter(diagnosed).sort((a, b) => totalNeed(a) - gainValue(a) / 4 - (totalNeed(b) - gainValue(b) / 4))) {
      const nd = need(s)
      const next = alloc.map((a, k) => a + nd[k])
      const extra = next.reduce((t, a, k) => t + Math.max(0, a - me.storage[k]), 0)
      const held = me.storage.reduce((a, b) => a + b, 0)
      const possible = next.every((a, k) => a <= me.storage[k] + available[k])
      if (possible && held + extra <= 10) {
        ok.push(s)
        for (let k = 0; k < 5; k++) alloc[k] = next[k]
      }
    }
    return { ok, alloc }
  }
  const expertiseSum = me.expertise.reduce((a, b) => a + b, 0)
  const rank = expertiseSum < 3 ? 1 : expertiseSum < 8 ? 2 : 3
  let out = ""
  const at = me.target
  if (at === "START_POS") out = "GOTO SAMPLES"
  else if (at === "SAMPLES") {
    out = carried.length < 3 ? `CONNECT ${rank}` : "GOTO DIAGNOSIS"
  } else if (at === "DIAGNOSIS") {
    const undiag = carried.find(s => !diagnosed(s))
    const { ok } = plan()
    const bad = carried.find(s => diagnosed(s) && !ok.includes(s))
    const cloud = samples
      .filter(s => s.by === -1 && !uploaded.has(s.id) && totalNeed(s) <= 10 && need(s).every((c, k) => c <= available[k] + me.storage[k]))
      .sort((a, b) => (b.health + gainValue(b)) / (totalNeed(b) + 1) - (a.health + gainValue(a)) / (totalNeed(a) + 1))[0]
    if (undiag) out = `CONNECT ${undiag.id}`
    else if (bad) {
      out = `CONNECT ${bad.id}` // upload to the cloud
      uploaded.add(bad.id)
    }
    else if (cloud && carried.length < 3) out = `CONNECT ${cloud.id}`
    else if (ok.length) out = "GOTO MOLECULES"
    else out = "GOTO SAMPLES"
  } else if (at === "MOLECULES") {
    const { ok, alloc } = plan()
    const held = me.storage.reduce((a, b) => a + b, 0)
    let take = -1
    // Molecules for the first samples first (they complete sooner).
    for (let k = 0; k < 5 && take < 0; k++) if (alloc[k] > me.storage[k] && available[k] > 0 && held < 10) take = k
    if (take >= 0) out = `CONNECT ${TYPES[take]}`
    else if (ok.some(complete)) out = "GOTO LABORATORY"
    else if (!ok.length) out = "GOTO DIAGNOSIS"
    else out = "WAIT" // waiting for the pool to refill
  } else if (at === "LABORATORY") {
    const done = carried.filter(diagnosed).find(complete)
    if (done) out = `CONNECT ${done.id}`
    else if (plan().ok.length) out = "GOTO MOLECULES"
    else out = carried.length ? "GOTO DIAGNOSIS" : "GOTO SAMPLES"
  } else out = "GOTO SAMPLES"
  console.log(out)
}
