// 🎮 CodinGame Puzzle - button-mash
// https://www.codingame.com/training/easy/button-mash

let n: number = parseInt(readline(), 10)
let steps = 0
while (n > 1) {
  if (n % 2 === 0) {
    n /= 2
  } else {
    // Working backwards: for an odd number, choose to reverse the +1 or -1
    // press so the next halving removes the most trailing ones.
    if (n === 3) {
      n -= 1
    } else if (n % 4 === 1) {
      n -= 1
    } else {
      n += 1
    }
  }
  steps++
}
steps += n // n is now 0 or 1
console.log(steps)
