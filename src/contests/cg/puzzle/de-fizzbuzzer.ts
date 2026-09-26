// 🎮 CodinGame Puzzle - de-fizzbuzzer
// https://www.codingame.com/training/medium/de-fizzbuzzer

const repeat = (s: string, k: number) => new Array(k + 1).join(s)
const countDigit = (x: number, d: string) => String(x).split(d).length - 1
const timesDivisible = (x: number, p: number) => {
  let k = 0
  while (x % p === 0) {
    x /= p
    k++
  }
  return k
}

const fizzBuzz = (x: number) => {
  const fizz = countDigit(x, "3") + timesDivisible(x, 3)
  const buzz = countDigit(x, "5") + timesDivisible(x, 5)
  return fizz + buzz === 0 ? String(x) : repeat("Fizz", fizz) + repeat("Buzz", buzz)
}

// Smallest integer producing each output
const inverse = new Map<string, number>()
for (let x = 1000; x >= 1; x--) inverse.set(fizzBuzz(x), x)

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const s = readline()
  console.log(inverse.has(s) ? inverse.get(s) : "ERROR")
}
