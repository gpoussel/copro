# 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
# https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

read n
k=0
while (( k * (k + 1) / 2 < n )); do
    ((k++))
done
echo "$k"
