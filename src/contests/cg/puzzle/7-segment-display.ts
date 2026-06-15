// 🎮 CodinGame Puzzle - 7-segment-display
// https://www.codingame.com/training/hard/7-segment-display

const N: string = readline()
const C: string = readline()
const S: number = parseInt(readline())

const seg: { [k: string]: boolean[] } = {
  "0": [true, true, true, true, true, true, false],
  "1": [false, true, true, false, false, false, false],
  "2": [true, true, false, true, true, false, true],
  "3": [true, true, true, true, false, false, true],
  "4": [false, true, true, false, false, true, true],
  "5": [true, false, true, true, false, true, true],
  "6": [true, false, true, true, true, true, true],
  "7": [true, true, true, false, false, false, false],
  "8": [true, true, true, true, true, true, true],
  "9": [true, true, true, true, false, true, true],
}

const digits = N.split("")
const H = 2 * S + 3
const lines: string[] = []

function horiz(on: boolean): string {
  return " " + (on ? C.repeat(S) : " ".repeat(S)) + " "
}
function vert(left: boolean, right: boolean): string {
  return (left ? C : " ") + " ".repeat(S) + (right ? C : " ")
}

for (let row = 0; row < H; row++) {
  const parts: string[] = []
  for (const d of digits) {
    const s = seg[d]
    let cell: string
    if (row === 0) cell = horiz(s[0])
    else if (row < S + 1) cell = vert(s[5], s[1])
    else if (row === S + 1) cell = horiz(s[6])
    else if (row < 2 * S + 2) cell = vert(s[4], s[2])
    else cell = horiz(s[3])
    parts.push(cell)
  }
  lines.push(parts.join(" ").replace(/\s+$/, ""))
}
console.log(lines.join("\n"))
