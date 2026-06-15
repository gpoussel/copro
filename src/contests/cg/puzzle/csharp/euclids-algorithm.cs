// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

using System;

class Solution
{
    static void Main()
    {
        var parts = Console.ReadLine().Trim().Split(' ');
        long a = long.Parse(parts[0]), b = long.Parse(parts[1]);
        long x = a, y = b;
        while (y != 0)
        {
            long q = x / y;
            long r = x % y;
            Console.WriteLine($"{x}={y}*{q}+{r}");
            x = y;
            y = r;
        }
        Console.WriteLine($"GCD({a},{b})={x}");
    }
}
