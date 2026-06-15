// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

using System;

class Solution
{
    static void Main()
    {
        long n = long.Parse(Console.ReadLine().Trim());
        // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
        long inner = n >= 2 ? n - 2 : 0;
        Console.WriteLine(n * n * n - inner * inner * inner);
    }
}
