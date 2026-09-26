// 🎮 CodinGame Puzzle - order-of-oopserations
// https://www.codingame.com/training/hard/order-of-oopserations

// Tokenise (a "-" is unary when it starts the expression or follows another
// operator), then fold the binary operators level by level from the highest
// priority (+, /, -, *), always left to right. BigInt with truncated division.

const ooExpr = readline().trim()

type OoTok = bigint | string
const ooToks: OoTok[] = []
{
  let i = 0
  let expectOperand = true
  while (i < ooExpr.length) {
    if (expectOperand) {
      let neg = false
      while (ooExpr[i] === "-") {
        neg = !neg
        i++
      }
      let j = i
      while (j < ooExpr.length && /\d/.test(ooExpr[j])) j++
      const v = BigInt(ooExpr.slice(i, j))
      ooToks.push(neg ? -v : v)
      i = j
      expectOperand = false
    } else {
      ooToks.push(ooExpr[i++])
      expectOperand = true
    }
  }
}

let ooList = ooToks
for (const op of ["+", "/", "-", "*"]) {
  const out: OoTok[] = [ooList[0]]
  for (let k = 1; k < ooList.length; k += 2) {
    const o = ooList[k] as string
    const b = ooList[k + 1] as bigint
    if (o !== op) {
      out.push(o, b)
      continue
    }
    const a = out.pop() as bigint
    out.push(op === "+" ? a + b : op === "/" ? a / b : op === "-" ? a - b : a * b)
  }
  ooList = out
}
console.log(String(ooList[0]))
