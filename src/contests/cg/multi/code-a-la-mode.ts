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
let lastAction = ""
let lastItem = ""
let stuck = 0

while (true) {
  readline() // turns remaining
  const [pxs, pys, item] = readline().trim().split(" ")
  const px = +pxs
  const py = +pys
  const partnerItem = readline().trim().split(" ")[2] ?? "NONE"
  const partnerPlate = partnerItem.startsWith("DISH") ? partnerItem.split("-").filter(s => s !== "DISH") : null
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
  // Target order: best award per estimated work (items already on a table
  // or in the oven cost nothing; a tart is the longest chain).
  const work = (d: string) => {
    if (CRATE[d] || onTable(d) || ovenItem === d) return 1
    if (d === "CHOPPED_STRAWBERRIES") return 4
    if (d === "CROISSANT") return 13
    if (d === "TART") return onTable("RAW_TART") || ovenItem === "RAW_TART" ? 8 : 16
    return 3
  }
  const carriedPlate = item.startsWith("DISH") ? item.split("-").filter(s => s !== "DISH") : []
  const orderValue = (o: { items: string[]; award: number }) =>
    carriedPlate.every(d => o.items.includes(d))
      ? o.award / (3 + o.items.filter(d => !carriedPlate.includes(d)).reduce((t, d) => t + work(d), 0))
      : 0
  // The partner's plate claims the best order it fits: aim at another one.
  const partnerOrder = partnerPlate
    ? orders.filter(o => partnerPlate.every(d => o.items.includes(d))).sort((a, b) => orderValue(b) - orderValue(a))[0]
    : undefined
  const ranked = orders.slice().sort((a, b) => orderValue(b) - orderValue(a))
  const best = ranked.find(o => o !== partnerOrder) ?? ranked[0]
  // Do not duplicate what the partner is already carrying through.
  const partnerBusy = (...what: string[]) => what.includes(partnerItem.split("-")[0])
  const needChopped =
    best?.items.includes("CHOPPED_STRAWBERRIES") &&
    !onTable("CHOPPED_STRAWBERRIES") &&
    !partnerBusy("STRAWBERRIES", "CHOPPED_STRAWBERRIES")
  // Croissants: dough (H) baked 10 turns in the oven (O), ready for 10 more.
  const croissantReady = ovenItem === "CROISSANT" || ovenItem === "TART" // anything baked: take it
  // Tart (Bronze): dough → board (CHOPPED_DOUGH) → + blueberries (RAW_TART)
  // → oven (TART).
  const needTart =
    OVEN[0] >= 0 &&
    !!best?.items.includes("TART") &&
    !partnerBusy("CHOPPED_DOUGH", "RAW_TART", "TART") &&
    !onTable("TART") &&
    !onTable("RAW_TART") &&
    ovenItem !== "RAW_TART" &&
    ovenItem !== "TART"
  const needCroissant =
    OVEN[0] >= 0 &&
    !!best?.items.includes("CROISSANT") &&
    !partnerBusy("DOUGH", "CROISSANT") &&
    !onTable("CROISSANT") &&
    ovenItem === "NONE"
  let action: string
  if (carried[0] === "STRAWBERRIES") action = use(BOARD)
  else if (carried[0] === "DOUGH")
    // Never wait on a busy oven with dough in hand (a ready croissant there
    // could not be taken: a whole round was lost that way).
    action =
      needTart && (!needCroissant || ovenItem !== "NONE")
        ? use(BOARD)
        : ovenItem === "NONE"
          ? use(OVEN)
          : use(freeTable())
  else if (carried[0] === "CHOPPED_DOUGH") action = use(CRATE.BLUEBERRIES)
  else if (carried[0] === "RAW_TART") action = ovenItem === "NONE" ? use(OVEN) : use(freeTable())
  else if (carried[0] === "CHOPPED_STRAWBERRIES" || carried[0] === "CROISSANT" || carried[0] === "TART")
    action = use(freeTable())
  else if (!carried.includes("DISH")) {
    if (carried.length) action = use(freeTable()) // drop anything else
    else if (croissantReady) action = use(OVEN) // take it before it burns
    else if ((needCroissant || needTart) && DOUGH[0] >= 0) action = use(DOUGH)
    else if (onTable("RAW_TART") && ovenItem === "NONE") {
      const t = onTable("RAW_TART")!
      action = `USE ${t.x} ${t.y}`
    }
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
    const fits = orders.filter(o => onPlate.every(d => o.items.includes(d))).sort((a, b) => orderValue(b) - orderValue(a))
    const target = fits[0]
    if (!target) action = use(DISHWASHER)
    else {
      const missing = target.items.filter(d => !onPlate.includes(d))
      const fromCrate = missing.find(d => CRATE[d])
      const fromTable = missing.map(d => onTable(d)).find(t => t)
      if ((missing.includes(ovenItem) && croissantReady)) action = use(OVEN)
      else if (fromCrate) action = use(CRATE[fromCrate])
      else if (fromTable) action = `USE ${fromTable.x} ${fromTable.y}`
      else if (!missing.length) action = use(WINDOW)
      else if (
        (missing.includes("CROISSANT") && (ovenItem === "DOUGH" || ovenItem === "CROISSANT")) ||
        (missing.includes("TART") && (ovenItem === "RAW_TART" || ovenItem === "TART"))
      )
        // Wait at the oven: a plate USE takes the baked item onto it.
        action = use(OVEN)
      else action = use(freeTable()) // park the plate, go chop
    }
  }
  // Stuck (same action, same hands for 6 turns): put the item down.
  // (Waiting at the oven for a bake is not being stuck.)
  const baking = ovenItem === "DOUGH" || ovenItem === "RAW_TART"
  if (action === lastAction && item === lastItem && item !== "NONE" && !(action === use(OVEN) && baking)) stuck++
  else stuck = 0
  lastAction = action
  lastItem = item
  if (stuck >= 6) {
    action = use(freeTable())
    stuck = 0
  }
  console.log(action)
}
