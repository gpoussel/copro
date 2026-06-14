const [x, y] = readline().split(" ").map(Number)
let a = Math.max(x, y)
let m = Math.min(x, y)

const lines: string[] = []
lines.push(`${a} * ${m}`)

const acc: number[] = []
while (m > 0) {
  if (m % 2 === 1) {
    m = m - 1
    acc.push(a)
  } else {
    m = m / 2
    a = a * 2
  }
  let line = `= ${a} * ${m}`
  if (acc.length > 0) {
    line += " + " + acc.join(" + ")
  }
  lines.push(line)
}

const total = acc.reduce((s, v) => s + v, 0)
lines.push(`= ${total}`)

console.log(lines.join("\n"))
