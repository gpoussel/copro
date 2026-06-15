# 🎮 CodinGame Puzzle - rubik
# https://www.codingame.com/training/medium/rubik

read n
# Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
if (( n >= 2 )); then inner=$((n - 2)); else inner=0; fi
echo $((n * n * n - inner * inner * inner))
