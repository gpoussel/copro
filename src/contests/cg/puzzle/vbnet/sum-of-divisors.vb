' 🎮 CodinGame Puzzle - sum-of-divisors
' https://www.codingame.com/training/medium/sum-of-divisors

Imports System

Module Solution
    Sub Main()
        ' d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
        ' sum of divisors is sum over d of d * floor(n/d).
        Dim n As Long = Long.Parse(Console.ReadLine().Trim())
        Dim total As Long = 0
        For d As Long = 1 To n
            total += d * (n \ d)
        Next
        Console.WriteLine(total)
    End Sub
End Module
