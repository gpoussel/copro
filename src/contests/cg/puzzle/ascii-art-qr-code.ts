// 🎮 CodinGame Puzzle - ascii-art-qr-code
// https://www.codingame.com/training/hard/ascii-art-qr-code

const qrW = parseInt(readline())
const qrH = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < qrH; i++) grid.push((readline() ?? "").padEnd(qrW, " "))

// A cell is reserved when it belongs to a position marker, its quiet zone or the alignment marker
const reserved = (r: number, c: number): boolean => {
  const top = r <= 3
  const bottom = r >= qrH - 4
  const left = c <= 5
  const right = c >= qrW - 6
  if ((top && left) || (top && right) || (bottom && left)) return true
  // alignment marker: 3x3, 3 chars from right border, 1 char from bottom
  return r >= qrH - 4 && r <= qrH - 2 && c >= qrW - 6 && c <= qrW - 4
}

// Column-by-column zigzag from the lower right corner, starting upwards
const bits: number[] = []
let upward = true
for (let c = qrW - 1; c >= 0; c--) {
  for (let k = 0; k < qrH; k++) {
    const r = upward ? qrH - 1 - k : k
    if (reserved(r, c)) continue
    const raw = grid[r][c] === " " ? 0 : 1
    const mask = (qrH - 1 - r + qrW - 1 - c) % 2 === 0 ? 1 : 0
    bits.push(raw ^ mask)
  }
  upward = !upward
}

const readBits = (pos: number, n: number): number => {
  let v = 0
  for (let i = 0; i < n; i++) v = (v << 1) | (bits[pos + i] ?? 0)
  return v
}

const bom = readBits(0, 8)
const key = bom & 0x80 ? 0 : bom & 0x7f
let message = ""
for (let pos = 8; pos + 7 <= bits.length; pos += 7) {
  const ch = readBits(pos, 7) ^ key
  if (ch === 0) break
  message += String.fromCharCode(ch)
}
console.log(message)
