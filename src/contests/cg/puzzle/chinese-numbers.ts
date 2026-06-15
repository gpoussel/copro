// 🎮 CodinGame Puzzle - chinese-numbers
// https://www.codingame.com/

const ref: string[] = [
  "*000* ***** 00000 00000 00000 00000 **0** **0** *0*0* **0**",
  "0***0 ***** ***** ***** 0*0*0 **0** **0** **0** *0*0* **0**",
  "0***0 00000 ***** *000* 00*00 *0000 00000 00000 *0*0* 0000*",
  "0***0 ***** ***** ***** 0***0 **0*0 *0*0* **0** *0*0* *0*0*",
  "*000* ***** 00000 00000 00000 00000 0***0 **000 0***0 0**00",
]

const templates: string[] = []
for (let d = 0; d < 10; d++) {
  let t = ""
  for (let r = 0; r < 5; r++) {
    t += ref[r].split(" ")[d]
  }
  templates.push(t)
}

const blocksPerLine: string[][] = []
for (let i = 0; i < 5; i++) {
  blocksPerLine.push(readline().split(" "))
}

const count = blocksPerLine[0].length
let result = ""
for (let c = 0; c < count; c++) {
  let key = ""
  for (let r = 0; r < 5; r++) {
    key += blocksPerLine[r][c]
  }
  result += templates.indexOf(key)
}

console.log(result)
