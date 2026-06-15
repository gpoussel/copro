' 🎮 CodinGame Puzzle - the-descent
' https://www.codingame.com/training/easy/the-descent

Imports System

Module Solution
    Sub Main()
        ' Game loop: each turn, read 8 mountain heights and fire on the tallest one.
        While True
            Dim maxHeight As Integer = -1, maxIndex As Integer = 0
            For i As Integer = 0 To 7
                Dim h As Integer = Integer.Parse(Console.ReadLine().Trim())
                If h > maxHeight Then
                    maxHeight = h
                    maxIndex = i
                End If
            Next
            Console.WriteLine(maxIndex)
        End While
    End Sub
End Module
