' 🎮 CodinGame Puzzle - max-area
' https://www.codingame.com/training/easy/max-area

Imports System

Module Solution
    Sub Main()
        Console.ReadLine()
        Dim tokens() As String = Console.ReadLine().Trim().Split(" "c)
        Dim a(tokens.Length - 1) As Long
        For i As Integer = 0 To tokens.Length - 1
            a(i) = Long.Parse(tokens(i))
        Next
        Dim left As Integer = 0, right As Integer = a.Length - 1
        Dim best As Long = 0
        While left < right
            Dim h As Long = Math.Min(a(left), a(right))
            Dim area As Long = h * (right - left)
            If area > best Then best = area
            If a(left) < a(right) Then
                left += 1
            Else
                right -= 1
            End If
        End While
        Console.WriteLine(best)
    End Sub
End Module
