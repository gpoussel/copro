// 🎮 CodinGame Multiplayer - code-a-la-mode
// https://www.codingame.com/multiplayer/bot-programming/code-a-la-mode
// Referee: https://github.com/csj/code-a-la-mode
//
// Two chefs share a kitchen (11×7); orders are dishes with desserts. Wood 3:
// ICE_CREAM (crate I) and BLUEBERRIES (crate B) only; a plate comes from the
// dishwasher D, orders go to the window W. USE on a crate while holding a
// plate adds that dessert to it. Bot: take a plate, add the missing
// desserts of the best order it can still become, deliver; a plate with a
// wrong dessert goes back to the dishwasher.

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

while (true) {
  readline() // turns remaining
  const [px, py, item] = readline().trim().split(" ")
  readline() // partner
  const tables = parseInt(readline())
  for (let i = 0; i < tables; i++) readline()
  readline() // oven
  const nc = parseInt(readline())
  const orders: { items: string[]; award: number }[] = []
  for (let i = 0; i < nc; i++) {
    const [o, a] = readline().trim().split(" ")
    orders.push({ items: o.split("-").filter(s => s !== "DISH"), award: +a })
  }
  void px
  void py
  const carried = item === "NONE" ? [] : item.split("-")
  let action: string
  if (!carried.includes("DISH")) {
    // Take a clean plate (drop whatever we hold is not possible: plate first).
    action = `USE ${DISHWASHER[0]} ${DISHWASHER[1]}`
  } else {
    const onPlate = carried.filter(s => s !== "DISH")
    const fits = orders
      .filter(o => onPlate.every(d => o.items.includes(d)))
      .sort((a, b) => b.award - a.award)
    const target = fits[0]
    if (!target) action = `USE ${DISHWASHER[0]} ${DISHWASHER[1]}`
    else {
      const missing = target.items.find(d => !onPlate.includes(d) && CRATE[d])
      if (missing) action = `USE ${CRATE[missing][0]} ${CRATE[missing][1]}`
      else action = `USE ${WINDOW[0]} ${WINDOW[1]}`
    }
  }
  console.log(action)
}
