// 🎮 CodinGame Puzzle - photo-booth-transformation
// https://www.codingame.com/training/medium/photo-booth-transformation

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b

// The transform acts independently on columns and rows: even indices go to the
// first half, odd ones to the second. Its order is the lcm of its cycle lengths.
const order = (size: number) => {
  const target = (i: number) => (i % 2 === 0 ? i / 2 : size / 2 + (i - 1) / 2)
  const seen: boolean[] = new Array(size).fill(false)
  let result = 1
  for (let start = 0; start < size; start++) {
    if (seen[start]) continue
    let len = 0
    for (let i = start; !seen[i]; i = target(i)) {
      seen[i] = true
      len++
    }
    result = lcm(result, len)
  }
  return result
}

const t = parseInt(readline())
for (let i = 0; i < t; i++) {
  const [w, h] = readline().split(" ").map(Number)
  console.log(lcm(order(w), order(h)))
}
