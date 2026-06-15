// 🎮 CodinGame Puzzle - build-a-bookcase
// https://www.codingame.com/

const height: number = parseInt(readline(), 10)
const width: number = parseInt(readline(), 10)
const numberOfShelves: number = parseInt(readline(), 10)

const inner: number = width - 2

// Decorative top
const half: number = Math.floor(inner / 2)
const middle: string = inner % 2 === 1 ? "^" : ""
const top: string = "/".repeat(half + 1) + middle + "\\".repeat(half + 1)

const lines: string[] = [top]

// Body rows distributed across shelves; larger shelves at the bottom
const bodyRows: number = height - 1
const base: number = Math.floor(bodyRows / numberOfShelves)
const remainder: number = bodyRows % numberOfShelves

const empty: string = "|" + " ".repeat(inner) + "|"
const shelf: string = "|" + "_".repeat(inner) + "|"

for (let i = 0; i < numberOfShelves; i++) {
  const size: number = base + (i >= numberOfShelves - remainder ? 1 : 0)
  for (let r = 0; r < size - 1; r++) {
    lines.push(empty)
  }
  lines.push(shelf)
}

console.log(lines.join("\n"))
