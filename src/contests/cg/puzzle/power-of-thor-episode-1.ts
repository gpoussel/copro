// 🎮 CodinGame Puzzle - power-of-thor-episode-1
// https://www.codingame.com/training/easy/power-of-thor-episode-1

const [lightX, lightY, initialTX, initialTY] = readline().split(" ").map(Number)

let thorX = initialTX
let thorY = initialTY

while (true) {
  readline()

  let directionY = ""
  let directionX = ""

  if (thorY > lightY) {
    directionY = "N"
    thorY--
  } else if (thorY < lightY) {
    directionY = "S"
    thorY++
  }

  if (thorX > lightX) {
    directionX = "W"
    thorX--
  } else if (thorX < lightX) {
    directionX = "E"
    thorX++
  }

  console.log(directionY + directionX)
}
