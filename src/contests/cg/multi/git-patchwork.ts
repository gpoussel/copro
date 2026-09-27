// 🎮 CodinGame Multiplayer - git-patchwork
// https://www.codingame.com/multiplayer/bot-programming/git-patchwork
//
// Patchwork on a 9×9 quilt: each empty square costs 2 points at the end,
// buttons count, SKIP moves our time token just past the opponent's and pays
// 1 button per space. League 1: no rotation, no income, first 3 patches
// playable. Value of a patch = 2·squares − price − time (a time space is
// worth a button, as a SKIP shows); play the best one, placed where its
// squares touch the most filled cells / borders, if it beats skipping.

// Init: 4 lines (the event lists are sent even when empty).
readline() // income event count
readline() // income event times
readline() // patch event count
readline() // patch event times

const readBoard = () => {
  const b: string[] = []
  for (let i = 0; i < 9; i++) b.push(readline().trim())
  return b
}

while (true) {
  const [myButtons, myTime] = readline().split(" ").map(Number)
  const board = readBoard()
  readline() // opponent buttons, time, earning
  readBoard()
  const count = parseInt(readline())
  const patches: { id: number; price: number; time: number; cells: [number, number][]; w: number; h: number }[] = []
  for (let i = 0; i < count; i++) {
    const p = readline().trim().split(" ")
    const rows = p[4].split("|")
    const cells: [number, number][] = []
    rows.forEach((r, y) => [...r].forEach((ch, x) => ch === "O" && cells.push([x, y])))
    patches.push({ id: +p[0], price: +p[2], time: +p[3], cells, w: rows[0].length, h: rows.length })
  }
  readline() // special patch id
  const moves = parseInt(readline())
  for (let i = 0; i < moves; i++) readline()

  const filled = (x: number, y: number) => x < 0 || y < 0 || x >= 9 || y >= 9 || board[y][x] === "O"
  let best = "SKIP"
  let bestValue = 0
  const timeLeft = 19 - myTime
  for (const p of patches.slice(0, 3)) {
    if (p.price > myButtons) continue
    // Time spent past the end of the timeline is free.
    const value = 2 * p.cells.length - p.price - Math.min(p.time, timeLeft)
    let bestFit = -1
    let fit = ""
    for (let y = 0; y + p.h <= 9; y++)
      for (let x = 0; x + p.w <= 9; x++) {
        if (p.cells.some(([cx, cy]) => filled(x + cx, y + cy))) continue
        let touch = 0
        for (const [cx, cy] of p.cells)
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const nx = x + cx + dx
            const ny = y + cy + dy
            const inside = p.cells.some(([ox, oy]) => x + ox === nx && y + oy === ny)
            if (!inside && filled(nx, ny)) touch++
          }
        if (touch > bestFit) {
          bestFit = touch
          fit = `PLAY ${p.id} ${x} ${y}`
        }
      }
    if (fit && value > bestValue) {
      bestValue = value
      best = fit
    }
  }
  console.log(best)
}
