// 🎮 CodinGame Puzzle - egyptian-multiplication
// https://www.codingame.com/training/easy/egyptian-multiplication

const [a, b]: number[] = readline()
  .split(" ")
  .map((x: string) => parseInt(x, 10))
const small: number = Math.min(a, b)
const product: number = a * b
let big: number = Math.max(a, b)
let mult: number = small

const lines: string[] = [`${big} * ${mult}`]
const collected: number[] = []

while (mult > 0) {
  if (mult % 2 === 1) {
    collected.push(big)
    mult -= 1
  } else {
    mult /= 2
    big *= 2
  }
  let line: string = `= ${big} * ${mult}`
  if (collected.length > 0) {
    line += " + " + collected.join(" + ")
  }
  lines.push(line)
}

lines.push(`= ${product}`)
console.log(lines.join("\n"))
