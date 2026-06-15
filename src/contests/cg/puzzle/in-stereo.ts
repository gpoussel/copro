// 🎮 CodinGame Puzzle - in-stereo
// https://www.codingame.com/

const P: number = parseInt(readline(), 10)
const pattern: string = readline()
const S: number = parseInt(readline(), 10)
const stock: string = readline()
const [H, W] = readline()
  .split(" ")
  .map(x => parseInt(x, 10))

void P
void S
void W

const lines: string[] = []

for (let row = 0; row < H; row++) {
  const depthMap: string = readline()
  const buf: string[] = pattern.split("")
  const stk: string[] = stock.split("")
  let pos = 0
  let depth = 0
  let out = ""

  for (let i = 0; i < depthMap.length; i++) {
    const newDepth = depthMap.charCodeAt(i) - 48
    const change = newDepth - depth
    depth = newDepth

    if (change > 0) {
      // increase depth -> remove characters at current position
      const tail = buf.length - pos
      if (change <= tail) {
        buf.splice(pos, change)
      } else {
        buf.splice(pos, tail)
        buf.splice(0, change - tail)
        pos = 0
      }
    } else if (change < 0) {
      // decrease depth -> add characters from stock at current position
      const add = -change
      const moved: string[] = stk.splice(0, add)
      buf.splice(pos, 0, ...moved)
    }

    pos = pos % buf.length
    out += buf[pos]
    pos = (pos + 1) % buf.length
  }

  lines.push(out)
}

console.log(lines.join("\n"))
