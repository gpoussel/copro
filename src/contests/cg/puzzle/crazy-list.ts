// 🎮 CodinGame Puzzle - crazy-list
// https://www.codingame.com/

const list: number[] = readline()
  .split(" ")
  .filter(s => s.length > 0)
  .map(s => Number(s))

const last = list[list.length - 1]

// Each iteration applies a fixed sequence of (add / multiply) operators, which
// composes to a single linear function: next = a * x + b.
// Solve for a and b using two consecutive pairs with distinct x values.
let a = 1
let b = 0

if (list.length >= 3) {
  let solved = false
  for (let i = 0; i + 1 < list.length && !solved; i++) {
    for (let j = i + 1; j + 1 < list.length && !solved; j++) {
      const x1 = list[i]
      const y1 = list[i + 1]
      const x2 = list[j]
      const y2 = list[j + 1]
      if (x1 !== x2) {
        a = (y2 - y1) / (x2 - x1)
        b = y1 - a * x1
        solved = true
      }
    }
  }
  if (!solved) {
    // All x equal (constant list): next equals last.
    a = 1
    b = list[1] - list[0]
  }
} else if (list.length === 2) {
  // Only one pair: identity continuation is the unique consistent answer.
  b = list[1] - list[0]
}

console.log(a * last + b)
