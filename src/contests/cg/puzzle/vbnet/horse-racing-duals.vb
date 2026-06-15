' 🎮 CodinGame Puzzle - horse-racing-duals
' https://www.codingame.com/training/easy/horse-racing-duals

Imports System

Module Solution
    Sub Main()
        Dim n As Integer = Integer.Parse(Console.ReadLine().Trim())
        Dim s(n - 1) As Integer
        For i As Integer = 0 To n - 1
            s(i) = Integer.Parse(Console.ReadLine().Trim())
        Next
        Array.Sort(s)
        Dim minDiff As Integer = Integer.MaxValue
        For i As Integer = 1 To n - 1
            Dim diff As Integer = s(i) - s(i - 1)
            If diff < minDiff Then minDiff = diff
        Next
        Console.WriteLine(minDiff)
    End Sub
End Module
