// 🎮 CodinGame Puzzle - cheap-choices
// https://www.codingame.com/training/easy/cheap-choices

interface Item {
  category: string
  size: string
  price: number
  sold: boolean
}

const c: number = parseInt(readline(), 10)
const p: number = parseInt(readline(), 10)

const items: Item[] = []
for (let i = 0; i < c; i++) {
  const [category, size, price] = readline().split(" ")
  items.push({ category, size, price: parseInt(price, 10), sold: false })
}

const output: string[] = []
for (let i = 0; i < p; i++) {
  const [category, size] = readline().split(" ")
  let best: Item | null = null
  for (const item of items) {
    if (item.sold || item.category !== category || item.size !== size) {
      continue
    }
    if (best === null || item.price < best.price) {
      best = item
    }
  }
  if (best === null) {
    output.push("NONE")
  } else {
    best.sold = true
    output.push(String(best.price))
  }
}

console.log(output.join("\n"))
