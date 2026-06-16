# 🎮 CodinGame Puzzle - mirrors
# https://www.codingame.com/training/easy/mirrors

<STDIN>;
my @r = split ' ', <STDIN>;
my $reflected = 0.0;
for (my $i = $#r; $i >= 0; $i--) {
    my $ri = $r[$i];
    my $denom = 1 - $ri * $reflected;
    $reflected = $ri + ($denom == 0 ? 0 : ((1 - $ri) * (1 - $ri) * $reflected) / $denom);
}
printf "%.4f\n", $reflected;
