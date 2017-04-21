using System;
using XMatrix.Judge;

namespace XMatrix
{
    class Program
    {
        static void Main(string[] args)
        {
            int pid;
            try
            {
                pid = int.Parse(args[0]);
            }
            catch
            {
                Console.WriteLine("Invalid Parameter.");
                return;
            }
            bool result = Compare.FileStringCompare(string.Format(@"..\test\{0}\std.txt", args[0]), @"..\test\output.txt");
            Grade g = new Grade(pid, @"..\test\compiler.txt", result);
            g.Json(string.Format(@"..\test\{0}.json", args[0]));
        }
    }
}
