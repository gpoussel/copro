export function solveLinearSystem2(matrix: number[][], vector: number[]) {
  const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
  if (det === 0) {
    return undefined
  }
  const x = (vector[0] * matrix[1][1] - vector[1] * matrix[0][1]) / det
  const y = (matrix[0][0] * vector[1] - matrix[1][0] * vector[0]) / det
  return [x, y]
}
