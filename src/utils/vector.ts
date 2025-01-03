import { Direction, Direction3D, Heading, HEADING_DIRECTIONS } from "./grid.js"
import { gcd } from "./math.js"

export interface Equals<T> {
  equals(other: T): boolean
}

export class Vector2 implements Equals<Vector2> {
  constructor(
    private _x: number,
    private _y: number
  ) {}

  static fromCoordinates({ x, y }: { x: number; y: number }): Vector2 {
    return new Vector2(x, y)
  }

  static fromKey(key: string): Vector2 {
    const [x, y] = key.split(",").map(Number)
    return new Vector2(x, y)
  }

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

  public manhattanDistance(other: Vector2): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
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

  public directionTo(other: Vector2): Direction {
    if (this.equals(other)) {
      throw new Error()
    }
    if (this.x === other.x) {
      return this.y < other.y ? "down" : "up"
    } else if (this.y === other.y) {
      return this.x < other.x ? "right" : "left"
    }
    throw new Error()
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

  public range(x: number, y: number): Vector2[] {
    const vectors: Vector2[] = []
    for (let i = 0; i < x; ++i) {
      for (let j = 0; j < y; ++j) {
        vectors.push(this.add(new Vector2(i, j)))
      }
    }
    return vectors
  }

  public str() {
    return `${this.x},${this.y}`
  }

  public compare(other: Vector2): number {
    if (this.y === other.y) {
      return this.x - other.x
    }
    return this.y - other.y
  }

  public angle(other: Vector2): number {
    const angle = Math.atan2(other.x - this.x, this.y - other.y)
    return angle < 0 ? angle + 2 * Math.PI : angle
  }
}

export class Vector3 implements Equals<Vector3> {
  constructor(
    private _x: number,
    private _y: number,
    private _z: number
  ) {}

  public get x() {
    return this._x
  }

  public get y() {
    return this._y
  }

  public get z() {
    return this._z
  }

  public add(other: Vector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  public subtract(other: Vector3): Vector3 {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  public move(direction: Direction3D, n = 1): Vector3 {
    switch (direction) {
      case "up":
        return this.add(new Vector3(0, -n, 0))
      case "down":
        return this.add(new Vector3(0, n, 0))
      case "left":
        return this.add(new Vector3(-n, 0, 0))
      case "right":
        return this.add(new Vector3(n, 0, 0))
      case "forward":
        return this.add(new Vector3(0, 0, n))
      case "backward":
        return this.add(new Vector3(0, 0, -n))
    }
  }

  public manhattanDistance(other: Vector3): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z)
  }

  public equals(other: Vector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  public str() {
    return `${this.x},${this.y},${this.z}`
  }
}

export class Vector4 implements Equals<Vector4> {
  constructor(
    private _x: number,
    private _y: number,
    private _z: number,
    private _t: number
  ) {}

  public get x() {
    return this._x
  }

  public get y() {
    return this._y
  }

  public get z() {
    return this._z
  }

  public get t() {
    return this._t
  }

  public add(other: Vector4): Vector4 {
    return new Vector4(this.x + other.x, this.y + other.y, this.z + other.z, this.t + other.t)
  }

  public subtract(other: Vector4): Vector4 {
    return new Vector4(this.x - other.x, this.y - other.y, this.z - other.z, this.t - other.t)
  }

  public manhattanDistance(other: Vector4): number {
    return (
      Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z) + Math.abs(this.t - other.t)
    )
  }

  public equals(other: Vector4): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z && this.t === other.t
  }

  public str() {
    return `${this.x},${this.y},${this.z},${this.t}`
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

export class VectorSet<V extends Equals<V>> {
  private _vectors: V[] = []
  constructor(vectors?: V[]) {
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

  public shift(): V | undefined {
    return this.vectors.shift()
  }

  public add(vector: V) {
    if (!this.contains(vector)) {
      this.vectors.push(vector)
    }
  }

  public remove(vector: V) {
    const index = this.vectors.findIndex(v => v.equals(vector))
    if (index !== -1) {
      this.vectors.splice(index, 1)
    }
  }

  public reduce<T>(callback: (acc: T, vector: V) => T, initialValue: T): T {
    return this.vectors.reduce(callback, initialValue)
  }

  public map<T>(callback: (vector: V) => T): T[] {
    return this.vectors.map(callback)
  }

  public contains(vector: V): boolean {
    return this.vectors.some(v => v.equals(vector))
  }

  public doesNotContain(vector: V): boolean {
    return !this.contains(vector)
  }

  public forEach(callback: (vector: V) => void) {
    this.vectors.forEach(callback)
  }
}

export function getBoudingBox2(vectors: Vector2[]) {
  const box = vectors.reduce(
    (acc, vector) => ({
      topLeft: new Vector2(Math.min(acc.topLeft.x, vector.x), Math.min(acc.topLeft.y, vector.y)),
      bottomRight: new Vector2(Math.max(acc.bottomRight.x, vector.x), Math.max(acc.bottomRight.y, vector.y)),
    }),
    {
      topLeft: new Vector2(Infinity, Infinity),
      bottomRight: new Vector2(-Infinity, -Infinity),
    }
  )
  const width = box.bottomRight.x - box.topLeft.x + 1
  const height = box.bottomRight.y - box.topLeft.y + 1
  const area = width * height
  return {
    ...box,
    width,
    height,
    area,
  }
}
