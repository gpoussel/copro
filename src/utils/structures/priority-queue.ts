export class PriorityQueue<T> {
  public static MIN_HEAP_COMPARATOR = (a: number, b: number) => a - b
  public static MAX_HEAP_COMPARATOR = (a: number, b: number) => b - a

  private _heap: Array<T | undefined>
  private _size: number = 0

  public constructor(
    private _priorityFn: (node: T) => number,
    private _comparator: (a: number, b: number) => number
  ) {
    this._heap = new Array<T>(11)
  }

  public add(node: T) {
    let i = this._size
    if (i >= this._heap.length) {
      this.grow()
    }
    this._size = i + 1
    if (i === 0) {
      this._heap[0] = node
    } else {
      this.siftUp(i, node)
    }
  }

  public poll(): T {
    if (this._size === 0) {
      throw new Error("PriorityQueue is empty")
    }
    const newSize = --this._size
    const result = this._heap[0]!
    const tail = this._heap[newSize]!
    this._heap.slice(newSize, 1)
    if (newSize !== 0) {
      this.sink(0, tail)
    }
    return result
  }

  public peek(): T | undefined {
    return this._size === 0 ? undefined : this._heap[0]
  }

  public contains(node: T): boolean {
    return this.indexOf(node) !== -1
  }

  public clear() {
    for (let i = 0; i < this._size; i++) {
      this._heap[i] = undefined
    }
    this._size = 0
  }

  public size(): number {
    return this._size
  }

  public isEmpty(): boolean {
    return this._size === 0
  }

  public toArray(): Array<T> {
    return this._heap.slice(0, this._size).map(node => node!)
  }

  private siftUp(k: number, node: T) {
    const nodePriority = this._priorityFn(node)
    while (k > 0) {
      const parentIndex = (k - 1) >>> 1
      const element = this._heap[parentIndex]!
      const elementPriority = this._priorityFn(element)
      if (this._comparator(nodePriority, elementPriority) >= 0) {
        break
      }
      this._heap[k] = element
      k = parentIndex
    }
    this._heap[k] = node
  }

  private sink(k: number, node: T) {
    const half = this._size >>> 1
    const nodePriority = this._priorityFn(node)
    while (k < half) {
      let childIndex = (k << 1) + 1
      let child = this._heap[childIndex]!
      let childPriority = this._priorityFn(child)
      const rightIndex = childIndex + 1
      const rightElement = this._heap[rightIndex]!
      const rightPriority = this._priorityFn(rightElement)
      if (rightIndex < this._size && this._comparator(childPriority, rightPriority) > 0) {
        childIndex = rightIndex
        child = this._heap[childIndex]!
        childPriority = this._priorityFn(child)
      }
      if (this._comparator(nodePriority, childPriority) <= 0) {
        break
      }
      this._heap[k] = child
      k = childIndex
    }
    this._heap[k] = node
  }

  private grow() {
    const oldCapacity = this._size
    const newCapacity = oldCapacity + (oldCapacity < 64 ? oldCapacity + 2 : oldCapacity >> 1)
    if (!Number.isSafeInteger(newCapacity)) {
      throw new Error("PriorityQueue size is too large")
    }
    this._heap.length = newCapacity
  }

  private indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this._heap[i] === item) {
        return i
      }
    }
    return -1
  }
}
