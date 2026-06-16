// 🎮 CodinGame Puzzle - couples-picture-frame
// https://www.codingame.com/training/easy/couples-picture-frame

const wife: string = readline()
const husband: string = readline()

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const lcm = (wife.length * husband.length) / gcd(wife.length, husband.length)

const lines: string[] = []
lines.push(wife.repeat(lcm / wife.length))
for (let i = 0; i < lcm; i++) {
  const left: string = husband[i % husband.length]
  const right: string = wife[i % wife.length]
  lines.push(left + " ".repeat(lcm - 2) + right)
}
lines.push(husband.repeat(lcm / husband.length))

console.log(lines.join("\n"))
