// 🎮 CodinGame Puzzle - laser-and-mirrors
// https://www.codingame.com/training/hard/laser-and-mirrors

// Unfold the reflections: the 45° beam travels straight until both coordinates
// are multiples of the sides, i.e. after lcm(U, V) steps. The parity of the
// number of widths/heights crossed tells which corner it ends in.
const [U, V] = readline().split(" ").map(Number)
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const L = (U / gcd(U, V)) * V
const right = (L / V) % 2 === 1
const top = (L / U) % 2 === 1
console.log(`${top ? (right ? "B" : "A") : "C"} ${L}`)
