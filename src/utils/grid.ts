export function build<K>(grid: K[][], printer?: (item: K) => string) {
  const print = printer || ((item: K) => `${item}`)
  return grid.map(row => row.map(print).join("")).join("\n")
}

export type Direction = "up" | "down" | "left" | "right"

export const DIRECTIONS = ["up", "right", "down", "left"] as const
export const VISITED = "~"
export const DIRECTION_CHARS = {
  up: "^",
  down: "v",
  left: "<",
  right: ">",
} as const
export function fromDirectionChar(char: string) {
  return Object.entries(DIRECTION_CHARS).find(([, value]) => value === char)?.[0] as Direction
}

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

export function find<K>(grid: K[][], predicate: (item: K) => boolean) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (predicate(grid[y][x])) {
        return { x, y }
      }
    }
  }
}

export function at<K>(grid: K[][], position: { x: number; y: number }) {
  return grid[position.y]?.[position.x]
}

export function set<K>(grid: K[][], position: { x: number; y: number }, value: K) {
  if (inBounds(grid, position)) {
    grid[position.y][position.x] = value
  }
}

export function countBy(grid: string[][], predicate: (item: string) => boolean) {
  return grid.flat().filter(predicate).length
}

export function inBounds<K>(grid: K[][], position: { x: number; y: number }) {
  return position.y >= 0 && position.y < grid.length && position.x >= 0 && position.x < grid[position.y].length
}

export function clone<K>(grid: K[][]) {
  return grid.map(row => [...row])
}

export function uniqueElements<K>(grid: K[][]) {
  return [...new Set<K>(iterate(grid, item => item))]
}
