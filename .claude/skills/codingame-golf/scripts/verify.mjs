#!/usr/bin/env node
// Verify a CodinGame "Shortest" candidate and report its byte count.
//
// Usage:
//   node verify.mjs <solution.ts> <input.txt> [expected.txt]
//
// Two checks, because CodinGame does BOTH to your code:
//   1. TYPE-CHECK — CodinGame compiles your TypeScript and rejects type errors
//      (undeclared variables, bad overloads, etc.). This step prepends the
//      CodinGame globals as `declare`s and runs the project's `tsc --noEmit`.
//      The node runtime alone does NOT catch these, so this gate matters.
//   2. RUNTIME — shims readline/print/printErr, runs the solution with `node`
//      (feeding <input.txt> line by line) and compares stdout to [expected.txt].
//
// Output (on stderr, so it never pollutes captured program output):
//   BYTES: <n>           UTF-8 byte count = the golf score
//   TYPECHECK ✅/❌       does it compile under tsc (skipped if typescript absent)
//   OUTPUT: ...          what the program produced at runtime
//   MATCH ✅ / MISMATCH ❌ when an expected-output file is given
// Exit code: 0 all good, 1 run error, 2 output mismatch, 3 type-check failure.
//
// Writes only to the OS temp dir — never into the repo.

import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const [, , solPath, inPath, expPath] = process.argv
if (!solPath) {
  console.error('Usage: node verify.mjs <solution.ts> <input.txt> [expected.txt]')
  process.exit(1)
}

const code = readFileSync(solPath, 'utf8')
const bytes = Buffer.byteLength(code, 'utf8')
process.stderr.write(`BYTES: ${bytes}\n`)

// ---- 1. Type-check (mimics CodinGame's TS compiler) --------------------------
// CodinGame's TypeScript environment provides `readline()` as an ambient global
// and `console` (Node-style typings — NOT the DOM lib, so there is no zero-arg
// `window.print`). It does NOT provide `print`/`printErr` (those exist only in
// the legacy JavaScript runtime), so output must use `console.log`. We declare
// exactly that surface and compile with `--lib esnext` (no dom), so `print(...)`
// fails with the same "Cannot find name 'print'" CodinGame reports. These lines
// are NOT part of your score.
const CG_DECL =
  'declare function readline():string;' +
  'declare var console:{log(...a:any[]):void;error(...a:any[]):void;};\n'

let typecheckFailed = false
let tscBin
try {
  tscBin = require.resolve('typescript/bin/tsc')
} catch {
  process.stderr.write('TYPECHECK SKIPPED (typescript not installed — cannot confirm it compiles)\n')
}
if (tscBin) {
  const tcFile = join(tmpdir(), `cg-tc-${process.pid}.ts`)
  writeFileSync(tcFile, CG_DECL + code)
  try {
    // esnext target so modern syntax (**, spread, optional chaining…) isn't
    // flagged just because of an old default target. Non-strict by default —
    // CodinGame is not known to enable strict, and we don't want false rejects.
    execFileSync(
      process.execPath,
      [tscBin, '--noEmit', '--target', 'esnext', '--lib', 'esnext', '--skipLibCheck', tcFile],
      { encoding: 'utf8' },
    )
    process.stderr.write('TYPECHECK ✅\n')
  } catch (e) {
    typecheckFailed = true
    const diag = `${e.stdout || ''}${e.stderr || ''}`.replace(new RegExp(tcFile.replace(/[.\\]/g, '\\$&'), 'g'), 'solution.ts')
    process.stderr.write(`TYPECHECK ❌ (CodinGame will reject this)\n${diag}\n`)
  } finally {
    rmSync(tcFile, { force: true })
  }
}

// ---- 2. Runtime: shim the CodinGame globals and run the solution -------------
const input = inPath ? readFileSync(inPath, 'utf8') : ''
const lines = input.replace(/\r/g, '').split('\n')
// Drop one trailing empty line from the conventional final newline — CodinGame
// feeds exactly the real lines, with no phantom blank line at the end.
if (lines.length && lines[lines.length - 1] === '') lines.pop()

// Node strips types without checking them, so the solution's free identifiers
// resolve against globalThis at runtime — matching how CodinGame runs it.
// The user code is wrapped in try/finally so that an infinite `for(;;)` game loop
// (the CodinGame norm) still flushes its output: when input runs out, readline()
// returns undefined, the next parse throws, we note it, and the finally flushes
// everything captured so far. `for(;readline();)`-style loops just end cleanly.
const harness =
  `globalThis.__l=${JSON.stringify(lines)};globalThis.__i=0;` +
  `globalThis.readline=()=>globalThis.__l[globalThis.__i++];` +
  `globalThis.__o=[];` +
  `globalThis.print=(...a)=>globalThis.__o.push(a.map(String).join(' '));` +
  `globalThis.printErr=(...a)=>process.stderr.write(a.map(String).join(' ')+'\\n');` +
  `console.log=globalThis.print;console.error=globalThis.printErr;\n` +
  `try{\n${code}\n}catch(e){process.stderr.write('NOTE: execution stopped (expected at end of input for game loops): '+(e&&e.message||e)+'\\n')}` +
  `finally{process.stdout.write(globalThis.__o.join('\\n'))}`

const runFile = join(tmpdir(), `cg-golf-${process.pid}.ts`)
writeFileSync(runFile, harness)

let actual = ''
try {
  actual = execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', runFile], {
    encoding: 'utf8',
  })
} catch (e) {
  process.stderr.write(`RUN ERROR:\n${e.stderr || e.message}\n`)
  rmSync(runFile, { force: true })
  process.exit(1)
} finally {
  rmSync(runFile, { force: true })
}

process.stderr.write(`OUTPUT:\n${actual}\n`)

let exitCode = typecheckFailed ? 3 : 0
if (expPath) {
  const norm = (s) => s.replace(/\r/g, '').replace(/[ \t]+$/gm, '').replace(/\s+$/, '')
  const exp = norm(readFileSync(expPath, 'utf8'))
  const got = norm(actual)
  if (got === exp) {
    process.stderr.write('MATCH ✅\n')
  } else {
    process.stderr.write(`MISMATCH ❌\nEXPECTED:\n${exp}\n`)
    exitCode = 2
  }
}
process.exit(exitCode)
