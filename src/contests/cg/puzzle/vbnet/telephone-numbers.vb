' 🎮 CodinGame Puzzle - telephone-numbers
' https://www.codingame.com/training/medium/telephone-numbers

Imports System
Imports System.Collections.Generic

Module Solution
    Sub Main()
        Dim n As Integer = Integer.Parse(Console.ReadLine().Trim())
        Dim root As New Dictionary(Of Char, Object)()
        Dim cable As Integer = 0
        For i As Integer = 0 To n - 1
            Dim number As String = Console.ReadLine().Trim()
            Dim node As Dictionary(Of Char, Object) = root
            For Each d As Char In number
                If Not node.ContainsKey(d) Then
                    node(d) = New Dictionary(Of Char, Object)()
                    cable += 1
                End If
                node = CType(node(d), Dictionary(Of Char, Object))
            Next
        Next
        Console.WriteLine(cable)
    End Sub
End Module
