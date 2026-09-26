// 🎮 CodinGame Puzzle - roman-sorting
// https://www.codingame.com/training/medium/roman-sorting

const romanValues = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
const romanSymbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]

function toRoman(value: number): string {
  let result = ""
  for (let i = 0; i < romanValues.length; i++) {
    while (value >= romanValues[i]) {
      result += romanSymbols[i]
      value -= romanValues[i]
    }
  }
  return result
}

const count = parseInt(readline())
const numbers: { value: number; roman: string }[] = []
for (let i = 0; i < count; i++) {
  const value = parseInt(readline())
  numbers.push({ value, roman: toRoman(value) })
}
numbers.sort((a, b) => (a.roman < b.roman ? -1 : a.roman > b.roman ? 1 : 0))
console.log(numbers.map(n => n.value).join(" "))
