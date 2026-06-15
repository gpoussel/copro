// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

using System;

class Solution
{
    static void Main()
    {
        string line = Console.ReadLine().TrimEnd();
        int balance = 0, best = 0;
        for (int i = 0; i < line.Length; i++)
        {
            if (line[i] == '<') balance++; else balance--;
            if (balance < 0) break;
            if (balance == 0) best = i + 1;
        }
        Console.WriteLine(best);
    }
}
