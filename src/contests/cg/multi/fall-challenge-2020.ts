// 🎮 CodinGame Multiplayer - fall-challenge-2020
// https://www.codingame.com/multiplayer/bot-programming/fall-challenge-2020
//
// Potion brewing. League 1: BREW the priciest order our inventory allows.
// Ready for the next leagues: otherwise CAST a castable spell that fits the
// inventory (≤ 10 ingredients) and brings us closer to an order, else REST.

while (true) {
  const n = parseInt(readline())
  const actions: { id: number; type: string; delta: number[]; price: number; castable: boolean }[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    actions.push({ id: +p[0], type: p[1], delta: p.slice(2, 6).map(Number), price: +p[6], castable: p[9] === "1" })
  }
  const inv = readline().trim().split(" ").map(Number).slice(0, 4)
  readline() // opponent witch
  const fits = (delta: number[]) => delta.every((d, k) => inv[k] + d >= 0)
  const brews = actions.filter(a => a.type === "BREW" && fits(a.delta)).sort((a, b) => b.price - a.price)
  if (brews.length) {
    console.log(`BREW ${brews[0].id}`)
    continue
  }
  // Missing ingredients (weighted by tier) for the best order.
  const orders = actions.filter(a => a.type === "BREW").sort((a, b) => b.price - a.price)
  const missing = (have: number[]) =>
    orders.length ? orders[0].delta.reduce((s, d, k) => s + Math.max(0, -d - have[k]) * (k + 1), 0) : 0
  let best: string | null = null
  let bestMissing = missing(inv)
  for (const a of actions) {
    if (a.type !== "CAST" || !a.castable || !fits(a.delta)) continue
    const after = inv.map((v, k) => v + a.delta[k])
    if (after.reduce((s, v) => s + v, 0) > 10) continue
    const m = missing(after)
    if (m < bestMissing) {
      bestMissing = m
      best = `CAST ${a.id}`
    }
  }
  const spells = actions.some(a => a.type === "CAST")
  console.log(best ?? (spells ? "REST" : "WAIT"))
}
