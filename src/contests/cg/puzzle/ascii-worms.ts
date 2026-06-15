// 🎮 CodinGame Puzzle - ascii-worms
// https://www.codingame.com/

const thickness: number = parseInt(readline(), 10)
const length: number = parseInt(readline(), 10)
const turns: number = parseInt(readline(), 10)

const cols: number = turns + 1
const slot: number = thickness + 1
const width: number = cols * thickness + (cols + 1)
const barPos = (i: number): number => i * slot
const topJoin = (c: number): boolean => c % 2 === 1
const botJoin = (c: number): boolean => c % 2 === 0

const out: string[] = []

const topArr: string[] = new Array<string>(width).fill(" ")
for (let c = 0; c < cols; c++) {
  for (let x = barPos(c) + 1; x <= barPos(c) + thickness; x++) topArr[x] = "_"
}
for (let c = 0; c < cols - 1; c++) {
  if (topJoin(c)) topArr[barPos(c + 1)] = "_"
}
out.push(topArr.join("").replace(/\s+$/, ""))

for (let r = 1; r <= length; r++) {
  const arr: string[] = new Array<string>(width).fill(" ")
  for (let i = 0; i <= cols; i++) arr[barPos(i)] = "|"
  if (r === 1) {
    for (let c = 0; c < cols - 1; c++) {
      if (topJoin(c)) arr[barPos(c + 1)] = " "
    }
  }
  if (r === length) {
    for (let c = 0; c < cols; c++) {
      for (let x = barPos(c) + 1; x <= barPos(c) + thickness; x++) arr[x] = "_"
    }
    for (let c = 0; c < cols - 1; c++) {
      if (botJoin(c)) arr[barPos(c + 1)] = "_"
    }
  }
  out.push(arr.join("").replace(/\s+$/, ""))
}

console.log(out.join("\n"))
