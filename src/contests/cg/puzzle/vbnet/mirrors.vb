' 🎮 CodinGame Puzzle - mirrors
' https://www.codingame.com/training/easy/mirrors

Imports System
Imports System.Globalization

Module Solution
    Sub Main()
        Console.ReadLine()
        Dim tokens() As String = Console.ReadLine().Trim().Split(" "c)
        Dim r(tokens.Length - 1) As Double
        For i As Integer = 0 To tokens.Length - 1
            r(i) = Double.Parse(tokens(i), CultureInfo.InvariantCulture)
        Next
        Dim reflected As Double = 0.0
        For i As Integer = r.Length - 1 To 0 Step -1
            Dim ri As Double = r(i)
            Dim denom As Double = 1 - ri * reflected
            If denom = 0 Then
                reflected = ri
            Else
                reflected = ri + ((1 - ri) * (1 - ri) * reflected) / denom
            End If
        Next
        Console.WriteLine(reflected.ToString("F4", CultureInfo.InvariantCulture))
    End Sub
End Module
