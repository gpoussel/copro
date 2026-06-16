// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

using System;

class Solution
{
    static void Main()
    {
        Console.ReadLine();
        var a = Array.ConvertAll(Console.ReadLine().Trim().Split(' '), long.Parse);
        int left = 0, right = a.Length - 1;
        long best = 0;
        while (left < right)
        {
            long h = Math.Min(a[left], a[right]);
            long area = h * (right - left);
            if (area > best) best = area;
            if (a[left] < a[right]) left++; else right--;
        }
        Console.WriteLine(best);
    }
}
