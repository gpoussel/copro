// 🎮 CodinGame Puzzle - hacking-at-robbercity
// https://www.codingame.com/training/medium/hacking-at-robbercity

// m1 ^ m2 ^ m3 = (M^A) ^ (M^A^B) ^ (M^B) = M
const intercepted = [readline(), readline(), readline()].map(s => s.trim())
let clear = ""
for (let i = 0; i < intercepted[0].length; i += 2) {
  const byte = intercepted.reduce((acc, msg) => acc ^ parseInt(msg.substr(i, 2), 16), 0)
  clear += String.fromCharCode(byte)
}
console.log(clear)
