// 🎮 CodinGame Puzzle - micro-assembly
// https://www.codingame.com/training/medium/micro-assembly

const reg: { [k: string]: number } = {}
const [a, b, c, d] = readline().split(" ").map(Number)
reg.a = a
reg.b = b
reg.c = c
reg.d = d
const n = parseInt(readline(), 10)
const prog: string[][] = []
for (let i = 0; i < n; i++) prog.push(readline().split(" "))

const val = (s: string): number => (s in reg ? reg[s] : parseInt(s, 10))

let pc = 0
while (pc < prog.length) {
  const ins = prog[pc]
  const op = ins[0]
  if (op === "MOV") {
    reg[ins[1]] = val(ins[2])
  } else if (op === "ADD") {
    reg[ins[1]] = val(ins[2]) + val(ins[3])
  } else if (op === "SUB") {
    reg[ins[1]] = val(ins[2]) - val(ins[3])
  } else if (op === "JNE") {
    if (val(ins[2]) !== val(ins[3])) {
      pc = parseInt(ins[1], 10)
      continue
    }
  }
  pc++
}
console.log(`${reg.a} ${reg.b} ${reg.c} ${reg.d}`)
