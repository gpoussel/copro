// @ts-nocheck
// 🎮 CodinGame Puzzle - die-handedness
// https://www.codingame.com/training/easy/die-handedness

// Read the 3-line die net:
//   line1: " T"   (top face, with leading space)
//   line2: "LFRB" (left, front, right, back faces)
//   line3: " B"   (bottom face, with leading space)
//
// Coordinate system:
//   +Z = top, -Z = bottom
//   +X = right, -X = left
//   +Y = front, -Y = back
//
// We find where faces 1, 2, 3 are located, get their outward normals,
// then check if 1→2→3 is counterclockwise (right-handed) or clockwise (left-handed)
// around their shared vertex, by checking the sign of the scalar triple product
// normal(1) · (normal(2) × normal(3)).
//
// A right-handed die: 1,2,3 counterclockwise → triple product is negative
// (the outward normals of the three faces at a vertex form a left-handed triple).

const line1 = readline();
const line2 = readline();
const line3 = readline();

const top = parseInt(line1[1]);
const left = parseInt(line2[0]);
const front = parseInt(line2[1]);
const right = parseInt(line2[2]);
const back = parseInt(line2[3]);
const bottom = parseInt(line3[1]);

// Check opposite sides add to 7
const isDegenerate =
  top + bottom !== 7 || left + right !== 7 || front + back !== 7;

if (isDegenerate) {
  console.log("degenerate");
} else {
  // Assign outward normal vectors to each face value
  // +Z=top, -Z=bottom, -X=left, +Y=front, +X=right, -Y=back
  const normals: Record<number, [number, number, number]> = {
    [top]:    [ 0,  0,  1],  // +Z
    [bottom]: [ 0,  0, -1],  // -Z
    [left]:   [-1,  0,  0],  // -X
    [right]:  [ 1,  0,  0],  // +X
    [front]:  [ 0,  1,  0],  // +Y
    [back]:   [ 0, -1,  0],  // -Y
  };

  // Scalar triple product: n1 · (n2 × n3)
  // Negative → right-handed, Positive → left-handed
  const n1 = normals[1];
  const n2 = normals[2];
  const n3 = normals[3];

  // Cross product n2 × n3
  const cross: [number, number, number] = [
    n2[1] * n3[2] - n2[2] * n3[1],
    n2[2] * n3[0] - n2[0] * n3[2],
    n2[0] * n3[1] - n2[1] * n3[0],
  ];

  // Dot product n1 · cross
  const triple = n1[0] * cross[0] + n1[1] * cross[1] + n1[2] * cross[2];

  if (triple < 0) {
    console.log("right-handed");
  } else if (triple > 0) {
    console.log("left-handed");
  } else {
    // 1, 2, 3 are coplanar (opposite faces) — shouldn't happen with valid die
    console.log("degenerate");
  }
}
