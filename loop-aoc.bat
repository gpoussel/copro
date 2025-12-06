@echo off
setlocal enableDelayedExpansion

set "year=2022"
REM Set max days based on year (12 for 2025+, 25 for earlier years)
if !year! geq 2025 (
    set "maxDay=12"
) else (
    set "maxDay=25"
)
REM Loop through days 1 to maxDay
for /l %%d in (1,1,!maxDay!) do (
    set "day=%%d"
    REM Pad day with leading zero
    set "pday=0!day!"
    set "pday=!pday:~-2!"
    echo !year!/!pday!

    CALL pnpm start aoc !year! !day!
    CALL aoc download --day !day! --year !year! --overwrite --input-only --input-file "E:\dev-oss\copro\src\contests\aoc\years\!year!\!pday!\input"
)
