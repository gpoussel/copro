---
name: codingame-golf
description: >-
  Implement and byte-minimize a CodinGame puzzle solution in TypeScript for the
  "Shortest" / code-golf objective: produce a complete readline()→print() program
  that still passes the puzzle, using the fewest possible UTF-8 bytes. Use this
  whenever the user wants to code-golf, shorten, or byte-minimize a CodinGame
  solution, asks for the shortest TypeScript/JavaScript program for a puzzle,
  mentions CodinGame "Shortest" mode or fewest bytes/characters, pastes a puzzle
  statement and wants the tiniest possible solution, or wants to shave more bytes
  off an existing golfed solution. Code quality and readability do not matter here
  — only the final byte count, as long as the program is still correct.
---

# CodinGame Code Golf (TypeScript)

The goal of a CodinGame "Shortest" puzzle is brutally simple: write a program
that produces the exact expected output, using as **few bytes of source as
possible**. Nothing else counts — not readability, not idiomatic style, not type
safety. A solution that is one byte shorter and still correct always wins.

This skill is for that game. Treat every byte as expensive and every clever trick
as fair, but never sacrifice correctness: a wrong answer scores zero no matter how
short it is.

## What you're scoring against

- **CodinGame counts BYTES** (UTF-8), not characters — this has been true since
  March 2023. Multi-byte Unicode "minification" tricks therefore do **not** help;
  a `→` costs 3 bytes, not 1. Stick to ASCII and just remove real bytes.
- The judge runs your program and compares stdout to the expected output, usually
  trimming trailing whitespace. Match the output exactly otherwise.

## The CodinGame I/O contract (TypeScript)

The **TypeScript** environment on CodinGame gives you exactly two things, no
imports needed:

- `readline()` → reads and returns the next line of input as a string.
- `console.log(x)` → writes a line of output. `console.error(x)` is debug-only
  (ignored by the judge).

**There is no `print` / `printErr` in CodinGame TypeScript.** Those globals exist
only in the legacy *JavaScript* runtime, so most "JS golf" cheat-sheets recommend
them — but in TypeScript `print(x)` fails to compile with
`error TS2304: Cannot find name 'print'`. Always output with `console.log`. If you
emit many lines, `var c=console.log` once then `c(...)` can pay off.

## CodinGame type-checks your TypeScript — this is the big trap

Unlike a plain JS golf judge, **CodinGame compiles your code with `tsc` and rejects
type errors before it ever runs.** A program that is valid JavaScript can still be
rejected. The two failures this causes constantly:

1. **Undeclared variables** → `error TS2304: Cannot find name 'x'`. The classic JS
   golf move of assigning to an undeclared name (`for(x=0;...)`, `[a,b]=...`) does
   not compile. **Declare with `var`** — it's the shortest declarator and lets you
   share one keyword across a comma list: `var a,b,[X,Y]=...`. (You still don't need
   `:number` type annotations — inference handles those for free.)

2. **Tagged-template-as-argument tricks** → `error TS2769: No overload matches`.
   ``s.split`,` ``, ``a.join`+` ``, ``"x".repeat`3` `` etc. pass a
   `TemplateStringsArray`, which isn't assignable to the `string | RegExp` the
   method expects. They run as JS but **don't type-check**. Use normal call syntax:
   `s.split(",")`, `a.join("+")`.

3. **Calling a zero-arg global with an argument** → `error TS2554: Expected 0
   arguments, but got 1`. `readline` is declared `readline():string`, so folds that
   pass work through a readline arg — `readline(a=0)` (run an assignment for free) or
   `readline(readline())` (nest reads to consume several lines in one expression) —
   are rejected. They run in JS but don't compile, so read each line with a bare
   `readline()`. Passing `readline` *as a callback* (`.map(readline)`) is fine: that's
   parameter assignability, not an over-arity direct call.

The rule of thumb: a byte-saving trick only counts if it both **runs correctly**
AND **type-checks**. The verification step below checks both, so lean on it rather
than guessing what the compiler will accept.

## Workflow

Golfing blind produces short, wrong programs. Work in this order:

1. **Nail the I/O contract first.** Read the statement and write down exactly how
   many lines of input there are, what each line contains (how many tokens, their
   types), and the exact output format. Misreading the input is the #1 cause of
   golfed solutions that fail. If the user pasted the puzzle's "Input"/"Output"
   description block, that is your spec.

2. **Write a correct, plain solution.** Don't golf yet. Get a version that you are
   confident produces the right output. This is your reference.

3. **Verify it** with `scripts/verify.mjs` (see below) against every provided
   example. If no examples were given, construct at least one input yourself from
   the statement and reason carefully about the expected output. A solution you
   can't check is a guess.

4. **Golf it down iteratively.** Apply the transformations in
   `references/golf-tricks.md`. Make a few changes, then re-verify — golfing breaks
   things in surprising ways, and a single misplaced byte can flip correctness.
   Keep going until you can't find another safe byte to remove.

5. **Report** the final code and its byte count (see Reporting).

## Verifying & counting bytes

Use the bundled harness — it does **both** checks CodinGame does:

1. **Type-check** — prepends the CodinGame globals (`readline`, `console`) and runs
   the project's `tsc --noEmit`, reproducing the exact compile errors CodinGame
   would raise (e.g. undeclared names, bad tagged-template overloads). Plain `node`
   strips types without checking them, so this is the only thing that catches type
   errors — never skip it.
2. **Runtime** — shims `readline`/`console.log`, runs the solution with `node`,
   feeds it the input, and compares stdout to the expected output.

```
node .claude/skills/codingame-golf/scripts/verify.mjs <solution.ts> <input.txt> [expected.txt]
```

It writes only to a temp dir, never into the repo. Reports: `BYTES:` (the score),
`TYPECHECK ✅` / `❌`, the captured `OUTPUT:`, and `MATCH ✅` / `MISMATCH ❌`. Exit
codes: 0 all good, 1 run error, 2 output mismatch, **3 type-check failure**. Treat a
type-check failure as a hard fail — CodinGame will reject it no matter how short or
how correct the output. Write the candidate and example I/O to throwaway temp files
(OS temp dir, e.g. `$env:TEMP` — do **not** persist solution files in the repo; the
user does not want them committed).

To just count bytes of a snippet without running it:
`node -e "console.log(Buffer.byteLength(require('fs').readFileSync(0),'utf8'))" < file`

## The golf trick catalogue

`references/golf-tricks.md` is the working reference: I/O shortening, number
coercion, loop/conditional compression, array & string tricks, regex, and
CodinGame-specific gotchas. Consult it during step 4 and re-read it before
declaring a solution final — there is almost always one more byte hiding.

## Reporting

End with the final program in a fenced ```ts block, then state the byte count and
the verification result, e.g.:

> **142 bytes** — TYPECHECK ✅, verified against both examples (MATCH ✅).

If you golfed an existing solution, also show the before/after byte counts and the
delta. If verification wasn't possible (no examples), say so explicitly and explain
how you reasoned about correctness instead of claiming it passed.
