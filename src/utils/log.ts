import chalk from "chalk"

export function logEvery(counter: number, every: number) {
  if (counter % every === 0) {
    console.log(chalk.gray(` ... iteration = ${counter}`))
  }
}
