' 🎮 CodinGame Puzzle - teds-compiler
' https://www.codingame.com/training/easy/teds-compiler

Imports System

Module Solution
    Sub Main()
        Dim line As String = Console.ReadLine().TrimEnd()
        Dim balance As Integer = 0, best As Integer = 0
        For i As Integer = 0 To line.Length - 1
            If line(i) = "<"c Then
                balance += 1
            Else
                balance -= 1
            End If
            If balance < 0 Then Exit For
            If balance = 0 Then best = i + 1
        Next
        Console.WriteLine(best)
    End Sub
End Module
