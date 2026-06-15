// 🎮 CodinGame Puzzle - set-probabilities-card-game
// https://www.codingame.com/

const numbers: string[] = ["1", "2", "3"]
const shadings: string[] = ["OUTLINED", "STRIPED", "SOLID"]
const colors: string[] = ["RED", "GREEN", "PURPLE"]
const shapes: string[] = ["DIAMOND", "OVAL", "SQUIGGLE"]

const encode = (parts: string[]): number => {
  const a = numbers.indexOf(parts[0])
  const b = shadings.indexOf(parts[1])
  const c = colors.indexOf(parts[2])
  const d = shapes.indexOf(parts[3])
  return a * 27 + b * 9 + c * 3 + d
}

const digits = (card: number): number[] => [
  Math.floor(card / 27) % 3,
  Math.floor(card / 9) % 3,
  Math.floor(card / 3) % 3,
  card % 3,
]

const isSet = (x: number, y: number, z: number): boolean => {
  const dx = digits(x)
  const dy = digits(y)
  const dz = digits(z)
  for (let i = 0; i < 4; i++) {
    const sum = dx[i] + dy[i] + dz[i]
    if (sum % 3 !== 0) return false
  }
  return true
}

const n = parseInt(readline())
const table: number[] = []
const onTable: Set<number> = new Set<number>()
for (let i = 0; i < n; i++) {
  table.push(encode(readline().split(" ")))
}
for (const c of table) onTable.add(c)

const hasSet = (cards: number[]): boolean => {
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        if (isSet(cards[i], cards[j], cards[k])) return true
      }
    }
  }
  return false
}

let favorable = 0
let total = 0
for (let card = 0; card < 81; card++) {
  if (onTable.has(card)) continue
  total++
  if (hasSet([...table, card])) favorable++
}

const probability = favorable / total
console.log(probability.toFixed(4))
