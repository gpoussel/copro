import chalk from "chalk"
import contests from "./contests"

function printFirstArgumentError(contestIdentifier?: string) {
  console.error(chalk.red("You have to specify a valid contest as first argument"))
  if (contestIdentifier) {
    console.error(`"${contestIdentifier}" is not a valid contest`)
  }
  const validContests = Object.keys(contests)
    .map(n => `"${n}"`)
    .join(", ")
  console.error(`Valid contests are: ${validContests}`)
}

async function run(args: string[]) {
  if (args.length === 0) {
    printFirstArgumentError()
    return
  }
  const contestIdentifier = args[0]
  if (!(contestIdentifier in contests)) {
    printFirstArgumentError(contestIdentifier)
    return
  }

  const contest = contests[contestIdentifier as keyof typeof contests]
  console.log(`🚀 Contest: ${chalk.cyan(contest.name)}`)

  try {
    await contest.run(args.slice(1))
  } catch (err) {
    if (typeof err === "string") {
      console.error(chalk.red(err))
    } else if (err && typeof err === "object" && "message" in err) {
      console.error(chalk.red(err.message))
    }
  }
}

const args = process.argv.slice(2)
run(args)
