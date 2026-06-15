// 🎮 CodinGame Puzzle - the-prime-twins---part-one
// https://www.codingame.com/training/easy/the-prime-twins---part-one

const n: number = parseInt(readline(), 10)

const isPrime = (x: number): boolean => {
  if (x < 2) return false
  if (x < 4) return true
  if (x % 2 === 0) return false
  for (let i = 3; i * i <= x; i += 2) {
    if (x % i === 0) return false
  }
  return true
}

let a: number = n + 1
while (!(isPrime(a) && isPrime(a + 2))) {
  a++
}

console.log(`${a} ${a + 2}`)
