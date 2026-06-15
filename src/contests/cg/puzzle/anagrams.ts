// 🎮 CodinGame Puzzle - anagrams
// https://www.codingame.com/training/medium/anagrams

let phrase: string = readline()

function pos(ch: string): number {
  return ch.charCodeAt(0) - 64 // A=1
}
function indicesOf(s: string, k: number): number[] {
  const idx: number[] = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c >= "A" && c <= "Z" && pos(c) % k === 0) idx.push(i)
  }
  return idx
}
function place(s: string, idx: number[], chars: string[]): string {
  const arr = s.split("")
  for (let i = 0; i < idx.length; i++) arr[idx[i]] = chars[i]
  return arr.join("")
}
// Forward scramble: 1) reverse 2nd-letters, 2) shift 3rd-letters right,
// 3) shift 4th-letters left, 4) reverse word lengths.
// Inverse (applied in reverse order): inv4, inv3 (4th right), inv2 (3rd left), inv1 (2nd reverse).
function invStep4(s: string): string {
  const words = s.split(" ")
  const lens = words.map(w => w.length).reverse()
  const all = words.join("")
  const res: string[] = []
  let p = 0
  for (const L of lens) {
    res.push(all.substring(p, p + L))
    p += L
  }
  return res.join(" ")
}
function shiftRight4(s: string): string {
  const idx = indicesOf(s, 4)
  const chars = idx.map(i => s[i])
  if (chars.length === 0) return s
  const shifted = [chars[chars.length - 1]].concat(chars.slice(0, chars.length - 1))
  return place(s, idx, shifted)
}
function shiftLeft3(s: string): string {
  const idx = indicesOf(s, 3)
  const chars = idx.map(i => s[i])
  if (chars.length === 0) return s
  const shifted = chars.slice(1).concat(chars[0])
  return place(s, idx, shifted)
}
function reverse2(s: string): string {
  const idx = indicesOf(s, 2)
  const chars = idx.map(i => s[i]).reverse()
  return place(s, idx, chars)
}

phrase = invStep4(phrase)
phrase = shiftRight4(phrase)
phrase = shiftLeft3(phrase)
phrase = reverse2(phrase)
console.log(phrase)
