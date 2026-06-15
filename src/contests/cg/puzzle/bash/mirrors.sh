# 🎮 CodinGame Puzzle - mirrors
# https://www.codingame.com/training/easy/mirrors

# Reflection folds right-to-left; awk gives the double precision this needs.
awk '
NR == 1 { next }
NR == 2 {
    reflected = 0
    for (i = NF; i >= 1; i--) {
        ri = $i
        denom = 1 - ri * reflected
        if (denom == 0) reflected = ri
        else reflected = ri + ((1 - ri) * (1 - ri) * reflected) / denom
    }
    printf "%.4f\n", reflected
}
'
