// 🎮 CodinGame Puzzle - mandelbrot-set-approximation
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const cols: number = (3 * (n - 1)) / 2 + 1
const step: number = 2 / (n - 1)

for (let row = 0; row < n; row++) {
  const y: number = -1 + row * step
  let line: string = ""
  for (let col = 0; col < cols; col++) {
    const cx: number = -2 + col * step
    let zx: number = 0
    let zy: number = 0
    for (let i = 0; i < 10; i++) {
      const nx: number = zx * zx - zy * zy + cx
      const ny: number = 2 * zx * zy + y
      zx = nx
      zy = ny
    }
    line += Math.sqrt(zx * zx + zy * zy) <= 1 ? "*" : " "
  }
  console.log(line)
}
