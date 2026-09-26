// 🎮 CodinGame Puzzle - ring-the-bells
// https://www.codingame.com/training/medium/ring-the-bells

const cycles: number[][] = (readline().match(/\([^)]*\)/g) || []).map(c =>
  c
    .slice(1, -1)
    .trim()
    .split(/\s+/)
    .filter(s => s !== "")
    .map(Number),
)

const elements: number[] = []
for (const cycle of cycles) for (const e of cycle) if (elements.indexOf(e) < 0) elements.push(e)
elements.sort((a, b) => a - b)

// Image of x through a single cycle
const applyCycle = (cycle: number[], x: number): number => {
  const i = cycle.indexOf(x)
  return i < 0 ? x : cycle[(i + 1) % cycle.length]
}
// Product is applied from right to left
const image = (x: number): number => {
  for (let i = cycles.length - 1; i >= 0; i--) x = applyCycle(cycles[i], x)
  return x
}

const seen: number[] = []
let out = ""
for (const start of elements) {
  if (seen.indexOf(start) >= 0) continue
  const cycle = [start]
  seen.push(start)
  for (let x = image(start); x !== start; x = image(x)) {
    cycle.push(x)
    seen.push(x)
  }
  if (cycle.length > 1) out += `(${cycle.join(" ")})`
}
console.log(out === "" ? "()" : out)
