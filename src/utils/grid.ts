export function build<K>(grid: K[][], printer?: (item: K) => string) {
  const print = printer || ((item: K) => `${item}`)
  return grid.map(row => row.map(print).join("")).join("\n")
}

export type Direction = "up" | "down" | "left" | "right"

export const DIRECTIONS = ["up", "down", "left", "right"] as const
export const VISITED = "~" as const

export function iterate<K, V>(
  grid: K[][],
  callback: (item: K, x: number, y: number) => V,
  filter?: (item: K) => boolean
) {
  const result: V[] = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (filter && !filter(grid[y][x])) {
        continue
      }
      result.push(callback(grid[y][x], x, y))
    }
  }
  return result
}

export function at<K>(grid: K[][], position: { x: number; y: number }) {
  return grid[position.y]?.[position.x]
}

export function inBounds<K>(grid: K[][], position: { x: number; y: number }) {
  return position.y >= 0 && position.y < grid.length && position.x >= 0 && position.x < grid[position.y].length
}

export function clone<K>(grid: K[][]) {
  return grid.map(row => [...row])
}
