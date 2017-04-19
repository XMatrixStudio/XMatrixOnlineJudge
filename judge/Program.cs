using System;
using judge;

namespace xmatrix
{
    class Program
    {
        /// <summary>
        ///  Main Function
        /// </summary>
        /// <param name="args">get the judging id from CGI</param>
        static void Main(string[] args)
        {
            try
            {
                Console.WriteLine("The judge result of {0} is:", args[0]);
            }
            catch
            {
                Console.WriteLine("Invalid Parameter.");
                return;
            }
            Compare cmp = new Compare();
            bool result = cmp.FileStringCompare(string.Format(@"..\test\{0}\std.txt", args[0]), @"..\test\output.txt");
            if (result)
            {
                Console.WriteLine("Accept.");
            }
            else
            {
                Console.WriteLine("Wrong Answer.");
            }
        }
    }
}
