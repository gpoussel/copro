' 🎮 CodinGame Puzzle - distributing-candy
' https://www.codingame.com/training/easy/distributing-candy

Imports System

Module Solution
    Sub Main()
        Dim first() As String = Console.ReadLine().Trim().Split(" "c)
        Dim n As Integer = Integer.Parse(first(0))
        Dim m As Integer = Integer.Parse(first(1))
        Dim tokens() As String = Console.ReadLine().Trim().Split(" "c)
        Dim candies(tokens.Length - 1) As Integer
        For i As Integer = 0 To tokens.Length - 1
            candies(i) = Integer.Parse(tokens(i))
        Next
        Array.Sort(candies)
        Dim best As Integer = Integer.MaxValue
        Dim i2 As Integer = 0
        While i2 + m - 1 < n
            Dim diff As Integer = candies(i2 + m - 1) - candies(i2)
            If diff < best Then best = diff
            i2 += 1
        End While
        Console.WriteLine(best)
    End Sub
End Module
