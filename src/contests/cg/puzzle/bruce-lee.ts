// 🎮 CodinGame Puzzle - bruce-lee
// https://www.codingame.com/training/medium/bruce-lee

function decode(message: string): string | null {
  const blocks = message.trim().split(" ")
  if (blocks.length % 2 !== 0 || blocks.some(b => !/^0+$/.test(b))) return null
  let bits = ""
  for (let i = 0; i < blocks.length; i += 2) {
    if (blocks[i] !== "0" && blocks[i] !== "00") return null
    bits += new Array(blocks[i + 1].length + 1).join(blocks[i] === "0" ? "1" : "0")
  }
  if (bits.length % 7 !== 0) return null
  let text = ""
  for (let i = 0; i < bits.length; i += 7) text += String.fromCharCode(parseInt(bits.substr(i, 7), 2))
  return text
}

const result = decode(readline())
console.log(result === null ? "INVALID" : result)
