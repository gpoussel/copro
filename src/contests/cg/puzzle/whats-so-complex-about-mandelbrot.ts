// 🎮 CodinGame Puzzle - whats-so-complex-about-mandelbrot
// https://www.codingame.com/training/easy/whats-so-complex-about-mandelbrot

// Parse the complex number string in format "x+yi" or "x-yi"
const cStr = readline()
const m = parseInt(readline())

// Parse complex number: split on + or - (keeping sign), e.g. "4.5+0i" or "-0.65812-0.452i"
// Strategy: find the last + or - that is preceded by a digit (to split real and imaginary parts)
let splitIndex = -1
for (let i = cStr.length - 1; i > 0; i--) {
  const ch = cStr[i]
  if ((ch === "+" || ch === "-") && cStr[i - 1] !== "e" && cStr[i - 1] !== "E") {
    splitIndex = i
    break
  }
}

const realPart = parseFloat(cStr.substring(0, splitIndex))
// Remove trailing 'i' from imaginary part
const imagPart = parseFloat(cStr.substring(splitIndex, cStr.length - 1))

const cr = realPart
const ci = imagPart

// Iterate f(n) = f(n-1)^2 + c, starting from f(0) = 0
// Complex multiplication: (a + bi)^2 = a^2 - b^2 + 2abi
let fr = 0 // real part of f
let fi = 0 // imaginary part of f

let iterations = 0
for (let i = 0; i < m; i++) {
  // f = f^2 + c
  const newFr = fr * fr - fi * fi + cr
  const newFi = 2 * fr * fi + ci
  fr = newFr
  fi = newFi
  iterations++

  // |f|^2 = fr^2 + fi^2; diverges if |f| > 2, i.e. |f|^2 > 4
  if (fr * fr + fi * fi > 4) {
    break
  }
}

console.log(iterations)
