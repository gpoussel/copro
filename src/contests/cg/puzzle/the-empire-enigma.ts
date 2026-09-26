// 🎮 CodinGame Puzzle - the-empire-enigma
// https://www.codingame.com/training/hard/the-empire-enigma

// The RNG lives modulo 7140, so the keystream is fully determined by the
// first used number R(Offset+1). Only values reachable after Offset+1 steps
// qualify (iterate the image of the map until it stabilises), then keep the
// one that decodes to "@" followed by printable ASCII.

const MOD = 7140
const step = (r: number) => (7562100 * r + 907598307) % MOD

const offset = BigInt(readline().trim())
const msgLength = parseInt(readline())
const coded: number[] = []
for (let i = 0; i < msgLength; i++) coded.push(parseInt(readline()))

// Possible values of R(Offset + 1)
let reachable = new Set<number>(Array.from({ length: MOD }, (_, i) => i))
for (let k = 0n; k <= offset; k++) {
  const next = new Set<number>([...reachable].map(step))
  const stable = next.size === reachable.size
  reachable = next
  if (stable) break
}

const decode = (start: number): string | null => {
  let r = start
  let text = ""
  for (let i = 0; i < coded.length; i++) {
    const ch = (coded[i] ^ r) & 255
    if (i === 0 ? ch !== 64 : ch < 32 || ch > 126) return null
    text += String.fromCharCode(ch)
    r = step(r)
  }
  return text
}

let answer = ""
for (const start of reachable) {
  const text = decode(start)
  if (text !== null) {
    answer = text.slice(1)
    break
  }
}
console.log(answer)
