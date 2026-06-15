// 🎮 CodinGame Puzzle - compiler-cg86-easy-version
// https://www.codingame.com/

const tokens: string[] = readline().trim().split(/\s+/)

interface Op {
  op: string
  value: string
  count: number
}

const order: string[] = []
const groups: Map<string, Op> = new Map()

let sign = "+"
for (const token of tokens) {
  if (token === "+" || token === "-") {
    sign = token
    continue
  }
  const op = sign === "-" ? "SUB" : "ADD"
  const key = op + " " + token
  const existing = groups.get(key)
  if (existing) {
    existing.count++
  } else {
    groups.set(key, { op, value: token, count: 1 })
    order.push(key)
  }
  sign = "+"
}

const out: string[] = []
for (const key of order) {
  const group = groups.get(key)!
  if (group.count > 1) {
    out.push("REPEAT " + group.count)
  }
  out.push(group.op + " cgx " + group.value)
}
out.push("EXIT")

console.log(out.join("\n"))
