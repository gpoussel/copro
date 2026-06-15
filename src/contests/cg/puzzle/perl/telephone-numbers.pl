# 🎮 CodinGame Puzzle - telephone-numbers
# https://www.codingame.com/training/medium/telephone-numbers

my $n = <STDIN>;
chomp $n;
my %root;
my $cable = 0;
for (1 .. $n) {
    my $number = <STDIN>;
    $number =~ s/\s+$//;
    my $node = \%root;
    for my $d (split //, $number) {
        if (!exists $node->{$d}) {
            $node->{$d} = {};
            $cable++;
        }
        $node = $node->{$d};
    }
}
print "$cable\n";
