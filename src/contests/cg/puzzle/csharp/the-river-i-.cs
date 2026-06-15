// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

using System;

class Solution
{
    static long DigitSum(long x)
    {
        long s = 0;
        while (x > 0)
        {
            s += x % 10;
            x /= 10;
        }
        return s;
    }

    static void Main()
    {
        long a = long.Parse(Console.ReadLine().Trim());
        long b = long.Parse(Console.ReadLine().Trim());
        while (a != b)
        {
            if (a < b) a += DigitSum(a); else b += DigitSum(b);
        }
        Console.WriteLine(a);
    }
}
