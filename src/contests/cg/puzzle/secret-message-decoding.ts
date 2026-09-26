// 🎮 CodinGame Puzzle - secret-message-decoding
// https://www.codingame.com/training/hard/secret-message-decoding

// Gauss-Jordan elimination over GF(127) on the [header | payload] rows until
// the header becomes the identity; the payload rows are then the original parts.

const P = 127
const hs = Number(readline())
const ms = Number(readline())
const rows: number[][] = []
for (let i = 0; i < hs; i++) {
  const line = readline()
  rows.push([...line.slice(0, hs + ms)].map(c => c.charCodeAt(0) % P))
}

const power = (b: number, e: number): number => {
  let r = 1
  b %= P
  while (e > 0) {
    if (e & 1) r = (r * b) % P
    b = (b * b) % P
    e >>= 1
  }
  return r
}
const inverse = (a: number) => power(a, P - 2)

for (let col = 0; col < hs; col++) {
  const pivot = rows.findIndex((r, i) => i >= col && r[col] !== 0)
  ;[rows[col], rows[pivot]] = [rows[pivot], rows[col]]
  const inv = inverse(rows[col][col])
  rows[col] = rows[col].map(v => (v * inv) % P)
  for (let i = 0; i < hs; i++) {
    if (i === col || rows[i][col] === 0) continue
    const f = rows[i][col]
    rows[i] = rows[i].map((v, j) => (((v - f * rows[col][j]) % P) + P) % P)
  }
}

console.log(rows.map(r => String.fromCharCode(...r.slice(hs))).join(""))
