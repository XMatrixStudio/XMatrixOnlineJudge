using System;
using System.Diagnostics;
using XMatrix.Judge;

namespace XMatrix
{
    class Program
    {
        static void Main(string[] args)
        {
            int uid, pid, std_test_num;
            try
            {
                uid = int.Parse(args[0]);
                pid = int.Parse(args[1]);
                std_test_num = int.Parse(args[2]);
            }
            catch
            {
                Console.WriteLine("Invalid Parameter.");
                return;
            }
            JudgeProcess judge = new JudgeProcess(uid, pid, std_test_num);
            judge.shell = "sh";
            judge.DoJudge();
        }
    }
}
