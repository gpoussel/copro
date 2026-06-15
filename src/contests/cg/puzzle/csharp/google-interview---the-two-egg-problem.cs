// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

using System;

class Solution
{
    static void Main()
    {
        long n = long.Parse(Console.ReadLine().Trim());
        long k = 0;
        while (k * (k + 1) / 2 < n) k++;
        Console.WriteLine(k);
    }
}
