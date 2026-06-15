// 🎮 CodinGame Puzzle - vectors-in-variables-dimensions
// https://www.codingame.com/

readline()
const n: number = parseInt(readline(), 10)
const names: string[] = []
const coords: number[][] = []
for (let i = 0; i < n; i++) {
  const line: string = readline()
  const open: number = line.indexOf("(")
  names.push(line.slice(0, open))
  const inside: string = line.slice(open + 1, line.indexOf(")"))
  coords.push(inside.split(",").map((s: string): number => parseInt(s, 10)))
}

let shortI = -1
let shortJ = -1
let longI = -1
let longJ = -1
let shortD = Infinity
let longD = -Infinity

for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    let sum = 0
    for (let k = 0; k < coords[i].length; k++) {
      const diff: number = coords[i][k] - coords[j][k]
      sum += diff * diff
    }
    if (sum > 0 && sum < shortD) {
      shortD = sum
      shortI = i
      shortJ = j
    }
    if (sum > longD) {
      longD = sum
      longI = i
      longJ = j
    }
  }
}

function format(i: number, j: number): string {
  const diffs: number[] = coords[i].map((c: number, k: number): number => coords[j][k] - c)
  return names[i] + names[j] + "(" + diffs.join(",") + ")"
}

console.log(format(shortI, shortJ))
console.log(format(longI, longJ))
