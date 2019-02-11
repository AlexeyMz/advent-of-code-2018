using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AlexeyMz.AoC2018
{
    public class Day9
    {
        public static async Task Run()
        {
            string content = await File.ReadAllTextAsync("./input/day9.txt");
            string input = content.Trim();
            var match = new Regex(@"^(\d+) players; last marble is worth (\d+) points$").Match(input);
            if (!match.Success) {
                throw new Exception("Cannot match input");
            }
            int playerCount = int.Parse(match.Groups[1].Value);
            long maxMarbleScore = long.Parse(match.Groups[2].Value);

            long maxNormalScore = SimulateUsingLinkedLists(playerCount, maxMarbleScore);
            Console.WriteLine($"Max normal score: {maxNormalScore}");

            long max100Score = SimulateUsingLinkedLists(playerCount, maxMarbleScore * 100, true);
            Console.WriteLine($"Max x100 score: {max100Score}");
        }

        public static long SimulateGame(int playerCount, long maxMarbleScore, bool log = false)
        {
            var score = new long[playerCount];
            var field = new List<long>() { 0 };
            int currentAt = 0;
            long logInterval = (long)Math.Ceiling(maxMarbleScore / 20.0);

            for (long marble = 1; marble <= maxMarbleScore; marble++) {
                if (marble % 23 == 0) {
                    int playerIndex = (int)Remainder(marble - 1, score.Length);
                    score[playerIndex] += marble;
                    int removeAt = (int)Remainder(currentAt - 7, field.Count);
                    score[playerIndex] += field[removeAt];
                    field.RemoveAt(removeAt);
                    currentAt = (int)Remainder(removeAt, field.Count);
                } else {
                    int placeAt = (int)Remainder(currentAt + 2, field.Count);
                    if (placeAt == 0) {
                        field.Add(marble);
                        currentAt = field.Count - 1;
                    } else {
                        field.Insert(placeAt, marble);
                        currentAt = placeAt;
                    }
                }

                if (log && marble % logInterval == 0) {
                    Console.WriteLine($"{Math.Floor(100.0 * marble / maxMarbleScore)}%");
                }
            }

            return score.Max();
        }

        private static long Remainder(long divident, long divisor)
        {
            if (divisor <= 0) {
                throw new Exception("Divisor should be >= 0");
            }
            long modulo = divident % divisor;
            return modulo >= 0 ? modulo : (modulo + divisor);
        }

        public static long SimulateUsingLinkedLists(int playerCount, long maxMarbleScore, bool log = false)
        {
            var score = new long[playerCount];
            var field = new Node<long>(0L);
            long logInterval = (long)Math.Ceiling(maxMarbleScore / 20.0);

            for (long marble = 1; marble <= maxMarbleScore; marble++) {
                if (marble % 23 == 0) {
                    int playerIndex = (int)Remainder(marble - 1, score.Length);
                    score[playerIndex] += marble;
                    var shifted = field.Shift(-7);
                    score[playerIndex] += shifted.Value;
                    field = shifted.RemoveThenShiftToNext();
                } else {
                    field = field.Shift(1).InsertAfterAndShiftTo(marble);
                }

                if (log && marble % logInterval == 0) {
                    Console.WriteLine($"{Math.Floor(100.0 * marble / maxMarbleScore)}%");
                }
            }

            return score.Max();
        }

        class Node<T>
        {
            public Node<T> Previous { get; set; }
            public Node<T> Next { get; set; }
            public T Value { get; }
            public Node(T value)
            {
                Previous = this;
                Next = this;
                Value = value;
            }

            public Node<T> Shift(int shift)
            {
                var current = this;
                if (shift > 0) {
                    for (int i = 0; i < shift; i++) {
                        current = current.Next;
                    }
                } else if (shift < 0) {
                    for (int i = 0; i < -shift; i++) {
                        current = current.Previous;
                    }
                }
                return current;
            }

            public Node<T> InsertAfterAndShiftTo(T value)
            {
                var added = new Node<T>(value) { Previous = this, Next = this.Next };
                this.Next.Previous = added;
                this.Next = added;
                return added;
            }

            public Node<T> RemoveThenShiftToNext()
            {
                if (this.Next == this) {
                    throw new InvalidOperationException("Cannot remove node from list with one element");
                }
                this.Next.Previous = this.Previous;
                this.Previous.Next = this.Next;
                return this.Next;
            }
        }
    }
}
