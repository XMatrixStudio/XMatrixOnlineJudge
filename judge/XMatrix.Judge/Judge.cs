using System;
using System.IO;
using System.Diagnostics;

namespace XMatrix.Judge
{
    public class JudgeProcess
    {
        private int uid;
        private int pid;
        private int std_test_num;
        private Grade grade;

        public JudgeProcess(int _uid, int _pid, int _std_test_num)
        {
            uid = _uid;
            pid = _pid;
            std_test_num = _std_test_num;
            grade = new Grade(uid, pid, std_test_num);
        }

        public bool DoJudge()
        {
            string compile;
            using (StreamReader sr = File.OpenText(@"..\test\compiler.txt"))
            {
                compile = sr.ReadToEnd();
            }
            if (compile != string.Empty)
            {
                grade.SetCompile(compile);
                return false;
            }
            for (int i = 0; i < std_test_num; i++)
            {
                Compare cmp = new Compare(string.Format(@"..\test\{0}\std{1}.txt", pid, i), string.Format(@"..\test\out{0}.txt", i));
                if (cmp.FileStringCompare())
                {
                    grade.SetResult(i, "Accept");
                }
                else if (cmp.FileFormatCompare())
                {
                    grade.SetResult(i, "Presentation Error");
                }
                else
                {
                    grade.SetResult(i, "Wrong Answer");
                }
            }
            grade.ToJson(string.Format(@"..\test\{0}.json", pid));
            return true;
        }
    }
}