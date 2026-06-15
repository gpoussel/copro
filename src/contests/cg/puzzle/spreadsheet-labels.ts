// 🎮 CodinGame Puzzle - spreadsheet-labels
// https://www.codingame.com/training/hard/spreadsheet-labels

const n: number = parseInt(readline())
const labels: string[] = readline().split(" ")
const out: string[] = []
for (let i = 0; i < n; i++) {
  const lab = labels[i]
  if (/^[0-9]+$/.test(lab)) {
    let num = BigInt(lab)
    let s = ""
    while (num > 0n) {
      num -= 1n
      const r = Number(num % 26n)
      s = String.fromCharCode(65 + r) + s
      num /= 26n
    }
    out.push(s)
  } else {
    let num = 0n
    for (const ch of lab) {
      num = num * 26n + BigInt(ch.charCodeAt(0) - 64)
    }
    out.push(num.toString())
  }
}
console.log(out.join(" "))
