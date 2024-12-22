import chalk from "chalk"

export function logEvery(counter: number, every: number) {
  if (counter > 0 && counter % every === 0) {
    console.log(chalk.gray(` ... iteration = ${counter}`))
  }
}

export function logTextEvery(str: () => string, counter: number, every: number) {
  if (counter % every === 0) {
    console.log(chalk.gray(str()))
  }
}
