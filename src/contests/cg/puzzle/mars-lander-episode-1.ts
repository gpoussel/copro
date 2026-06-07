// 🎮 CodinGame Puzzle - mars-lander-episode-1
// https://www.codingame.com/training/easy/mars-lander-episode-1

// Read initialization data: surface points
const surfaceN: number = parseInt(readline())
for (let i = 0; i < surfaceN; i++) {
  // Read and discard surface points (not needed for episode 1)
  readline()
}

// Game loop
while (true) {
  const line = readline().split(" ")
  const X: number = parseInt(line[0])
  const Y: number = parseInt(line[1])
  const hSpeed: number = parseInt(line[2])
  const vSpeed: number = parseInt(line[3])
  const fuel: number = parseInt(line[4])
  const rotate: number = parseInt(line[5])
  const power: number = parseInt(line[6])

  // For episode 1:
  // - The landing zone is directly below, rotation stays at 0
  // - Control only thrust power
  // - If falling too fast (vSpeed <= -40), thrust at 4 to slow down
  // - Otherwise, let gravity do its work (thrust 0) or hold steady
  //
  // vSpeed is negative when falling down.
  // Landing requires |vSpeed| <= 40, so we must keep vSpeed >= -40.

  let thrust: number
  if (vSpeed <= -40) {
    // Falling too fast: apply maximum thrust to slow descent
    thrust = 4
  } else {
    // Speed is acceptable: no thrust, let it fall
    thrust = 0
  }

  console.log(`0 ${thrust}`)
}
