# 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
# https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

my $n = <STDIN>;
chomp $n;
my $k = 0;
$k++ while ($k * ($k + 1) / 2 < $n);
print "$k\n";
