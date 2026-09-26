// 🎮 CodinGame Puzzle - parsing-context-free-grammar
// https://www.codingame.com/training/hard/parsing-context-free-grammar

// CYK algorithm: table[i][j] is the bitmask of non-terminals deriving the
// substring word[i..j]; binary rules are grouped by their left child.
const N = Number(readline())
const START = readline().trim()
const bit = (ch: string) => 1 << (ch.charCodeAt(0) - 65)
const terminal = new Map<string, number>()
// byLeft[B] = list of [C mask, A mask] for rules A -> B C
const byLeft: [number, number][][] = Array.from({ length: 26 }, () => [])
for (let i = 0; i < N; i++) {
  const [lhs, rhs] = readline()
    .split("->")
    .map(s => s.trim())
  if (rhs.length === 1) terminal.set(rhs, (terminal.get(rhs) ?? 0) | bit(lhs))
  else byLeft[rhs.charCodeAt(0) - 65].push([bit(rhs[1]), bit(lhs)])
}
const startBit = bit(START)

const T = Number(readline())
const out: string[] = []
for (let t = 0; t < T; t++) {
  const word = readline().trim()
  const n = word.length
  // cell(i, len) stored at i * (n + 1) + len
  const table = new Int32Array(n * (n + 1))
  for (let i = 0; i < n; i++) table[i * (n + 1) + 1] = terminal.get(word[i]) ?? 0
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len <= n; i++) {
      let mask = 0
      for (let k = 1; k < len; k++) {
        let left = table[i * (n + 1) + k]
        const right = table[(i + k) * (n + 1) + len - k]
        if (!left || !right) continue
        while (left) {
          const low = left & -left
          left ^= low
          for (const [c, a] of byLeft[31 - Math.clz32(low)]) if (right & c) mask |= a
        }
      }
      table[i * (n + 1) + len] = mask
    }
  out.push(n > 0 && table[n] & startBit ? "true" : "false")
}
console.log(out.join("\n"))
