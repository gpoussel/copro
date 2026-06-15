// 🎮 CodinGame Puzzle - rocky-pohps-concert-date
// https://www.codingame.com/training/easy/rocky-pohps-concert-date

const n: string = readline().trim()

// Given a product P, find the closest factorization a*b (a<=b, |a-b| minimal).
const closestFactor = (p: number): [number, number] => {
  let best: number = 1
  for (let a = Math.floor(Math.sqrt(p)); a >= 1; a--) {
    if (p % a === 0) {
      best = a
      break
    }
  }
  return [best, p / best]
}

// Concatenate the closest factorization of p to check it matches the mysterious number.
// The two valid concatenations of the closest factorization (either order).
const concatFactors = (p: number): [string, string] => {
  const [a, b]: [number, number] = closestFactor(p)
  return [String(a) + String(b), String(b) + String(a)]
}

// Validate that a numeric string represents a valid YYYY-MM-DD date.
const toDate = (s: string): string | null => {
  if (s.length < 5 || s.length > 8) return null
  const padded: string = s.padStart(8, "0")
  const year: string = padded.slice(0, 4)
  const month: string = padded.slice(4, 6)
  const day: string = padded.slice(6, 8)
  const m: number = Number(month)
  const d: number = Number(day)
  if (m < 1 || m > 12) return null
  if (d < 1 || d > 31) return null
  return `${year}-${month}-${day}`
}

let answer: string = ""
// Split n into prefix a and suffix b in every way; b must have no leading zero.
for (let i = 1; i < n.length; i++) {
  const aStr: string = n.slice(0, i)
  const bStr: string = n.slice(i)
  if (bStr[0] === "0") continue
  const a: number = Number(aStr)
  const b: number = Number(bStr)
  const product: number = a * b
  const variants: [string, string] = concatFactors(product)
  if (variants[0] !== n && variants[1] !== n) continue
  const date: string | null = toDate(String(product))
  if (date !== null) {
    answer = date
    break
  }
}

console.log(answer)
