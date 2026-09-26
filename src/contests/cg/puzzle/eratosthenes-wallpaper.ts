// 🎮 CodinGame Puzzle - eratosthenes-wallpaper
// https://www.codingame.com/training/medium/eratosthenes-wallpaper

const [width, height, first] = readline().split(" ").map(Number)

function factorize(n: number): string {
  const factors: number[] = []
  let rest = n
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      factors.push(p)
      rest /= p
    }
  }
  if (rest > 1) factors.push(rest)
  return `${n}=${factors.join("*")}`
}

const pad = (line: string) => line + new Array(width - line.length + 1).join("-")

let number = first
let term = factorize(number)
let stuck = false
const lines: string[] = []
for (let row = 0; row < height; row++) {
  let line = ""
  while (!stuck) {
    const candidate = line === "" ? term : `${line},${term}`
    if (candidate.length > width) {
      // The next number does not even fit on an empty line: stop there
      if (line === "") stuck = true
      break
    }
    line = candidate
    term = factorize(++number)
  }
  lines.push(pad(line))
}
console.log(lines.join("\n"))
