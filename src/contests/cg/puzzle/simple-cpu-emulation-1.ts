// 🎮 CodinGame Puzzle - simple-cpu-emulation-1
// https://www.codingame.com/training/medium/simple-cpu-emulation-1

const code = readline().trim()
const reg = [0, 0, 0]
let pc = 0
while (pc + 4 <= code.length) {
  const opcode = code.substr(pc, 4)
  pc += 4
  if (opcode === "0000") break
  const kind = opcode.charAt(0)
  const k = parseInt(opcode.charAt(1), 16)
  const nn = parseInt(opcode.substr(2), 16)
  const x = parseInt(opcode.charAt(2), 16)
  const y = parseInt(opcode.charAt(3), 16)
  let skip = false
  switch (kind.toUpperCase()) {
    case "1":
      reg[k] = nn
      break
    case "2": {
      const sum = reg[x] + reg[y]
      reg[x] = sum & 255
      reg[2] = sum > 255 ? 1 : 0
      break
    }
    case "3": {
      const diff = reg[x] - reg[y]
      reg[x] = (diff + 256) & 255
      reg[2] = diff < 0 ? 1 : 0
      break
    }
    case "4":
      reg[x] |= reg[y]
      break
    case "5":
      reg[x] &= reg[y]
      break
    case "6":
      reg[x] ^= reg[y]
      break
    case "7":
      skip = reg[k] === nn
      break
    case "8":
      skip = reg[k] !== nn
      break
    case "9":
      skip = reg[x] === reg[y]
      break
    case "A":
      skip = reg[x] !== reg[y]
      break
  }
  if (skip) pc += 4
}
console.log(reg.join(" "))
