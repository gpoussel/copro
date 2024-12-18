export function mapBy<T, K>(arr: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of arr) {
    const k = key(item)
    if (!map.has(k)) {
      map.set(k, [])
    }
    map.get(k)!.push(item)
  }
  return map
}

export function count<T>(arr: T[], key: T): number {
  return arr.reduce((acc, item) => acc + (item === key ? 1 : 0), 0)
}

export function countBy<T, K>(arr: T[], key: (item: T) => K): Map<K, number> {
  const map = new Map<K, number>()
  for (const item of arr) {
    const k = key(item)
    if (!map.has(k)) {
      map.set(k, 0)
    }
    map.set(k, map.get(k)! + 1)
  }
  return map
}

export function arrayEquals<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export function swap<K>(array: K[], index1: number, index2: number) {
  const temp = array[index1]
  array[index1] = array[index2]
  array[index2] = temp
}

export function permutations<T>(array: T[]): T[][] {
  const result: T[][] = []
  const sortedCombination = array.slice().sort()
  result.push(sortedCombination.slice())

  while (true) {
    let k = -1
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] < array[i + 1]) {
        k = i
      }
    }
    if (k === -1) {
      break
    }
    let l = -1
    for (let i = k + 1; i < array.length; i++) {
      if (array[k] < array[i]) {
        l = i
      }
    }
    if (l === -1) {
      break
    }
    swap(array, k, l)
    const reversed = array.splice(k + 1).reverse()
    array.push(...reversed)
    result.push(array.slice())
  }

  return result
}

export function intersectionBy<T, V>(a: T[], b: T[], mapper: (k: T) => V): T[] {
  const other = b.map(mapper)
  return a.filter(value => other.includes(mapper(value)))
}

export function differenceBy<T, V>(a: T[], b: T[], mapper: (k: T) => V): T[] {
  const other = b.map(mapper)
  return a.filter(value => !other.includes(mapper(value)))
}

export function range(start: number, end: number, inc = 1) {
  const iterationCount = Math.floor((end - start) / inc)
  return Array.from({ length: iterationCount }, (_, i) => start + i * inc)
}

export function union<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([...a, ...b]))
}