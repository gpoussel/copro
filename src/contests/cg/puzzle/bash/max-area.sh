# 🎮 CodinGame Puzzle - max-area
# https://www.codingame.com/training/easy/max-area

read _
read -a arr
left=0
right=$(( ${#arr[@]} - 1 ))
best=0
while (( left < right )); do
    if (( arr[left] < arr[right] )); then h=${arr[left]}; else h=${arr[right]}; fi
    area=$(( h * (right - left) ))
    (( area > best )) && best=$area
    if (( arr[left] < arr[right] )); then ((left++)); else ((right--)); fi
done
echo "$best"
