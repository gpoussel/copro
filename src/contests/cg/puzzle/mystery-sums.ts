// 🎮 CodinGame Puzzle - mystery-sums
// https://www.codingame.com/training/hard/mystery-sums

// Backtracking over the "?" digits (no leading zeros on multi-digit numbers),
// evaluating the left-hand side with BigInt once every digit is chosen.
const tokens = readline().trim().split(" ")
const eq = tokens.indexOf("=")
const target = BigInt(tokens[eq + 1])
const lhs = tokens.slice(0, eq)
const op = lhs.length > 1 ? lhs[1] : "+"
const nums = lhs.filter((_, i) => i % 2 === 0).map(s => s.split(""))

// Positions of every "?" as [number index, digit index]
const holes: [number, number][] = []
nums.forEach((d, i) => d.forEach((c, j) => c === "?" && holes.push([i, j])))

const evaluate = (exact: boolean): boolean => {
  let acc = BigInt(nums[0].join(""))
  for (let i = 1; i < nums.length; i++) {
    const v = BigInt(nums[i].join(""))
    if (op === "+") acc += v
    else if (op === "-") acc -= v
    else if (op === "*") acc *= v
    else {
      if (v === 0n || (exact && acc % v !== 0n)) return false
      acc /= v
    }
  }
  return acc === target
}

const search = (k: number, exact: boolean): boolean => {
  if (k === holes.length) return evaluate(exact)
  const [i, j] = holes[k]
  const start = j === 0 && nums[i].length > 1 ? 1 : 0
  for (let d = start; d <= 9; d++) {
    nums[i][j] = String(d)
    if (search(k + 1, exact)) return true
  }
  nums[i][j] = "?"
  return false
}

if (!search(0, true)) search(0, false)
const out = [...tokens]
nums.forEach((d, i) => (out[i * 2] = d.join("")))
console.log(out.join(" "))
