# TypeScript / JavaScript golf tricks for CodinGame

Reference catalogue for byte-shaving. CodinGame scores **UTF-8 bytes**, so every
trick here is about removing real ASCII bytes, never about Unicode substitution.
Apply these during the "golf it down" step, then re-verify — many of these change
behavior in edge cases.

> ⚠️ **CodinGame type-checks your TypeScript.** Generic "JS golf" tricks that rely
> on the loose JavaScript runtime are *rejected by the compiler* even though they
> would run. The recurring ones, called out inline below:
> - **No `print`** — output is `console.log` (`print` is a JS-only global → TS2304).
> - **No tagged-template arguments** — ``split`,` ``, ``join`+` ``, ``repeat`3` ``
>   fail with TS2769; use `split(",")`, `join("+")`, `repeat(3)`.
> - **Declare your variables** (`var`) — undeclared assignment is TS2304.
> - **No invalid `for...of` headers** — `for(a=0,b of s)` is rejected (TS2487);
>   the left side of `of` must be a variable/property access, not a comma expression.
> - **Coerce with *unary* operators only.** `+s`, `~~s`, `+(cond)`, `~x` all compile
>   (unary `+`/`~` accept any operand). But a *binary* arithmetic operator needs a
>   number on each side: `s-0`, `s*1`, `s&1`, `(a>b)-(c>d)`, `(a>b)*1` are all
>   TS2362/2363. Convert first (`+s`), then do math — `+s-1`, not `s-1`.
> - **`readline()` takes no arguments** (`declare function readline():string`), so a
>   direct call with an argument is TS2554 (`Expected 0 arguments, but got 1`). Folds
>   that stuff work into a readline arg (`readline(a=0)`) or nest reads to consume
>   several lines at once (`readline(readline())`) do **not** compile — read each line
>   with a bare `readline()`. (Passing `readline` as a *callback*, `.map(readline)`, is
>   fine; see §1.)
>
> The tips below were checked against CodinGame's compiler settings (`tsc --target
> esnext --lib esnext`, non-strict — implicit `any` is allowed, so untyped arrow
> params and `obj[stringKey]` lookups are fine). When in doubt, run
> `scripts/verify.mjs`: it type-checks *and* runs the code, so it tells you
> immediately whether a trick survives the compiler.

## Table of contents
1. Input / output
2. Numbers & coercion
3. Variables & functions
4. Loops
5. Conditionals & boolean logic
6. Strings
7. Arrays
8. Regex
9. CodinGame-specific gotchas

---

## 1. Input / output

- Output is **`console.log`** — there is no `print` in CodinGame TypeScript. If you
  output many times, `var c=console.log` once, then `c(...)`, amortizes after ~3 calls.
- Alias `readline` if you call it 3+ times: `var r=readline` then `r()`. Below 3
  calls the alias costs more than it saves. (Note the `var` — it must be declared.)
- One token per line: `+readline()` reads a number directly (unary `+` coerces).
- Several tokens on one line: `readline().split(" ")`. Use real call syntax — the
  ``split` ` `` tagged-template form does **not** type-check (TS2769).
  Destructure: `var[a,b,c]=readline().split(" ")`.
- Loop over N lines: `for(n=+readline();n--;)...` consumes the count then iterates
  (declare `n`).
- If the line count is followed by data you read until EOF anyway, you don't need
  the count at all: consume the line into a variable you then *reuse* as the loop
  variable (`var ...,H=R(),T=R();H=R();` — submission-validated, `readline()` is
  falsy at EOF on CodinGame). With no variable to spare, `T=R()&&R()` skips one
  line and keeps the next (any real input line is truthy).
- Read N lines into an array: `[...Array(n)].map(readline)`. Passing `readline`
  directly (not `_=>readline()`) works — `map` calls it with `(value,index,array)`,
  `readline` ignores the extras, and a `()=>string` is assignable where a 3-param
  callback is expected. Same trick for any unary builtin: `.map(Number)`, `.map(eval)`.
  (If you need the numeric values, `.map(_=>+readline())`; but for single-char/digit
  inputs the raw strings often compare correctly as-is — see the loop-as-game note.)
- **Game-loop puzzles** run an infinite `for(;;)` and read a fixed block of input
  each turn (e.g. 8 lines), printing one answer per turn. That `for(;;)` is correct —
  CodinGame ends the process for you. The verifier handles it: it stops the loop when
  the sample input runs out.
- Output many lines at once: build an array and `console.log(a.join("\n"))` — one
  call is cheaper than many.
- `console.log(1,"x",78)` prints `1 x 78` (space-separated), handy to avoid joins.

## 2. Numbers & coercion

- `+s` instead of `parseInt(s)` / `Number(s)`.
- `~~s` converts a string to a truncated int in one go (`~~"4.9"` → 4); use it when
  you'd otherwise write `+s|0`. (`~~` is unary, so it compiles on strings — unlike
  `s-0`/`s*1`.)
- `x|0` or `~~x` for `Math.floor(x)` (positive numbers); both also truncate.
- `a/b|0` for integer division.
- `x**2` for `Math.pow(x,2)`; `x**.5` for `Math.sqrt(x)`.
- `2e3` for `2000`; exponential literals beat trailing zeros.
- `!+s` is true when `s` is `"0"` or empty/NaN-ish — cheap zero test.
- `a<b?a:b` (7 bytes) beats `Math.min(a,b)` (13). Same for max with `>`. For a whole
  array, `Math.min(...a)` / `Math.max(...a)` (spread) is shortest.
- `var M=Math` once, then `M.hypot`, `M.abs`, etc., if you use several Math methods.
- `+(cond)` turns a boolean into 0/1 (unary `+` on a boolean compiles fine);
  `+!0`→1, `+!1`→0.
- **`~NaN` is `-1`** — a free NaN fallback. NaN propagates through `-`/`*`, so
  `~(36-parseInt(c,36))` gives `p-37` for base-36 letters but exactly `-1` when
  `parseInt` returned NaN (punctuation/space) — no `||` and no guard needed.

## 3. Variables & functions

- Single-letter names everywhere. Reuse freed names.
- **Declare with `var`** — undeclared `x=5` is a compile error (TS2304). `var` is the
  shortest declarator and one keyword covers a comma list: `var a,b,c=1,[X,Y]=...`.
  You still don't need `:type` annotations; inference is free.
- JS-only global assignment can look unbeatable (`R=readline,...`) but TypeScript
  rejects it. Count the required `var` before trusting another competitor's byte
  count; many "TypeScript" golf snippets are actually JS snippets that won't compile.
- Arrow functions: `var f=x=>x*2`. No `function`, no `return` for single expressions.
  Untyped params are fine (implicit `any` is allowed): `var f=(a,b)=>a+b`.
- **Default params as free local init** — declare/seed accumulators in the parameter
  list instead of the body: `var f=(n,i=0,s=0)=>{...}`. Saves the separate `var i=0,s=0`.
- **Recurse with a named arrow** — `var f=n=>n<2?n:f(n-1)+f(n-2)` beats a named
  `function` and lets you recurse in a single expression.
- Comma operator to chain statements without braces: `if(c)a++,b--`.
- Stuff initialization into the call arguments of a function that *accepts* that
  argument: `f(a=0)` runs `a=0` for free inside the arg list. ⚠️ **Not `readline`** —
  it is declared zero-arg, so `readline(a=0)` is TS2554. Seed such init in a `for`
  header or `var` list instead.
- Store a repeated method name as a string and index: `c="charCodeAt",s[c](0)`.

## 4. Loops

- `for(;;)` over `while(1)`; both 1 statement but `for` lets you fold init/step in.
- Countdown loops are shortest: `for(i=n;i--;)` runs `i` from `n-1` to `0`.
- Fold the body into the increment via the comma operator:
  `for(i=0;i<n;s+=i++);` — empty body, work done in the `for` header.
- Put the initial `var` declaration in the `for` header when it saves a separator:
  `for(var R=readline,L=+R(),H=+R(),T=R(),r,i;H--;)...` can beat a top-level
  `var ...\nfor(...)...` by one byte.
- Move one-line work into the `for` increment slot when the body can be just the
  read/setup step. Example for per-line rendering:
  `for(var R=readline,L=+R(),H=+R(),T=R(),r,i;H--;console.log(...))r=R()`.
  This saved 2 bytes in an ASCII-art mapping puzzle because it removed the body
  comma before `console.log`.
- `for(x of a)` to iterate values; `for(i in a)` for indices (note: `i` is a string).
- In TypeScript, `for(r=R(),o='',c of T)` is invalid (TS2487). Use a normal body
  init, or avoid `for...of` if the declaration/setup overhead erases the gain.
- `a.map`, `a.reduce`, `a.filter` often beat manual loops when you already have an array.

## 5. Conditionals & boolean logic

- Ternary over `if/else`: `x=c?a:b`.
- Short-circuit instead of `if`: `c&&f()` runs `f()` when `c` truthy; `c||f()` when falsy.
- Default values: `x=read()||d`.
- Chain side effects: `c?(a++,b--):0`.
- `!0` / `!1` for `true` / `false` (2 bytes vs 4/5).
- Assign inside the condition you test: `(b=read())?use(b):0` reads and tests in one.
- Replace nested ternaries with a lookup: `[v0,v1,v2][i]` or `({a:1,b:2})[k]`
  (object-literal-indexed-by-string compiles — implicit `any` is on).

## 6. Strings

- Template literals to interpolate: `` `x=${v}` `` beats `"x="+v`.
- ⚠️ Tagged-template *arguments* (``s.split`,` ``, ``"ab".repeat`3` ``) are a JS golf
  staple but **fail TS type-checking** (TS2769) — use `s.split(",")`, `"ab".repeat(3)`.
- `[...s]` to split a string into characters (beats `s.split("")`).
- `s[i]` for a single char; `s.at(-1)` or `s[s.length-1]` for the last.
- Compare chars directly: `s[3]=="A"`.
- `s.repeat(n)` to build runs; `s.padStart(n,"0")` / `s.padEnd(n)` for fixed-width
  output (e.g. zero-padding numbers) — all shorter than manual loops.
- `"A".charCodeAt(0)` → 65; `String.fromCharCode(n)` reverses it. ⚠️ **Pass the `0`** —
  although the runtime defaults the index to 0, CodinGame's `tsc` lib types
  `charCodeAt(index: number)` with a *required* argument, so a bare `charCodeAt()` is
  rejected with TS2554 (`Expected 1 arguments, but got 0`). Same for `codePointAt(0)`.
- `parseInt(c,36)-10` maps letters to `A/a→0` ... `Z/z→25` compactly. It is good
  when lowercase can appear. If the puzzle also requires a fallback for spaces or
  punctuation (e.g. ASCII-art `?` at index 26), combine with the `~NaN` trick (§2)
  instead of a `>=0?:` guard — see the next bullet. Note the digit caveat below.
- **Fully negative `substr` indexing on fixed-width rows.** When a row is exactly
  `N*L` wide (glyph fonts, fixed-width fields), index every slot from the *end*:
  slot `k` of `N` starts at `(k-N)*L`, and `~(36-parseInt(c,36))*L` gives that for
  base-36 letters (`N=27`) while sending NaN (punctuation/space) to `-L` — the last
  slot — for free, since `~NaN===-1`. Submission-validated at **111 B** on ASCII Art:
  `for(var I=readline,L=+I(),H=I(),T=I();H=I();)console.log(T.replace(/./g,c=>H.substr(~(36-parseInt(c,36))*L,L)))`
  Facts confirmed by that accepted submission: CodinGame serves the font rows at
  exactly 27·L columns *including trailing spaces* (negative starts for every letter
  land correctly); the ASCII Art validators contain no digits `1-9` (those would map
  to the `A` glyph here — keep the `>=0?i*L:-L` guard, +12 B, if a puzzle really can
  feed digits); and `readline()` is falsy at EOF, so `for(;H=I();)` row loops work.
  Reuse the variable that consumed a count line you don't need (here `H`) as the
  loop/row variable — it saves declaring an extra name. (The ~104 B "TypeScript"
  leaderboard records assume a looser stub: `print` declared and/or `readline`
  accepting args, or pre-2023 *character* counting — none survives `tsc` here, see
  §9 / the TS2554 note.)
- `c.charCodeAt(0)-65` maps `A→0` compactly when input is guaranteed uppercase
  `A-Z` only. It does not handle lowercase or punctuation unless the statement lets
  you ignore those cases.
- Case test: compare the char code — `s.charCodeAt(0)>96` is true for lowercase
  letters. (The JS `"c"<{}` relational trick does **not** type-check: TS rejects `<`
  between `string` and `{}` with TS2365.)

## 7. Arrays

- `[...Array(n)]` makes an n-length array you can `.map` over (`Array(n)` alone has holes).
- Build an index range: `[...Array(n)].map((_,i)=>i)` or `Array.from({length:n},(_,i)=>i)`.
  The `Array.from` form also takes a mapper, so `Array.from({length:n},(_,i)=>f(i))`
  builds a computed array in one call.
- `Array(n).fill(0)` when you need filled values.
- `a.join("")` joins with no separator; `a.join("+")` builds `"x+y+z"`. (Use call
  syntax, not the ``join`+` `` tagged form — it doesn't type-check.)
- `eval(a.join("+"))` sums an array of numeric strings in very few bytes.
- `a.reduce((p,c)=>p+c)` to fold; `a.sort((x,y)=>x-y)` for numeric sort (the default
  sort is lexicographic — `[10,9].sort()` → `[10,9]`).
- Membership: `~a.indexOf(x)` is truthy when present (avoids `>=0`); `!~a.indexOf(x)`
  tests absence; or `a.includes(x)`.
- Swap without a temp: `[a,b]=[b,a]`.
- Destructure with holes to skip elements: `[a,,c]=arr`.
- Spread to clone/concat: `[...a,...b]`.

## 8. Regex

- `s.match(/\d+/g)` to pull all number runs; combine with `.map(Number)` or `.map(s=>+s)`.
- `s.replace(/x/g,'y')` for bulk replace; the callback form
  `s.replace(/\d/g,d=>...)` transforms matches in place.
- `/x/.test(s)` for a boolean presence check.
- `s.split(/\s+/)` to tokenize on any whitespace robustly.

## 9. CodinGame-specific gotchas

- The judge usually trims trailing whitespace/newline, but **not** internal spacing —
  match the output format exactly (spaces between tokens, capitalization, etc.).
- Some puzzles feed input via several lines with counts; read them in the precise
  order the statement lists, or everything shifts by one.
- `console.log` of an array prints comma-separated without brackets — sometimes that
  is exactly the required format and saves a manual `.join(',')`.
- Floating-point output: if the puzzle wants rounding, `Math.round`, `.toFixed(n)`
  (returns a string), or `+x.toFixed(n)` to drop trailing zeros — pick by spec.
- CodinGame both **type-checks** (rejects compile errors) and **runs** your code, so
  there are two ways to fail. Always run `scripts/verify.mjs` — it does both — before
  reporting a byte count.
