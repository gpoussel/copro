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
- **Read N rows into parallel columns with indexed-target destructuring.** When each
  line is `x y` and you want all `x`s in one array and all `y`s in another, assign
  straight into the slots — `for(;i--;)[X[i],Y[i]]=readline().split(" ")` — instead of
  a temp + two `.push`. Destructuring targets can be member expressions, so this needs
  no extra variable. Keep the tokens as **strings**: numeric ops coerce later, and you
  skip `.map(Number)`. Verified at **168 B** on Network Cabling.
- Loop over N lines: `for(n=+readline();n--;)...` consumes the count then iterates
  (declare `n`).
- If the line count is followed by data you read until EOF anyway, you don't need
  the count at all: consume the line into a variable you then *reuse* as the loop
  variable (`var ...,H=R(),T=R();H=R();` — submission-validated, `readline()` is
  falsy at EOF on CodinGame). With no variable to spare, `T=R()&&R()` skips one
  line and keeps the next (any real input line is truthy).
- A parenthesized comma chain is the cheapest multi-skip: `[a,b]=(R(),R(),R()).split(" ")`
  reads line 3 (2 bytes shorter than `R()&&R()&&R()`), and it composes with an alias
  init for free: `L=(R(),R(),Math.log)` skips two lines while aliasing `Math.log`
  (verified locally, Blunder ep. 3).
- Keep the first AND last data line of an EOF loop without an array: capture in the
  increment slot — `for(;k=R();a=a||c,b=b||e)[c,e]=k.split(" ")` (`a,b` freeze after
  the first iteration, `c,e` end on the last; verified locally, Blunder ep. 3).
- Bordered-grid puzzles: spread every line — including the `"L C"` header — into ONE
  flat char array (`g.push(...x)`); the header digits are unreachable junk behind the
  all-`#` border, rows need no separators (wrap-around always lands on a border `#`),
  and the width comes free from the last row via the increment slot
  (`for(...;x=readline();w=x.length)g.push(...x)`). Flat indices also make teleporter
  pairs trivial: `p=g.indexOf(x)+g.lastIndexOf(x)-p` (verified locally, Blunder ep. 1).
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
- **Print every move up front — skip the per-turn read entirely.** When the whole
  move sequence is determined by the init input (move-to-target puzzles like Power
  of Thor ep. 1), don't read the per-turn line at all: compute and `console.log`
  each move in a bare `for(;;)`. The referee consumes one output line per turn and
  kills your process the moment the game is won, so every extra line you flooded
  (even empty ones once aligned) is never read. This deletes both the `readline`
  alias and the per-turn `r()` — worth ~10 B (Power of Thor: 139→129 B, verified
  locally; flood-printing is standard practice on CG solo puzzles). Mind the turn
  budget: emit the *diagonal-first* path (`(d>b?(d--,"N"):d<b?(d++,"S"):"")+(...)`),
  not axis-by-axis — validators allot ~Chebyshev-distance turns. ⚠️ `verify.mjs`
  cannot run such a program (it never reads again, so never unwinds at EOF and
  loops forever): verify a twin with a bounded header (`for(var k=39,...;k--;)` —
  39 ≥ max Chebyshev distance on a 40×18 map; trailing empty lines are trimmed by
  the comparison), then strip the bound and type-check the final form on its own.
- **Merge a counted preamble into the game loop.** When init input is a count plus
  N data lines and then an infinite game loop, don't read the count or write the
  preamble loop at all: let the game loop read every line and branch on a token that
  only one line shape has (`var[f,p,d]=S();d?<game turn>:<store data line>` — data
  lines have 2 tokens, game lines 3, so `d` is undefined exactly on data lines).
  Submission-validated at **134 B** on Don't Panic ep. 1 (killed the whole
  `n=+a[7];for(;n--;)` elevator loop). Only do this when the preamble lines all
  *precede* the first game line, and mind ordering: anything seeded before the loop
  (e.g. the exit position) can be overwritten by preamble lines processed inside it.
- Output many lines at once: build an array and `console.log(a.join("\n"))` — one
  call is cheaper than many.
- `console.log(1,"x",78)` prints `1 x 78` (space-separated), handy to avoid joins.

## 2. Numbers & coercion

- `+s` instead of `parseInt(s)` / `Number(s)`.
- For a whole array, `.map(eval)` (10 B) beats `.map(x=>+x)` (11 B) and
  `.map(Number)` (12 B). It type-checks (`eval` is `(x:string)=>any`, assignable as
  a map callback) and the resulting `any`s allow `d--`/`d>b` freely. Indirect eval
  of a numeric literal just returns the number.
- `~~s` converts a string to a truncated int in one go (`~~"4.9"` → 4); use it when
  you'd otherwise write `+s|0`. (`~~` is unary, so it compiles on strings — unlike
  `s-0`/`s*1`.)
- `x|0` or `~~x` for `Math.floor(x)` (positive numbers); both also truncate.
- `a/b|0` for integer division.
- `x**2` for `Math.pow(x,2)`; `x**.5` for `Math.sqrt(x)`.
- `2e3` for `2000`; exponential literals beat trailing zeros.
- `!+s` is true when `s` is `"0"` or empty/NaN-ish — cheap zero test.
- **Coerce inside the comparator, don't `.map(Number)` the array.** To sort string
  tokens numerically you can't write `a*a-b*b` (binary op on strings → TS2362), but
  coercing each side with unary `+` compiles: `.sort((a,b)=>+a*+a-+b*+b||+b-+a)`.
  This beats mapping first (`.map(Number).sort((a,b)=>a*a-b*b||b-a)`): the inline
  `+`s cost less than a whole `.map(Number)`/`.map(x=>+x)` pass. The array stays
  strings, so finish with a coercion on the pick (next bullet).
- **One leading `+` coerces the result *and* defaults empty input to 0.** `+x[0]`
  on a string array prints the number, and `+""` is `0` — so an empty data line
  (e.g. `N=0` with a blank second line, `"".split(" ")` → `[""]`) yields `0` for
  free, no `||0` needed: `console.log(+readline().split(" ").sort(cmp)[0])`.
  Submission-validated at **81 B** on Temperature (`+a*+a-+b*+b||+b-+a` sorts by
  distance to 0, positive winning ties).
- `a<b?a:b` (7 bytes) beats `Math.min(a,b)` (13). Same for max with `>`. For a whole
  array, `Math.min(...a)` / `Math.max(...a)` (spread) is shortest.
- `var M=Math` once, then `M.hypot`, `M.abs`, etc., if you use several Math methods.
- `+(cond)` turns a boolean into 0/1 (unary `+` on a boolean compiles fine);
  `+!0`→1, `+!1`→0.
- **`~NaN` is `-1`** — a free NaN fallback. NaN propagates through `-`/`*`, so
  `~(36-parseInt(c,36))` gives `p-37` for base-36 letters but exactly `-1` when
  `parseInt` returned NaN (punctuation/space) — no `||` and no guard needed.
- **NaN comparisons are `false` — a free default branch.** Reading a key you never
  wrote (`a[-1]`) gives undefined; pushed through arithmetic it becomes NaN, and
  `NaN>0` is false, so the "no data" case falls through to the `:` branch with zero
  guard bytes. Submission-validated on Don't Panic ep. 1: the `-1 -1 NONE` sentinel
  line needed no special case — `(a[f]-+p)*s>0?"BLOCK":"WAIT"` emits `WAIT` by itself.
- **Multiply by a ±1 sign instead of comparing twice — it gets `==` right for free.**
  For "act iff moving away from target": `(t-p)*(dir?-1:1)>0`. The tempting
  `t<p==dir` forms are shorter-looking but wrong on `t==p` (one direction always
  lands on the acting branch); the product is 0 there, which is falsy — correct,
  and cheaper than patching equality with `<=`/`>=` pairs.
- `m=k+.5|0` rounds any plausible `k>-.5` — 4 bytes shorter than `Math.round(k)`.
- **Classify a growth curve with ONE log-log slope instead of fitting every candidate.**
  `k=L(+t2/+t1)/L(+n2/+n1)` between two samples: `k+.5|0` is the polynomial exponent
  (0/1/2/3, huge for `2^n`) and the fractional part (`k-m>.04`) flags a `log n` factor.
  Base it on the SECOND sample, not the first — the smallest measurement is distorted
  by constant overhead (verified locally, Blunder ep. 3: 447 B → 209 B vs a full
  8-candidate regression, robust to ±0.5% noise and large offsets in synthetic tests).

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
- **Refill-on-empty with `||=` merges "for each line" × "consume the line" into ONE
  loop.** When the per-line work shrinks its string to empty (prefix teardown, char
  eating), `for(readline();t||=readline();t=t.slice(0,-1))<work on t>` reads the next
  line only when `t` is exhausted and stops at EOF for free — deleting both the nested
  loop header and the whole `n=+readline();for(;n--;)` counter. The leading bare
  `readline()` in the init slot discards an unneeded count line. Submission-validated
  at **86 B** on Telephone Numbers. If reading past EOF must be avoided, the counted
  fallback is `t||=n--&&readline()` (`n--` is both counter and stop guard: at 0 it
  assigns `0`, falsy, ending the loop) — verified locally at 95 B.

## 5. Conditionals & boolean logic

- Ternary over `if/else`: `x=c?a:b`.
- Short-circuit instead of `if`: `c&&f()` runs `f()` when `c` truthy; `c||f()` when falsy.
- Default values: `x=read()||d`.
- Chain side effects: `c?(a++,b--):0`.
- `!0` / `!1` for `true` / `false` (2 bytes vs 4/5).
- Assign inside the condition you test: `(b=read())?use(b):0` reads and tests in one.
- **Logical assignment `||=`/`??=` compiles on CodinGame's TS** (TS 4.0+) and
  short-circuits: the RHS only evaluates when the target is falsy. Two payoffs in
  one operator — lazy refill (`t||=readline()` reads only when needed) and
  mark-first-time (`o[t]||=++r` increments only on new keys). Submission-validated
  on Telephone Numbers.
- Replace nested ternaries with a lookup: `[v0,v1,v2][i]` or `({a:1,b:2})[k]`
  (object-literal-indexed-by-string compiles — implicit `any` is on).
- A char-keyed lookup does double duty as a set-membership test: with
  `F={S:w,E:1,N:-w,W:-1}`, `F[x]?d=x:...` both detects a direction char and applies
  it — no `"SENW".indexOf` (verified locally, Blunder ep. 1).
- **"Keep the current choice unless invalid, else first valid by priority" is one
  `find`**: `d=[d,...P].find(ok)`. Starting `d` UNdeclared is correct for free (the
  undefined candidate fails `ok`, so the first pass falls through to pure priority
  order — deletes the `d="S"` init). Invert priorities with `P.reverse()`. The `ok`
  callback can also leak the inspected cell (`(x=g[p+F[c]])!="#"&&...`) so the
  destination char is already in `x` after the move (verified locally, Blunder ep. 1).
- **Simulation loop detection: a step budget beats a visited-set.** `for(;cond&&k--;)`
  with `k=1e4`, then `console.log(~k?O:"LOOP")` — `~k` is 0 exactly when the budget
  ran out. Pick the budget ≫ any legitimate path but small enough to stay in the time
  limit (verified locally, Blunder ep. 1).

## 6. Strings

- Template literals to interpolate: `` `x=${v}` `` beats `"x="+v`.
- ⚠️ Tagged-template *arguments* (``s.split`,` ``, ``"ab".repeat`3` ``) are a JS golf
  staple but **fail TS type-checking** (TS2769) — use `s.split(",")`, `"ab".repeat(3)`.
- `[...s]` to split a string into characters (beats `s.split("")`).
- `s[i]` for a single char; `s.at(-1)` or `s[s.length-1]` for the last.
- Compare chars directly: `s[3]=="A"`.
- **Discriminate keywords by length via indexing**: when one keyword is longer than
  the others, index past the short ones' end — `d[4]` is `"T"` for `"RIGHT"` but
  undefined for `"LEFT"`/`"NONE"`, so `d[4]?-1:1` beats `d<"R"?-1:1` by a byte and
  needs no quotes. (Submission-validated on Don't Panic ep. 1.)
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
- **Pick a keyword by its first letter with a regex on a packed string**:
  `"SOUTH EAST NORTH WEST".match(d+"\\w+")` — in a `+` concatenation the match array
  coerces to the bare word, so no `[0]` and no `{S:"OUTH",...}` suffix map. `\w` stops
  at the space separators (verified locally, Blunder ep. 1). Inline the string if used
  once — a `Z=` alias only pays from 2 uses.
- Compose output names from parts instead of listing them: `"n^"+m` with ternary
  edges (`m>3?"2^n":m>1?"n^"+m:"n"`) beat the literal 8-entry complexity-name array
  by ~35 B on Blunder ep. 3 (verified locally).
- When writing a "cleared" marker into a grid, ANY value passing your own free-cell
  test works — reusing a live string variable (e.g. the output accumulator,
  `g[p]=O`) is 2 bytes shorter than `" "`; just check every branch that can later
  re-read that cell stays a no-op (verified locally, Blunder ep. 1).

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
- **Fold an in-place `.sort()` into the expression that consumes it.** `.sort()`
  returns the (now-sorted) array, so a standalone sort statement is wasted bytes:
  `X.sort(f)[n-1]-X[0]` sorts then indexes the max in one go, and `Y.sort(f).reduce(...)`
  sorts inline. Multiple sorts can ride a single expression via argument-evaluation
  order — e.g. `Y.sort(f).reduce(cb, X.sort(f)[n-1]-X[0])` sorts `Y` (the receiver),
  then sorts `X` while evaluating the seed, before `reduce` runs. Share one comparator
  `f=(a,b)=>a-b` across both.
- **Order string arithmetic to keep it numeric.** With numeric-string operands,
  `a-b+s` stays a number (`a-b` subtracts first, then `+s` adds), but `s+a-b`
  concatenates (`number + string` → string). Put a `-` first to avoid stray
  parentheses around the coercion.
- **Σ|yᵢ − median| without `Math.abs` or a median lookup.** Sort, then pair ends:
  `Σ_{i<n/2}(Y[n-1-i] − Y[i])` (use `Y[n+~i]` for `Y[n-1-i]`). Self-correcting for odd
  `n` — the middle element pairs with itself → 0 — so no special-casing. Beats both
  `reduce((s,v)=>s+Math.abs(v-Y[n>>1]),0)` and the sign-weighted `v*Math.sign(2*i-n+1)`.
- Membership: `~a.indexOf(x)` is truthy when present (avoids `>=0`); `!~a.indexOf(x)`
  tests absence; or `a.includes(x)`.
- **Reuse the header array as your map/storage.** The `readline().split(" ")` array
  holding the init line is a perfectly good dictionary once its values are consumed:
  overwrite dead indices (`a[a[3]]=a[4]`, then `a[f]=p` per data line) instead of
  declaring `E=[]`. Saves the whole extra declaration; valid as long as every key you
  later *read* has been overwritten (leftover header values at unread indices are
  harmless). Submission-validated on Don't Panic ep. 1.
- **Argmax via pair-sort — tag each value with its index, sort, read the index off
  the winner.** When values are single digits (or any fixed width) and you need the
  *position* of the max, skip the `reduce`/max-tracking entirely: build equal-length
  strings `value+index` and let the default lexicographic sort do the numeric
  comparison — `[..."01234567"].map(i=>readline()+i).sort()[7][1]`. Equal-length
  strings sort numerically for free, and the index travels with the value through
  the sort. Verified at **69 B** on The Descent (vs 79 B for the
  `.reduce((p,c,i,a)=>a[p]<c?i:p,0)` argmax). Ties resolve to the *last* max index
  (larger index sorts later) — fine when any tied max is accepted. Needs every pair
  the same length: 1-digit values + 1-digit indices, or pad.
- **Count distinct strings with an object + counter, not a Set.** `o[t]||=++r` then
  `console.log(r)`: `var o={}` is 4 B shorter than `var s=new Set`, `o[t]||=++r` only
  1 B longer than `s.add(t)`, and `console.log(r)` 5 B shorter than
  `console.log(s.size)` — ~8 B net. Safe when keys can't be falsy `""`/`"0"`-as-only
  or prototype names (digit strings are fine; the stored `++r` starts at 1, always
  truthy). For "number of trie nodes" = distinct prefixes, tear each word down with
  `t=t.slice(0,-1)` instead of growing `p+=c` — no per-line `p=""` reset (combines
  with the §4 refill-on-empty loop; submission-validated at **86 B** on Telephone
  Numbers).
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

- The judge **often** trims a trailing newline, but do **not** assume it trims a
  trailing *space* — some puzzles reject it (confirmed on Chuck Norris /
  chuck-norris-codesize). ⚠️ `verify.mjs`'s `norm()` strips trailing whitespace
  before comparing, so a stray trailing space still shows `MATCH ✅` while CodinGame
  rejects it. Never delete `.trim()` / your final-separator handling on the strength
  of `MATCH` alone. To check, inspect the **raw output bytes** (run the program and
  assert `out===expected` with a non-normalized compare and `/ $/.test(out)===false`),
  not just the verifier's MATCH. Internal spacing is never trimmed — match the output
  format exactly (spaces between tokens, capitalization, etc.).
- Some puzzles feed input via several lines with counts; read them in the precise
  order the statement lists, or everything shifts by one.
- `console.log` of an array prints comma-separated without brackets — sometimes that
  is exactly the required format and saves a manual `.join(',')`.
- Floating-point output: if the puzzle wants rounding, `Math.round`, `.toFixed(n)`
  (returns a string), or `+x.toFixed(n)` to drop trailing zeros — pick by spec.
- `for(;l=readline();)` read-till-EOF loops are fine on CodinGame (falsy at EOF) but
  `verify.mjs`'s shim THROWS at EOF, killing the program before it prints anything.
  Verify a twin with `R=()=>{try{return readline()}catch(e){}}` in place of the bare
  `readline`/alias (identical behavior to CG), then type-check the stripped final
  form on its own — same twin protocol as for `for(;;)` flood-printing (used on
  Blunder ep. 1 and 3).
- CodinGame both **type-checks** (rejects compile errors) and **runs** your code, so
  there are two ways to fail. Always run `scripts/verify.mjs` — it does both — before
  reporting a byte count.
