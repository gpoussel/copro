import { resolve } from "node:path"
import chalk from "chalk"
import pg from "pg"
import { Contest } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"
import { exists } from "fs-extra"
import { readFile } from "node:fs/promises"

const { Client } = pg
const DATABASE_NAME = "advent_of_sql"

function parseArguments(args: string[]): { year: number; day: number } {
  if (args.length === 2) {
    return { year: parseInt(args[0], 10), day: parseInt(args[1], 10) }
  }
  console.error(chalk.red(`Invalid number of arguments (expected 2, got ${args.length})`))
  throw new Error()
}

function createClient(databaseName?: string) {
  return new Client({
    host: process.env.PG_HOSTNAME,
    port: +(process.env.PG_PORT || 5432),
    user: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: databaseName,
  })
}

async function createDatabaseIfNotExist() {
  const client = createClient()
  await client.connect()
  const databasesResult = await client.query("SELECT datname FROM pg_database")
  const databaseNames = databasesResult.rows.map(row => row.datname)
  if (!databaseNames.includes(DATABASE_NAME)) {
    await client.query(`CREATE DATABASE ${DATABASE_NAME}`)
  }
  await client.end()
}

async function run(args: string[]) {
  const { year, day } = parseArguments(args)
  if (day < 0 || day > 24) {
    console.error(chalk.red(`Invalid day "${day}" (shall be between 1 and 24)`))
    return
  }
  console.log(`📆 Year ${chalk.cyan(year)} - Day ${chalk.cyan(day)}`)
  console.log(`🌍 https://adventofsql.com/challenges/${day}`)

  const { dayFolder } = await writeTemplateIfNecessary(year, day)

  await createDatabaseIfNotExist()
  const client = createClient(DATABASE_NAME)

  try {
    await client.connect()

    const sqlInitializationFile = resolve(dayFolder, `advent_of_sql_day_${day}.sql`)
    const sqlInitializationFileExist = await exists(sqlInitializationFile)
    if (!sqlInitializationFileExist) {
      console.log(`📄 Input Data: https://adventofsql.com/challenges/${day}/data`)
      console.log(`  to be saved in ${sqlInitializationFile}`)
    } else {
      const sqlInitializationScript = await readFile(sqlInitializationFile, "utf-8")
      console.log()
      console.log(`⚙️ Running initialization script...`)
      await client.query(sqlInitializationScript)
      const sqlSolutionFile = resolve(dayFolder, `solution.sql`)
      console.log()
      console.log(`⚙️ Running solution command...`)
      const sqlSolutionScript = await readFile(sqlSolutionFile, "utf-8")
      const res = await client.query(sqlSolutionScript)
      if (res.rows.length > 0) {
        const fieldNames = Object.keys(res.rows[0])
        for (const row of res.rows) {
          console.log(fieldNames.map(fieldName => row[fieldName]).join(","))
        }
      } else {
        console.error(chalk.red(`  ${chalk.bold("X")} No response`))
      }
    }
  } finally {
    await client.end()
  }
}

export default {
  name: "Advent of Code",
  run,
} as Contest
