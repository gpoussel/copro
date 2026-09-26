// 🎮 CodinGame Puzzle - cooking-passion
// https://www.codingame.com/training/medium/cooking-passion

interface Quantity {
  amount: number // in g for solids, cl for liquids
  solid: boolean
}

const parseQuantity = (s: string): Quantity => {
  const [, value, unit] = s.match(/^([\d.]+)(kg|g|cl|L)$/)!
  const v = parseFloat(value)
  if (unit === "kg") return { amount: Math.round(v * 1000), solid: true }
  if (unit === "g") return { amount: Math.round(v), solid: true }
  if (unit === "L") return { amount: Math.round(v * 100), solid: false }
  return { amount: Math.round(v), solid: false }
}

const format = ({ amount, solid }: Quantity): string => {
  const factor = solid ? 1000 : 100
  if (amount < factor) return amount + (solid ? "g" : "cl")
  let s = String(amount / factor)
  if (s.indexOf(".") < 0) s += ".0"
  return s + (solid ? "kg" : "L")
}

const [numRecipe, numIngredients] = readline().split(" ").map(Number)
const recipe = new Map<string, number>()
for (let i = 0; i < numRecipe; i++) {
  const line = readline()
  if (line[0] !== "-") continue
  const parts = line.slice(1).trim().split(" ")
  recipe.set(parts.slice(1).join(" "), parseQuantity(parts[0]).amount)
}

const stock: { name: string; quantity: Quantity }[] = []
for (let i = 0; i < numIngredients; i++) {
  const parts = readline().trim().split(" ")
  stock.push({ name: parts.slice(0, -1).join(" "), quantity: parseQuantity(parts[parts.length - 1]) })
}

let times = Infinity
for (const { name, quantity } of stock) {
  const need = recipe.get(name)
  if (need) times = Math.min(times, Math.floor(quantity.amount / need))
}
// Several ingredients may allow the same number of meals: the limiting one is the solid
// ingredient that ends up completely used
const limiting = stock.filter(
  ({ name, quantity }) => quantity.solid && recipe.has(name) && quantity.amount === times * recipe.get(name)!,
)[0].name

const leftovers = stock
  .filter(s => s.name !== limiting)
  .map(s => ({ name: s.name, quantity: { amount: s.quantity.amount - times * (recipe.get(s.name) || 0), solid: s.quantity.solid } }))
  .sort((a, b) => (a.quantity.solid !== b.quantity.solid ? (a.quantity.solid ? -1 : 1) : a.quantity.amount - b.quantity.amount))

console.log(limiting)
console.log(times)
for (const { name, quantity } of leftovers) console.log(`${name} ${format(quantity)}`)
