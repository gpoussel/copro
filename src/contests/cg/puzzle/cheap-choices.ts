// 🎮 CodinGame Puzzle - cheap-choices
// https://www.codingame.com/training/easy/cheap-choices

const c = parseInt(readline(), 10)
const p = parseInt(readline(), 10)

interface Item {
  category: string
  size: string
  price: number
  used: boolean
}
const items: Item[] = []
for (let i = 0; i < c; i++) {
  const [category, size, price] = readline().split(" ")
  items.push({ category, size, price: parseInt(price, 10), used: false })
}

const out: string[] = []
for (let i = 0; i < p; i++) {
  const [category, size] = readline().split(" ")
  let best: Item | null = null
  for (const it of items) {
    if (!it.used && it.category === category && it.size === size) {
      if (best === null || it.price < best.price) best = it
    }
  }
  if (best === null) {
    out.push("NONE")
  } else {
    best.used = true
    out.push(String(best.price))
  }
}
console.log(out.join("\n"))
