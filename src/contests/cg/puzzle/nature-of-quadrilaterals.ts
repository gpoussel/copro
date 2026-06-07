// @ts-nocheck
// 🎮 CodinGame Puzzle - nature-of-quadrilaterals
// https://www.codingame.com/training/easy/nature-of-quadrilaterals

const n = parseInt(readline());

for (let i = 0; i < n; i++) {
  const line = readline().split(' ');
  const nameA = line[0];
  const xA = parseInt(line[1]);
  const yA = parseInt(line[2]);
  const nameB = line[3];
  const xB = parseInt(line[4]);
  const yB = parseInt(line[5]);
  const nameC = line[6];
  const xC = parseInt(line[7]);
  const yC = parseInt(line[8]);
  const nameD = line[9];
  const xD = parseInt(line[10]);
  const yD = parseInt(line[11]);

  const name = nameA + nameB + nameC + nameD;

  // Squared length of a segment
  function sq(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2;
  }

  // Dot product of vectors (p1->p2) and (p3->p4)
  function dot(x1, y1, x2, y2, x3, y3, x4, y4) {
    return (x2 - x1) * (x4 - x3) + (y2 - y1) * (y4 - y3);
  }

  // Cross product of vectors (p1->p2) and (p3->p4)
  function cross(x1, y1, x2, y2, x3, y3, x4, y4) {
    return (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  }

  // Sides: AB, BC, CD, DA
  const sAB = sq(xA, yA, xB, yB);
  const sBC = sq(xB, yB, xC, yC);
  const sCD = sq(xC, yC, xD, yD);
  const sDA = sq(xD, yD, xA, yA);

  // Two pairs of opposite sides: AB||CD and BC||DA
  // Parallel: cross product of direction vectors = 0
  // AB direction: (xB-xA, yB-yA), CD direction: (xD-xC, yD-yC)
  const abParallelCD = cross(xA, yA, xB, yB, xC, yC, xD, yD) === 0;
  // BC direction: (xC-xB, yC-yB), DA direction: (xA-xD, yA-yD)
  const bcParallelDA = cross(xB, yB, xC, yC, xD, yD, xA, yA) === 0;

  const isParallelogram = abParallelCD && bcParallelDA;

  // Rhombus: all four sides equal
  const isRhombus = isParallelogram && sAB === sBC && sBC === sCD && sCD === sDA;

  // Rectangle: all four angles are right
  // Angle at A: vectors AB and AD are perpendicular -> dot(AB, AD) = 0
  // Angle at B: vectors BA and BC are perpendicular -> dot(BA, BC) = 0
  // Angle at C: vectors CB and CD are perpendicular -> dot(CB, CD) = 0
  // Angle at D: vectors DC and DA are perpendicular -> dot(DC, DA) = 0
  const rightA = dot(xA, yA, xB, yB, xA, yA, xD, yD) === 0;
  const rightB = dot(xB, yB, xA, yA, xB, yB, xC, yC) === 0;
  const rightC = dot(xC, yC, xB, yB, xC, yC, xD, yD) === 0;
  const rightD = dot(xD, yD, xC, yC, xD, yD, xA, yA) === 0;

  const isRectangle = isParallelogram && rightA && rightB && rightC && rightD;

  // Square: rectangle AND rhombus
  const isSquare = isRectangle && isRhombus;

  let nature;
  if (isSquare) {
    nature = 'square';
  } else if (isRectangle) {
    nature = 'rectangle';
  } else if (isRhombus) {
    nature = 'rhombus';
  } else if (isParallelogram) {
    nature = 'parallelogram';
  } else {
    nature = 'quadrilateral';
  }

  console.log(`${name} is a ${nature}.`);
}
