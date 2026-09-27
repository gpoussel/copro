// 🎮 CodinGame Multiplayer - code-a-la-mode
// https://www.codingame.com/multiplayer/bot-programming/code-a-la-mode
// Referee: https://github.com/csj/code-a-la-mode
//
// Two chefs share a kitchen (11×7); orders are dishes with desserts.
// ICE_CREAM (crate I) and BLUEBERRIES (crate B) go straight on a plate (USE
// on a crate while holding a plate); Wood 2 adds CHOPPED_STRAWBERRIES:
// STRAWBERRIES (crate S) chopped on the board C, then dropped on a free
// table, and picked onto the plate later (a chef holds one thing only).
// Bot: prepare the chopped strawberries first when the best order needs
// some and none lies on a table; then plate → missing desserts (crates or
// tables) → window. A plate that fits no order goes back to the dishwasher.

const numAll = parseInt(readline())
for (let i = 0; i < numAll; i++) readline()
const kitchen: string[] = []
for (let y = 0; y < 7; y++) kitchen.push(readline())
const find = (ch: string): [number, number] => {
  for (let y = 0; y < 7; y++) {
    const x = kitchen[y].indexOf(ch)
    if (x >= 0) return [x, y]
  }
  return [-1, -1]
}
const CRATE: Record<string, [number, number]> = { ICE_CREAM: find("I"), BLUEBERRIES: find("B") }
const DISHWASHER = find("D")
const WINDOW = find("W")
const STRAWBERRY = find("S")
const BOARD = find("C")
const DOUGH = find("H")
const OVEN = find("O")
const use = (p: [number, number]) => `USE ${p[0]} ${p[1]}`

while (true) {
  readline() // turns remaining
  const [pxs, pys, item] = readline().trim().split(" ")
  const px = +pxs
  const py = +pys
  readline() // partner
  const nt = parseInt(readline())
  const tables: { x: number; y: number; item: string }[] = []
  for (let i = 0; i < nt; i++) {
    const [x, y, it] = readline().trim().split(" ")
    tables.push({ x: +x, y: +y, item: it })
  }
  const [ovenItem] = readline().trim().split(" ")
  const nc = parseInt(readline())
  const orders: { items: string[]; award: number }[] = []
  for (let i = 0; i < nc; i++) {
    const [o, a] = readline().trim().split(" ")
    orders.push({ items: o.split("-").filter(s => s !== "DISH"), award: +a })
  }
  const carried = item === "NONE" ? [] : item.split("-")
  const near = (a: { x: number; y: number }) => Math.max(Math.abs(a.x - px), Math.abs(a.y - py))
  const onTable = (what: string) =>
    tables.filter(t => t.item === what).sort((a, b) => near(a) - near(b))[0]
  // Nearest free table to drop something.
  const freeTable = (): [number, number] => {
    let best: [number, number] = [-1, -1]
    let bestD = Infinity
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 11; x++) {
        if (kitchen[y][x] !== "#" || tables.some(t => t.x === x && t.y === y)) continue
        const d = Math.max(Math.abs(x - px), Math.abs(y - py))
        if (d < bestD) {
          bestD = d
          best = [x, y]
        }
      }
    return best
  }
  const best = orders.slice().sort((a, b) => b.award - a.award)[0]
  const needChopped = best?.items.includes("CHOPPED_STRAWBERRIES") && !onTable("CHOPPED_STRAWBERRIES")
  // Croissants: dough (H) baked 10 turns in the oven (O), ready for 10 more.
  const croissantReady = ovenItem === "CROISSANT"
  const needCroissant =
    OVEN[0] >= 0 &&
    orders.some(o => o.items.includes("CROISSANT")) &&
    !onTable("CROISSANT") &&
    ovenItem === "NONE"
  let action: string
  if (carried[0] === "STRAWBERRIES") action = use(BOARD)
  else if (carried[0] === "DOUGH") action = use(OVEN)
  else if (carried[0] === "CHOPPED_STRAWBERRIES" || carried[0] === "CROISSANT") action = use(freeTable())
  else if (!carried.includes("DISH")) {
    if (carried.length) action = use(freeTable()) // drop anything else
    else if (croissantReady) action = use(OVEN) // take it before it burns
    else if (needCroissant && DOUGH[0] >= 0) action = use(DOUGH)
    else if (needChopped && STRAWBERRY[0] >= 0) action = use(STRAWBERRY)
    else {
      // A plate: prefer a plate already on a table that still fits an order.
      const plate = tables
        .filter(t => t.item.startsWith("DISH"))
        .filter(t => {
          const on = t.item.split("-").filter(s => s !== "DISH")
          return orders.some(o => on.every(d => o.items.includes(d)))
        })
        .sort((a, b) => near(a) - near(b))[0]
      action = plate ? `USE ${plate.x} ${plate.y}` : use(DISHWASHER)
    }
  } else {
    const onPlate = carried.filter(s => s !== "DISH")
    const fits = orders.filter(o => onPlate.every(d => o.items.includes(d))).sort((a, b) => b.award - a.award)
    const target = fits[0]
    if (!target) action = use(DISHWASHER)
    else {
      const missing = target.items.filter(d => !onPlate.includes(d))
      const fromCrate = missing.find(d => CRATE[d])
      const fromTable = missing.map(d => onTable(d)).find(t => t)
      if (missing.includes("CROISSANT") && croissantReady) action = use(OVEN)
      else if (fromCrate) action = use(CRATE[fromCrate])
      else if (fromTable) action = `USE ${fromTable.x} ${fromTable.y}`
      else if (!missing.length) action = use(WINDOW)
      else action = use(freeTable()) // park the plate, go chop
    }
  }
  console.log(action)
}
