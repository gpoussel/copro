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
