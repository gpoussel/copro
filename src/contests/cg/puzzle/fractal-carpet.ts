// 🎮 CodinGame Puzzle - fractal-carpet
// https://www.codingame.com/training/hard/fractal-carpet

// A cell is "+" iff, among its first L base-3 digits, x and y both have a 1 at
// the same position (it lies in the removed middle square at that level).
const L = Number(readline())
const [x1, y1, x2, y2] = readline().trim().split(/\s+/).map(BigInt)

// Bitmask of the positions of the digit 1 among the L lowest base-3 digits
const ones = (v: bigint): bigint => {
  let mask = 0n
  for (let i = 0n; i < BigInt(L) && v > 0n; i++) {
    if (v % 3n === 1n) mask |= 1n << i
    v /= 3n
  }
  return mask
}
const cols: bigint[] = []
for (let x = x1; x <= x2; x++) cols.push(ones(x))
const out: string[] = []
for (let y = y1; y <= y2; y++) {
  const my = ones(y)
  out.push(cols.map(mx => ((mx & my) !== 0n ? "+" : "0")).join(""))
}
console.log(out.join("\n"))
