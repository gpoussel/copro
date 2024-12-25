interface RingBufferNode<V> {
  value: V
  next: RingBufferNode<V>
  previous: RingBufferNode<V>
}

export class RingBuffer<V> {
  private head: RingBufferNode<V> | undefined
  private size: number = 0

  public constructor() {}

  public push(value: V): void {
    if (this.head) {
      const nodeAfter = this.head.next
      const nodeBefore = this.head
      const node = { value, previous: nodeBefore, next: nodeAfter }
      nodeBefore.next = node
      nodeAfter.previous = node
      this.head = node
    } else {
      let node: Partial<RingBufferNode<V>> = { value, next: undefined, previous: undefined }
      node.next = node as RingBufferNode<V>
      node.previous = node as RingBufferNode<V>
      this.head = node as RingBufferNode<V>
    }
    this.size++
  }

  public remove(): V | undefined {
    if (this.size === 0) {
      return
    }
    const value = this.head!.value
    if (this.size === 1) {
      this.head = undefined
    } else {
      const nodeBefore = this.head!.previous
      const nodeAfter = this.head!.next
      nodeBefore.next = nodeAfter
      nodeAfter.previous = nodeBefore
      this.head = nodeAfter
    }
    this.size--
    return value
  }

  public collect(): V[] {
    const values: V[] = []
    let node = this.head
    for (let i = 0; i < this.size; i++) {
      values.push(node!.value)
      node = node!.next
    }
    return values
  }

  public rotate(amount: number): void {
    if (amount === 0) {
      return
    }
    if (amount > 0) {
      for (let i = 0; i < amount; i++) {
        this.head = this.head!.next
      }
    } else {
      for (let i = 0; i < -amount; i++) {
        this.head = this.head!.previous
      }
    }
  }

  public get length(): number {
    return this.size
  }
}
