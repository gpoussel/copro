// 🧮 Project Euler - Problem 78

const MODULO = 1_000_000

export function solve() {
  // OEIS A000041
  // a(n) is the number of partitions of n (the partition numbers).
  const partitions = [1]
  let n = 1
  while (true) {
    let k = 1
    let partitionN = 0
    while (true) {
      const pentagonal1 = (k * (3 * k - 1)) / 2
      if (pentagonal1 > n) {
        break
      }
      if (k % 2 === 0) {
        partitionN -= partitions[n - pentagonal1]
      } else {
        partitionN += partitions[n - pentagonal1]
      }
      const pentagonal2 = (k * (3 * k + 1)) / 2
      if (pentagonal2 > n) {
        break
      }
      if (k % 2 === 0) {
        partitionN -= partitions[n - pentagonal2]
      } else {
        partitionN += partitions[n - pentagonal2]
      }
      k++
    }
    partitions.push(partitionN % MODULO)
    if (partitionN % MODULO === 0) {
      return n
    }
    n++
  }
}
