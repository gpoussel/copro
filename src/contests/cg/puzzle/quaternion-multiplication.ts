// 🎮 CodinGame Puzzle - quaternion-multiplication
// https://www.codingame.com/training/medium/quaternion-multiplication

// Quaternion as [real, i, j, k]
type Quat = [number, number, number, number]
const AXES = "ijk"

const parse = (s: string): Quat => {
  const q: Quat = [0, 0, 0, 0]
  const re = /([+-]?)(\d*)([ijk]?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null && m[0] !== "") {
    const coef = (m[1] === "-" ? -1 : 1) * (m[2] === "" ? 1 : parseInt(m[2], 10))
    q[m[3] === "" ? 0 : AXES.indexOf(m[3]) + 1] += coef
  }
  return q
}

const mul = ([a1, b1, c1, d1]: Quat, [a2, b2, c2, d2]: Quat): Quat => [
  a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
  a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
  a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
  a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2,
]

const format = (q: Quat) => {
  let out = ""
  const terms: [number, string][] = [[q[1], "i"], [q[2], "j"], [q[3], "k"], [q[0], ""]]
  for (const [c, axis] of terms) {
    if (c === 0) continue
    const sign = c < 0 ? "-" : out === "" ? "" : "+"
    const abs = Math.abs(c)
    out += sign + (abs === 1 && axis !== "" ? "" : String(abs)) + axis
  }
  return out === "" ? "0" : out
}

const expr = readline().trim()
const factors = expr.slice(1, -1).split(")(").map(parse)
console.log(format(factors.reduce(mul, [1, 0, 0, 0] as Quat)))
