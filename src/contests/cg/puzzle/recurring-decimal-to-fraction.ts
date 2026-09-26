// 🎮 CodinGame Puzzle - recurring-decimal-to-fraction
// https://www.codingame.com/training/medium/recurring-decimal-to-fraction

const [intPart, digits = ""] = readline().trim().split(".")

// Smallest non-repeating prefix p, then smallest period k, such that the rest of the
// digits repeat with period k at least twice (a trailing partial period is allowed)
const isPeriodic = (p: number, k: number) => {
  for (let i = p + k; i < digits.length; i++) if (digits[i] !== digits[i - k]) return false
  return true
}
let prefix = 0
let period = 0
search: for (let p = 0; p < digits.length; p++) {
  for (let k = 1; 2 * k <= digits.length - p; k++) {
    if (isPeriodic(p, k)) {
      prefix = p
      period = k
      break search
    }
  }
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
let numerator: number
let denominator: number
if (period === 0) {
  // No repetition found: plain terminating decimal
  denominator = Math.pow(10, digits.length)
  numerator = Number(intPart) * denominator + Number(digits || "0")
} else {
  // x = I + (A - B) / (10^p * (10^k - 1)), A = first p+k digits, B = first p digits
  denominator = Math.pow(10, prefix) * (Math.pow(10, period) - 1)
  const a = Number(digits.slice(0, prefix + period))
  const b = Number(digits.slice(0, prefix) || "0")
  numerator = Number(intPart) * denominator + a - b
}
const g = gcd(numerator, denominator)
numerator /= g
denominator /= g
console.log(denominator === 1 ? String(numerator) : `${numerator} / ${denominator}`)
