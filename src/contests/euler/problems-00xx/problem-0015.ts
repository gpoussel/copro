// 🧮 Project Euler - Problem 15

export function solve() {
  // OEIS A000984
  // The number of lattice paths from (0,0) to (n,n) using steps (1,0) and (0,1)
  const list = [1]
  let b = 1
  for (let n = 0; n < 20; n++) {
    b = (b * (4 * n + 2)) / (n + 1)
    list.push(b)
  }
  return list.pop()
}
