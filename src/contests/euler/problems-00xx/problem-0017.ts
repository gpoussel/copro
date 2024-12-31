// 🧮 Project Euler - Problem 17

function num2words(n: number): string {
  if (n === 0) return "zero"
  if (n === 1000) return "one thousand"
  const ones = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
  const teens = ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
  const tens = ["ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  const words = []
  const hundreds = Math.floor(n / 100)
  const tenths = Math.floor((n % 100) / 10)
  const units = n % 10
  if (hundreds > 0) {
    words.push(ones[hundreds - 1] + " hundred")
    if (tenths > 0 || units > 0) {
      words.push("and")
    }
  }
  if (tenths === 1) {
    if (units === 0) {
      words.push(tens[0])
    } else {
      words.push(teens[units - 1])
    }
  } else {
    if (tenths > 0) {
      words.push(tens[tenths - 1])
    }
    if (units > 0) {
      words.push(ones[units - 1])
    }
  }
  return words.join(" ")
}

export function solve() {
  // OEIS A005589
  // Number of letters used to write out the numbers 1 to n in words
  return Array.from({ length: 1000 }, (_, i) => num2words(i + 1).replace(/ /g, "").length).reduce(
    (acc, cur) => acc + cur,
    0
  )
}
