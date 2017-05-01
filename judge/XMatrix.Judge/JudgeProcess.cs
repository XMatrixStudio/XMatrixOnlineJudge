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
        public string shell;

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
            Shell.CallShell(shell, string.Format(@"cd ../test; gcc {0}_{1}.c > compiler.txt 2>&1 -o a.exe;", uid, pid));
            using (StreamReader sr = File.OpenText(@"..\test\compiler.txt"))
            {
                compile = sr.ReadToEnd();
            }
            if (compile != string.Empty)
            {
                grade.SetCompile(compile);
                grade.ToJson(string.Format(@"..\test\{0}_{1}.json", uid, pid));
                return false;
            }
            for (int i = 0; i < std_test_num; i++)
            {
                Shell.CallShellWithReIO(shell, string.Format("cd ../test; ./a.exe ", i),
                    string.Format(@"../test/{0}/in{1}.txt", pid, i), string.Format(@"../test/out{0}.txt", i));
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
            grade.ToJson(string.Format(@"..\test\{0}_{1}.json", uid, pid));
            return true;
        }
    }
}