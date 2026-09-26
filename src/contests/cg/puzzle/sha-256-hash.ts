// 🎮 CodinGame Puzzle - sha-256-hash
// https://www.codingame.com/training/hard/sha-256-hash

// Plain SHA-256 on 32-bit unsigned arithmetic, with custom initial hash
// values. Round constants are the first 32 bits of the fractional parts of
// the cube roots of the first 64 primes.
const message = readline() ?? ""

const K: number[] = []
for (let n = 2; K.length < 64; n++) {
  let prime = true
  for (let d = 2; d * d <= n; d++) if (n % d === 0) prime = false
  if (!prime) continue
  const c = Math.cbrt(n)
  K.push(Math.floor((c - Math.floor(c)) * 2 ** 32) >>> 0)
}
const H = [0xcbbb9d5d, 0x629a292a, 0x9159015a, 0x152fecd8, 0x67332667, 0x8eb44a87, 0xdb0c2e0d, 0x47b5481d]

// padding: 0x80, zeros, 64-bit big-endian length in bits
const bytes: number[] = []
for (let i = 0; i < message.length; i++) bytes.push(message.charCodeAt(i) & 0xff)
const bitLen = bytes.length * 8
bytes.push(0x80)
while (bytes.length % 64 !== 56) bytes.push(0)
for (let i = 7; i >= 0; i--) bytes.push(Math.floor(bitLen / 2 ** (8 * i)) & 0xff)

const rotr = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0
for (let off = 0; off < bytes.length; off += 64) {
  const w = new Array<number>(64).fill(0)
  for (let i = 0; i < 16; i++)
    w[i] =
      ((bytes[off + 4 * i] << 24) |
        (bytes[off + 4 * i + 1] << 16) |
        (bytes[off + 4 * i + 2] << 8) |
        bytes[off + 4 * i + 3]) >>>
      0
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
    const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
  }
  let [a, b, c, d, e, f, g, h] = H
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
    const ch = (e & f) ^ (~e & g)
    const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0
    const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
    const maj = (a & b) ^ (a & c) ^ (b & c)
    const t2 = (S0 + maj) >>> 0
    h = g
    g = f
    f = e
    e = (d + t1) >>> 0
    d = c
    c = b
    b = a
    a = (t1 + t2) >>> 0
  }
  const vals = [a, b, c, d, e, f, g, h]
  for (let i = 0; i < 8; i++) H[i] = (H[i] + vals[i]) >>> 0
}
console.log(H.map(x => x.toString(16).padStart(8, "0")).join(""))
