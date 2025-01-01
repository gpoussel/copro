import { cubeNumbers } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 62

export function solve() {
  const cubes = cubeNumbers(10000)
  const cubeCounts = new Map<string, { count: number; smallest: number }>()
  for (const cube of cubes) {
    const key = cube.toString().split("").sort().join("")
    if (!cubeCounts.has(key)) {
      cubeCounts.set(key, { count: 0, smallest: cube })
    }
    const newCount = cubeCounts.get(key)!.count + 1
    const smallest = cubeCounts.get(key)!.smallest
    if (newCount === 5) {
      return smallest
    }
    cubeCounts.set(key, { count: newCount, smallest })
  }
  return
}
