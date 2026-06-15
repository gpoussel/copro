// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

using System;
using System.Globalization;

class Solution
{
    static void Main()
    {
        Console.ReadLine();
        var r = Array.ConvertAll(Console.ReadLine().Trim().Split(' '),
            s => double.Parse(s, CultureInfo.InvariantCulture));
        double reflected = 0.0;
        for (int i = r.Length - 1; i >= 0; i--)
        {
            double ri = r[i];
            double denom = 1 - ri * reflected;
            reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom);
        }
        Console.WriteLine(reflected.ToString("F4", CultureInfo.InvariantCulture));
    }
}
