// 🎮 CodinGame Puzzle - remainder-fantasy
// https://www.codingame.com/training/medium/remainder-fantasy

// Exact (a * b) mod m for values well below 2^52 (double-and-add)
const mulMod = (a: number, b: number, m: number): number => {
  a %= m
  b %= m
  let result = 0
  while (b > 0) {
    if (b % 2 === 1) result = (result + a) % m
    a = (a * 2) % m
    b = Math.floor(b / 2)
  }
  return result
}

// Returns [g, x] with a*x ≡ g (mod b)
const extGcd = (a: number, b: number): [number, number] => {
  let [oldR, r] = [a, b]
  let [oldS, s] = [1, 0]
  while (r !== 0) {
    const q = Math.floor(oldR / r)
    ;[oldR, r] = [r, oldR - q * r]
    ;[oldS, s] = [s, oldS - q * s]
  }
  return [oldR, oldS]
}

const n = +readline()
let a = 0
let lcm = 1
let maxM = 0
for (let i = 0; i < n; i++) {
  const [m, r0] = readline().split(" ").map(Number)
  const r = r0 % m
  maxM = Math.max(maxM, m)
  // Solve a + t*lcm ≡ r (mod m)
  const [g, inv] = extGcd(lcm % m, m)
  const diff = (((r - a) % m) + m) % m
  const mg = m / g
  const t = mulMod(diff / g, ((inv % mg) + mg) % mg, mg)
  const newLcm = lcm * mg
  a = (a + mulMod(t, lcm, newLcm)) % newLcm
  lcm = newLcm
}

let x = a
while (x < maxM) x += lcm
console.log(x)
