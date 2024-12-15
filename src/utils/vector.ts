import { Heading, HEADING_DIRECTIONS } from "./grid.js"

export class Vector2 {
  constructor(
    private _x: number,
    private _y: number
  ) {}

  public get x() {
    return this._x
  }

  public get y() {
    return this._y
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar)
  }

  public add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y)
  }

  public subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y)
  }

  public between(topLeft: Vector2, bottomRight: Vector2): boolean {
    return this.x >= topLeft.x && this.x < bottomRight.x && this.y >= topLeft.y && this.y < bottomRight.y
  }

  public modulo(other: Vector2): Vector2 {
    const targetX = this.x % other.x
    const targetY = this.y % other.y
    return new Vector2(targetX < 0 ? targetX + other.x : targetX, targetY < 0 ? targetY + other.y : targetY)
  }

  public equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y
  }

  public move(direction: Heading, n = 1): Vector2 {
    switch (direction) {
      case "up":
        return this.add(new Vector2(0, -n))
      case "down":
        return this.add(new Vector2(0, n))
      case "left":
        return this.add(new Vector2(-n, 0))
      case "right":
        return this.add(new Vector2(n, 0))
      case "up-right":
        return this.add(new Vector2(n, -n))
      case "down-right":
        return this.add(new Vector2(n, n))
      case "down-left":
        return this.add(new Vector2(-n, n))
      case "up-left":
        return this.add(new Vector2(-n, -n))
    }
  }

  public neighbors(): Vector2[] {
    return HEADING_DIRECTIONS.map(direction => this.move(direction))
  }

  public plusShapeNeighbors(): Vector2[] {
    return [...this.verticalNeighbors(), ...this.horizontalNeighbors()]
  }

  public verticalNeighbors(): Vector2[] {
    return [this.move("up"), this.move("down")]
  }

  public horizontalNeighbors(): Vector2[] {
    return [this.move("left"), this.move("right")]
  }
}

export const VECTOR2_COMPARATOR_YX = (a: Vector2, b: Vector2) => {
  if (a.y === b.y) {
    return a.x - b.x
  }
  return a.y - b.y
}

export const VECTOR2_COMPARATOR_XY = (a: Vector2, b: Vector2) => {
  if (a.x === b.x) {
    return a.y - b.y
  }
  return a.x - b.x
}

export class Vector2Set {
  private _vectors: Vector2[] = []
  constructor(vectors?: Vector2[]) {
    if (vectors) {
      vectors.forEach(vector => this.add(vector))
    }
  }

  public get vectors() {
    return this._vectors
  }

  public get length() {
    return this.vectors.length
  }

  public shift(): Vector2 | undefined {
    return this.vectors.shift()
  }

  public add(vector: Vector2) {
    if (!this.contains(vector)) {
      this.vectors.push(vector)
    }
  }

  public reduce<T>(callback: (acc: T, vector: Vector2) => T, initialValue: T): T {
    return this.vectors.reduce(callback, initialValue)
  }

  public map<T>(callback: (vector: Vector2) => T): T[] {
    return this.vectors.map(callback)
  }

  public contains(vector: Vector2): boolean {
    return this.vectors.some(v => v.equals(vector))
  }

  public doesNotContain(vector: Vector2): boolean {
    return !this.contains(vector)
  }

  public forEach(callback: (vector: Vector2) => void) {
    this.vectors.forEach(callback)
  }
}
