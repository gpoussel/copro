// 🎮 CodinGame Puzzle - fix-the-networks
// https://www.codingame.com/

const m: number = parseInt(readline(), 10)
const out: string[] = []
for (let i = 0; i < m; i++) {
  const line: string = readline()
  const [prefix, suffixStr] = line.split("/")
  const suffix: number = parseInt(suffixStr, 10)
  const octets: number[] = prefix.split(".").map(o => parseInt(o, 10))
  const addr: number = (octets[0] * 16777216 + octets[1] * 65536 + octets[2] * 256 + octets[3]) >>> 0

  // Minimum suffix needed so all variable bits are 0:
  // find position of the lowest set bit.
  let minSuffix: number = 0
  for (let bit = 0; bit < 32; bit++) {
    const mask: number = (0x80000000 >>> bit) >>> 0
    if ((addr & mask) !== 0) {
      minSuffix = bit + 1
    }
  }

  if (suffix >= minSuffix) {
    out.push(`valid ${Math.pow(2, 32 - suffix)}`)
  } else {
    out.push(`invalid ${prefix}/${minSuffix} ${Math.pow(2, 32 - minSuffix)}`)
  }
}
console.log(out.join("\n"))
