// 🎮 CodinGame Puzzle - logic-gates
// https://www.codingame.com/training/easy/logic-gates

const n = Number(readline())
const m = Number(readline())

// '-' is high (1), '_' is low (0).
const signals = new Map<string, string>()
for (let i = 0; i < n; i++) {
  const [name, form] = readline().split(" ")
  signals.set(name, form)
}

const gates: Record<string, (a: boolean, b: boolean) => boolean> = {
  AND: (a, b) => a && b,
  OR: (a, b) => a || b,
  XOR: (a, b) => a !== b,
  NAND: (a, b) => !(a && b),
  NOR: (a, b) => !(a || b),
  NXOR: (a, b) => a === b,
}

const output: string[] = []
for (let i = 0; i < m; i++) {
  const [name, type, in1, in2] = readline().split(" ")
  const a = signals.get(in1)!
  const b = signals.get(in2)!
  const gate = gates[type]

  let form = ""
  for (let k = 0; k < a.length; k++) {
    form += gate(a[k] === "-", b[k] === "-") ? "-" : "_"
  }

  signals.set(name, form)
  output.push(`${name} ${form}`)
}

console.log(output.join("\n"))
