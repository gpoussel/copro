// 🎮 CodinGame Puzzle - interstellar
// https://www.codingame.com/training/easy/interstellar

function parseVector(s: string): [number, number, number] {
  const clean = s.replace(/\s+/g, "")
  const coords: { [key: string]: number } = { i: 0, j: 0, k: 0 }
  const re = /([+-]?\d*)([ijk])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(clean)) !== null) {
    const numPart = m[1]
    const comp = m[2]
    let value: number
    if (numPart === "" || numPart === "+") {
      value = 1
    } else if (numPart === "-") {
      value = -1
    } else {
      value = parseInt(numPart, 10)
    }
    coords[comp] = value
  }
  return [coords["i"], coords["j"], coords["k"]]
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

const ship = parseVector(readline())
const wormhole = parseVector(readline())

const diff: [number, number, number] = [wormhole[0] - ship[0], wormhole[1] - ship[1], wormhole[2] - ship[2]]

const distance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2])

let g = gcd(gcd(diff[0], diff[1]), diff[2])
if (g === 0) g = 1

const simplified: [number, number, number] = [diff[0] / g, diff[1] / g, diff[2] / g]

const labels = ["i", "j", "k"]
let direction = ""
for (let idx = 0; idx < 3; idx++) {
  const v = simplified[idx]
  if (v === 0) continue
  let term: string
  const abs = Math.abs(v)
  const magnitude = abs === 1 ? "" : String(abs)
  if (direction === "") {
    term = (v < 0 ? "-" : "") + magnitude + labels[idx]
  } else {
    term = (v < 0 ? "-" : "+") + magnitude + labels[idx]
  }
  direction += term
}

console.log("Direction: " + direction)
console.log("Distance: " + distance.toFixed(2))
