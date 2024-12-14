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

  public modulo(other: Vector2): Vector2 {
    const targetX = this.x % other.x
    const targetY = this.y % other.y
    return new Vector2(targetX < 0 ? targetX + other.x : targetX, targetY < 0 ? targetY + other.y : targetY)
  }
}
