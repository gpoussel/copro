@echo off
setlocal enableDelayedExpansion

set "year=2019"
REM Loop through days 1 to 25
for /l %%d in (1,1,25) do (
    set "day=%%d"
    REM Pad day with leading zero
    set "pday=0!day!"
    set "pday=!pday:~-2!"
    echo !year!/!pday!

    CALL pnpm start aoc !year! !day!
    CALL aoc download --day !day! --year !year! --overwrite --input-only --input-file "E:\dev-oss\copro\src\contests\aoc\years\!year!\!pday!\input"
)
