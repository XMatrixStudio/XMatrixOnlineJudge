using System;

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
            if (args[0] != null)
            {
                Console.WriteLine("$QUERY_STRING is " + args[0]);
            }
        }
    }
}
