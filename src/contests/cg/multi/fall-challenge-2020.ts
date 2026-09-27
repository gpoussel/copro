// 🎮 CodinGame Multiplayer - fall-challenge-2020
// https://www.codingame.com/multiplayer/bot-programming/fall-challenge-2020
//
// Potion brewing. BFS over our own CAST / REST sequences (inventory ≤ 10,
// exhausted spells, repeatable spells cast several times), states
// deduplicated on (inventory, castable spells). For every order, the fastest
// sequence that makes it brewable; play the first action of the sequence with
// the best price / (turns + 1). Opening (turns ≤ 9): LEARN the most valuable
// affordable tome spells.

type Action = {
  id: number
  type: string
  delta: number[]
  price: number
  tomeIndex: number
  castable: boolean
  repeatable: boolean
}

let turn = 0
while (true) {
  turn++
  const n = parseInt(readline())
  const actions: Action[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    actions.push({
      id: +p[0],
      type: p[1],
      delta: p.slice(2, 6).map(Number),
      price: +p[6],
      tomeIndex: +p[7],
      castable: p[9] === "1",
      repeatable: p[10] === "1",
    })
  }
  const inv = readline().trim().split(" ").map(Number).slice(0, 4)
  readline() // opponent witch
  const orders = actions.filter(a => a.type === "BREW")
  const spells = actions.filter(a => a.type === "CAST")
  const tome = actions.filter(a => a.type === "LEARN")

  // Opening: learn the most valuable affordable spells (a tome index i costs
  // i tier-0 ingredients); value = tier-weighted output − input, repeatable
  // spells worth more.
  if (tome.length && turn <= 9) {
    const worth = (a: Action) => {
      const net = a.delta.reduce((t, d, k) => t + d * (k + 1), 0)
      const pos = a.delta.every(d => d >= 0)
      return net + (a.repeatable ? 1.5 : 0) + (pos ? 1 : 0) - a.tomeIndex * 0.6
    }
    const pick = tome.filter(a => a.tomeIndex <= inv[0]).sort((a, b) => worth(b) - worth(a))[0]
    if (pick && worth(pick) > 0.5) {
      console.log(`LEARN ${pick.id}`)
      continue
    }
  }

  const fits = (have: number[], delta: number[]) => delta.every((d, k) => have[k] + d >= 0)
  const brewNow = orders.filter(o => fits(inv, o.delta)).sort((a, b) => b.price - a.price)

  // BFS over (inventory, castable mask).
  type Node = { inv: number[]; mask: number; first: string; depth: number }
  const startMask = spells.reduce((m, s, i) => (s.castable ? m | (1 << i) : m), 0)
  const full = (1 << spells.length) - 1
  const key = (v: number[], m: number) => ((v[0] * 11 + v[1]) * 11 + v[2]) * 11 + v[3] + m * 14641
  const seen = new Set<number>([key(inv, startMask)])
  let frontier: Node[] = [{ inv, mask: startMask, first: "", depth: 0 }]
  const bestFor = new Map<number, { depth: number; first: string }>() // order id -> fastest
  const deadline = Date.now() + 35
  for (let depth = 1; depth <= 10 && frontier.length && Date.now() < deadline; depth++) {
    const next: Node[] = []
    for (const node of frontier) {
      for (const o of orders)
        if (!bestFor.has(o.id) && node.depth > 0 && fits(node.inv, o.delta))
          bestFor.set(o.id, { depth: node.depth, first: node.first })
      const push = (v: number[], m: number, cmd: string) => {
        const k = key(v, m)
        if (seen.has(k)) return
        seen.add(k)
        next.push({ inv: v, mask: m, first: node.first || cmd, depth })
      }
      if (node.mask !== full) push(node.inv, full, "REST")
      spells.forEach((s, i) => {
        if (!(node.mask & (1 << i))) return
        let v = node.inv
        for (let times = 1; times <= (s.repeatable ? 4 : 1); times++) {
          if (!fits(v, s.delta)) break
          v = v.map((x, k) => x + s.delta[k])
          if (v[0] + v[1] + v[2] + v[3] > 10) break
          push(v, node.mask & ~(1 << i), times === 1 ? `CAST ${s.id}` : `CAST ${s.id} ${times}`)
        }
      })
      if (Date.now() > deadline) break
    }
    frontier = next
  }
  for (const node of frontier)
    for (const o of orders)
      if (!bestFor.has(o.id) && fits(node.inv, o.delta)) bestFor.set(o.id, { depth: node.depth, first: node.first })

  // Best rate among brewing now and planned sequences.
  let choice = ""
  let bestRate = -1
  if (brewNow.length) {
    choice = `BREW ${brewNow[0].id}`
    bestRate = brewNow[0].price
  }
  for (const o of orders) {
    const plan = bestFor.get(o.id)
    if (!plan) continue
    const rate = o.price / (plan.depth + 1)
    if (rate > bestRate) {
      bestRate = rate
      choice = plan.first
    }
  }
  if (!choice) {
    const cast = spells.find(
      s => s.castable && fits(inv, s.delta) && inv.reduce((t, x, k) => t + x + s.delta[k], 0) <= 10,
    )
    choice = cast ? `CAST ${cast.id}` : startMask !== full ? "REST" : "WAIT"
  }
  console.log(choice)
}
