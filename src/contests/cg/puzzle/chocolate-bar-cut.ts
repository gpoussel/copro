// 🎮 CodinGame Puzzle - chocolate-bar-cut
// https://www.codingame.com/

function gcd(a: bigint, b: bigint): bigint {
  while (b > 0n) {
    const t = a % b
    a = b
    b = t
  }
  return a
}

const n: number = parseInt(readline(), 10)
const lines: string[] = []
for (let i = 0; i < n; i++) {
  const [x, y] = readline()
    .split(" ")
    .map((s: string) => BigInt(s))
  lines.push((x + y - gcd(x, y)).toString())
}
console.log(lines.join("\n"))
