// 🎮 CodinGame Puzzle - 1d-spreadsheet
// https://www.codingame.com/training/easy/1d-spreadsheet

const N = parseInt(readline())

const cells: { op: string; arg1: string; arg2: string }[] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  cells.push({ op: parts[0], arg1: parts[1], arg2: parts[2] })
}

const resolved: (number | undefined)[] = new Array(N).fill(undefined)

function resolve(i: number): number {
  if (resolved[i] !== undefined) return resolved[i]
  const { op, arg1, arg2 } = cells[i]
  const getVal = (arg: string): number => {
    if (arg.startsWith("$")) return resolve(parseInt(arg.slice(1)))
    return parseInt(arg)
  }
  let result: number
  if (op === "VALUE") {
    result = getVal(arg1)
  } else if (op === "ADD") {
    result = getVal(arg1) + getVal(arg2)
  } else if (op === "SUB") {
    result = getVal(arg1) - getVal(arg2)
  } else {
    // MULT
    result = getVal(arg1) * getVal(arg2)
  }
  resolved[i] = result
  return result
}

for (let i = 0; i < N; i++) {
  // `+ 0` normalises JavaScript's signed negative zero (e.g. 0 * -3 === -0),
  // which Node's console.log would otherwise print as "-0".
  console.log(resolve(i) + 0)
}
